#!/usr/bin/env python3
"""Build a rebuild-record recipe from a REAL user's project and its own
wiring trace.

    PGPASSWORD=... python3 scripts/trace-recipe.py <project-id-prefix>... -o out.json

Two different sources, on purpose:

  * the NETLIST comes from the saved project -- that is the circuit that
    actually compiles and runs, and it is what the recorder must end up with;
  * the ORDER comes from that project's own `wire_added` trace in
    pro_engagement_events, so the video wires it the way its author did,
    pauses included (`humanGapSec`, which rebuild-record.mjs paces on).

Trace rows carry instance ids that usually do NOT survive into the saved
project -- users rebuild a circuit several times and every id is
timestamp-derived. So wires are matched on TYPE + PIN, with the type read
off `components_json`'s metadataId, which is also the key into
scripts/catalog.json (`id` there) for the picker card name.

The sketch is read from disk (data/projects/<id>/<group>/sketch.*); the
projects.code column is a legacy fallback that can be stale.
"""
import argparse, base64, json, os, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CATALOG = {c["id"]: c for c in json.loads((HERE / "catalog.json").read_text())}
DATA = Path(os.environ.get("VELXIO_DATA", "/home/dave/velxio-prod/data"))


def q(sql):
    """One scalar, base64'd so JSON columns survive psql's text format."""
    out = subprocess.run(
        ["psql", "-h", os.environ.get("PGHOST", "127.0.0.1"),
         "-U", os.environ.get("PGUSER", "velxio"),
         "-d", os.environ.get("PGDATABASE", "velxio_main"), "-tAc",
         f"select encode(convert_to(coalesce(({sql})::text,''),'UTF8'),'base64')"],
        capture_output=True, text=True, check=True).stdout
    return base64.b64decode(out.replace("\n", "")).decode()


def sketch_from_disk(pid):
    d = DATA / "projects" / pid
    if not d.is_dir():
        return None
    files = sorted(d.rglob("sketch.*")) or sorted(d.rglob("main.py"))
    return files[0].read_text(errors="replace") if files else None


def recipe_for(prefix):
    proj = json.loads(q(f"""select row_to_json(t) from (
      select id, name, board_type, code, components_json, wires_json
      from projects where id like '{prefix}%' limit 1) t"""))
    comps = json.loads(proj["components_json"] or "[]")
    wires = json.loads(proj["wires_json"] or "[]")
    meta_of = {c["id"]: c["metadataId"] for c in comps}

    def sig(a_id, a_pin, b_id, b_pin):
        def side(cid, pin):
            t = meta_of.get(cid) or (cid.rsplit("_", 2)[0] if "_" in cid else cid)
            return (t, pin)
        return tuple(sorted([side(a_id, a_pin), side(b_id, b_pin)]))

    trace = json.loads(q(f"""select coalesce(json_agg(row_to_json(t)),'[]'::json) from (
      select extract(epoch from created_at) ts, metadata_json
      from pro_engagement_events
      where project_id like '{prefix}%' and event='wire_added'
      order by created_at) t"""))

    first, gaps, prev = {}, {}, None
    for ev in trace:
        m = json.loads(ev["metadata_json"] or "{}")
        if not m.get("start_pin") or not m.get("end_pin"):
            continue                       # drag / breadboard auto-connect noise
        s = sig(m["start_component"], m["start_pin"], m["end_component"], m["end_pin"])
        if s not in first:
            first[s] = ev["ts"]
            gaps[s] = None if prev is None else round(ev["ts"] - prev, 1)
        prev = ev["ts"]

    def key(w):
        return sig(w["start"]["componentId"], w["start"]["pinName"],
                   w["end"]["componentId"], w["end"]["pinName"])

    matched = sorted((w for w in wires if key(w) in first), key=lambda w: first[key(w)])
    ordered = matched + [w for w in wires if key(w) not in first]
    code = sketch_from_disk(proj["id"]) or proj["code"] or ""

    slug = "trace-" + "".join(
        ch if ch.isalnum() else "-" for ch in proj["name"].lower()).strip("-")[:40]
    return {
        "id": slug,
        "title": proj["name"],
        "description": f"Rebuilt from a real user session (project {proj['id'][:8]})",
        "boardType": proj["board_type"],
        "boardLabel": proj["board_type"],
        "code": code,
        "components": [
            {"type": CATALOG[c["metadataId"]]["tagName"],
             "card": CATALOG[c["metadataId"]]["name"],
             "id": c["id"], "x": c["x"], "y": c["y"],
             "properties": c.get("properties", {})}
            for c in comps if c["metadataId"] in CATALOG
        ],
        "wires": [
            {"id": w.get("id"),
             "start": {"componentId": w["start"]["componentId"],
                       "pinName": w["start"]["pinName"]},
             "end": {"componentId": w["end"]["componentId"],
                     "pinName": w["end"]["pinName"]},
             "color": w.get("color", "#22cc66"),
             "humanGapSec": gaps.get(key(w))}
            for w in ordered
        ],
        "parts": len(comps), "wireCount": len(wires),
        "_matched": len(matched), "_codeFrom": "disk" if sketch_from_disk(proj["id"]) else "column",
    }


ap = argparse.ArgumentParser()
ap.add_argument("projects", nargs="+")
ap.add_argument("-o", "--out", required=True)
a = ap.parse_args()

out = []
for prefix in a.projects:
    r = recipe_for(prefix)
    out.append(r)
    print(f'{r["id"]:44} {r["boardType"]:18} {r["_matched"]}/{len(r["wires"])} wires '
          f'from the trace, code from {r["_codeFrom"]}')
Path(a.out).write_text(json.dumps(out, indent=1))
print(f"-> {a.out}")
