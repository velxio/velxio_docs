// Runs inside the embed page. window.__vx.sim is the simulator store.
// Spreads overlapping parts apart, then routes every wire orthogonally
// around every part AND the board, writing the result as waypoints.
window.__vxTidy = async function (opts = {}) {
  const MARGIN = opts.margin ?? 10;      // clearance around bodies
  const GAP = opts.gap ?? 36;            // min gap between bodies after spreading
  const sim = window.__vx.sim;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const world = document.querySelector(".canvas-world");
  const wr = world.getBoundingClientRect();
  const m = new DOMMatrix(getComputedStyle(world).transform);
  const z = m.a || 1;
  const toWorld = r => ({ x: (r.left - wr.left) / z, y: (r.top - wr.top) / z, w: r.width / z, h: r.height / z });

  const measure = () => {
    const out = [];
    for (const el of document.querySelectorAll(".dynamic-component-wrapper[data-component-id]")) {
      // the wrapper keeps the unrotated box; its first child carries the rotation
      const inner = el.firstElementChild || el;
      const r = toWorld(inner.getBoundingClientRect());
      if (r.w < 2 || r.h < 2) continue;
      out.push({ id: el.getAttribute("data-component-id"), kind: "part", ...r });
    }
    for (const el of document.querySelectorAll("[data-board-id]")) {
      const r = toWorld(el.getBoundingClientRect());
      if (r.w < 2) continue;
      const id = el.getAttribute("data-board-id");
      // a board carries several [data-board-id] overlays (buttons, LEDs): keep the biggest
      const prev = out.find(o => o.id === id);
      if (prev) { if (r.w * r.h > prev.w * prev.h) Object.assign(prev, r); continue; }
      out.push({ id, kind: "board", ...r });
    }
    return out;
  };

  let rects = measure();

  // ---- 0. layout: every part goes to the side of the board its pins leave from ----
  const boards = rects.filter(r => r.kind === "board");
  if (opts.layout !== false && boards.length === 1) {
    const B = boards[0];
    const s = sim.getState();
    const comp = Object.fromEntries(s.components.map(c => [c.id, c]));
    const rect = Object.fromEntries(rects.map(r => [r.id, r]));
    const POWER = /^(GND|GND\d|VCC|VIN|5V|3V3|3\.3V|V\+|VBUS|VSYS|AGND|IOREF)$/i;
    const sideOf = pt => [
      ["L", pt.x - B.x], ["R", B.x + B.w - pt.x], ["U", pt.y - B.y], ["D", B.y + B.h - pt.y],
    ].sort((a, b) => a[1] - b[1])[0][0];
    // groups = parts joined by part-to-part wires (resistor + LED, ...)
    const parent = {};
    const find = a => (parent[a] === a || parent[a] === undefined ? a : (parent[a] = find(parent[a])));
    const unite = (a, b) => { parent[find(a)] = find(b); };
    for (const c of s.components) if (rect[c.id]) parent[c.id] = c.id;
    const isPart = id => id in parent;
    for (const w of s.wires) if (isPart(w.start.componentId) && isPart(w.end.componentId)) unite(w.start.componentId, w.end.componentId);
    const groups = {};
    for (const id of Object.keys(parent)) (groups[find(id)] ||= { ids: [], sig: [], pwr: [] }).ids.push(id);
    const touch = {}; // part -> board pins it reaches directly
    for (const w of s.wires) {
      for (const [p, q] of [[w.start, w.end], [w.end, w.start]]) {
        if (q.componentId !== B.id || !isPart(p.componentId)) continue;
        const g = groups[find(p.componentId)];
        (POWER.test(q.pinName) ? g.pwr : g.sig).push({ x: q.x, y: q.y, side: sideOf(q) });
        (touch[p.componentId] ||= []).push(POWER.test(q.pinName) ? 0 : 1);
      }
    }
    const perSide = { L: [], R: [], U: [], D: [] };
    for (const g of Object.values(groups)) {
      const pins = g.sig.length ? g.sig : g.pwr;
      const cnt = { L: 0, R: 0, U: 0, D: 0 };
      for (const p of pins) cnt[p.side]++;
      g.side = pins.length ? Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0] : "R";
      const on = pins.filter(p => p.side === g.side);
      const vert = g.side === "U" || g.side === "D";
      g.key = on.length ? on.reduce((a, p) => a + (vert ? p.x : p.y), 0) / on.length : (vert ? B.x + B.w / 2 : B.y + B.h / 2);
      // depth: parts on a signal pin first, then outward along part-part wires
      const depth = {};
      let frontier = g.ids.filter(id => (touch[id] || []).includes(1));
      if (!frontier.length) frontier = g.ids.filter(id => touch[id]);
      if (!frontier.length) frontier = [g.ids[0]];
      frontier.forEach(id => (depth[id] = 0));
      for (let d = 1; frontier.length; d++) {
        const next = [];
        for (const w of s.wires) for (const [a, b] of [[w.start.componentId, w.end.componentId], [w.end.componentId, w.start.componentId]])
          if (frontier.includes(a) && g.ids.includes(b) && depth[b] === undefined) { depth[b] = d; next.push(b); }
        frontier = next;
      }
      g.ids.forEach(id => { if (depth[id] === undefined) depth[id] = 1; });
      g.layers = [];
      for (const id of g.ids) (g.layers[depth[id]] ||= []).push(id);
      g.layers = g.layers.filter(Boolean);
      perSide[g.side].push(g);
    }
    const CH = opts.channel ?? 70;  // wire channel between board and first row
    const ROW = opts.rowGap ?? 50;  // between layers going outward
    const SEP = opts.sep ?? 34;     // between neighbouring groups
    const target = {};
    for (const [side, gs] of Object.entries(perSide)) {
      if (!gs.length) continue;
      const vert = side === "U" || side === "D";
      gs.sort((a, b) => a.key - b.key);
      // each group is a stack of layers going outward; inside a layer, parts sit side by side
      for (const g of gs) {
        g.span = 0; g.depthSize = [];
        for (const layer of g.layers) {
          const along = layer.reduce((a, id) => a + (vert ? rect[id].w : rect[id].h), 0) + SEP * (layer.length - 1);
          g.span = Math.max(g.span, along);
          g.depthSize.push(Math.max(...layer.map(id => (vert ? rect[id].h : rect[id].w))));
        }
      }
      // centre each group on its pins, then sweep to remove overlaps and re-centre the row
      let cur = -Infinity;
      for (const g of gs) { g.start = Math.max(g.key - g.span / 2, cur); cur = g.start + g.span + SEP; }
      const mid = (gs[0].start + gs[gs.length - 1].start + gs[gs.length - 1].span) / 2;
      const want = gs.reduce((a, g) => a + g.key, 0) / gs.length;
      const shift = (want - mid) * 0.5;
      for (const g of gs) {
        g.start += shift;
        let out = CH;
        g.layers.forEach((layer, li) => {
          const along = layer.reduce((a, id) => a + (vert ? rect[id].w : rect[id].h), 0) + SEP * (layer.length - 1);
          let p = g.start + (g.span - along) / 2;
          for (const id of layer) {
            const r = rect[id];
            const size = vert ? r.w : r.h, deep = vert ? r.h : r.w;
            const off = out + (g.depthSize[li] - deep) / 2;
            let x, y;
            if (side === "U") { x = p; y = B.y - off - r.h; }
            if (side === "D") { x = p; y = B.y + B.h + off; }
            if (side === "L") { y = p; x = B.x - off - r.w; }
            if (side === "R") { y = p; x = B.x + B.w + off; }
            target[id] = { x, y };
            p += size + SEP;
          }
          out += g.depthSize[li] + ROW;
        });
      }
    }
    for (const [id, t] of Object.entries(target)) {
      const c = comp[id], r = rect[id];
      if (!c) continue;
      // the wrapper's x/y and its visible (maybe rotated) box differ by a fixed offset
      st0Update(id, { x: Math.round(c.x + (t.x - r.x)), y: Math.round(c.y + (t.y - r.y)) });
    }
    await wait(200);
    sim.getState().recalculateAllWirePositions();
    await wait(300);
    rects = measure();
  }
  function st0Update(id, patch) { sim.getState().updateComponent(id, patch); }

  // ---- 1. spread whatever still overlaps (boards never move) ----
  const st0 = sim.getState();
  const pos = Object.fromEntries(st0.components.map(c => [c.id, { x: c.x, y: c.y }]));
  let moved = false;
  for (let it = 0; it < 80; it++) {
    let any = false;
    for (const a of rects) {
      if (a.kind !== "part" || !pos[a.id]) continue;
      for (const b of rects) {
        if (a === b) continue;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + GAP;
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + GAP;
        if (ox <= 0 || oy <= 0) continue;
        const ax = a.x + a.w / 2, bx = b.x + b.w / 2, ay = a.y + a.h / 2, by = b.y + b.h / 2;
        // a part sharing the board's space is pushed fully, two parts split it
        const share = b.kind === "board" || !pos[b.id] ? 1 : 0.5;
        let dx = 0, dy = 0;
        if (ox < oy) dx = (ax >= bx ? 1 : -1) * ox * share;
        else dy = (ay >= by ? 1 : -1) * oy * share;
        a.x += dx; a.y += dy; pos[a.id].x += dx; pos[a.id].y += dy;
        any = moved = true;
      }
    }
    if (!any) break;
  }
  if (moved) {
    for (const c of st0.components) {
      const p = pos[c.id];
      if (p && (Math.abs(p.x - c.x) > 0.5 || Math.abs(p.y - c.y) > 0.5))
        st0.updateComponent(c.id, { x: Math.round(p.x), y: Math.round(p.y) });
    }
    await wait(150);
    sim.getState().recalculateAllWirePositions();
    await wait(250);
    rects = measure();
  }

  // ---- 2. route ----
  const st = sim.getState();
  const byId = Object.fromEntries(rects.map(r => [r.id, r]));
  const wires = st.wires.filter(w => !w.bb);
  const inflate = (r, d) => ({ x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d });
  const obs = rects.map(r => ({ ...inflate(r, MARGIN), id: r.id }));

  // irregular grid: uniform lines plus every pin coordinate
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of rects) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); }
  x0 -= 120; y0 -= 120; x1 += 120; y1 += 120;
  const G = 10;
  const xsSet = new Set(), ysSet = new Set();
  for (let x = Math.floor(x0 / G) * G; x <= x1; x += G) xsSet.add(x);
  for (let y = Math.floor(y0 / G) * G; y <= y1; y += G) ysSet.add(y);

  // exit point of a pin: straight out of its owner through the nearest edge
  const ends = [];
  const exitOf = (pt, ownerId) => {
    const o = byId[ownerId];
    if (!o) return { x: pt.x, y: pt.y, dir: null };
    const d = [
      { dir: "L", v: pt.x - o.x }, { dir: "R", v: o.x + o.w - pt.x },
      { dir: "U", v: pt.y - o.y }, { dir: "D", v: o.y + o.h - pt.y },
    ].sort((a, b) => a.v - b.v)[0].dir;
    const out = MARGIN + 6;
    if (d === "L") return { x: o.x - out, y: pt.y, dir: d };
    if (d === "R") return { x: o.x + o.w + out, y: pt.y, dir: d };
    if (d === "U") return { x: pt.x, y: o.y - out, dir: d };
    return { x: pt.x, y: o.y + o.h + out, dir: d };
  };
  for (const w of wires) {
    const a = exitOf(w.start, w.start.componentId), b = exitOf(w.end, w.end.componentId);
    ends.push([a, b]);
    for (const p of [a, b, w.start, w.end]) { xsSet.add(Math.round(p.x * 10) / 10); ysSet.add(Math.round(p.y * 10) / 10); }
  }
  const xs = [...xsSet].sort((a, b) => a - b), ys = [...ysSet].sort((a, b) => a - b);
  const NX = xs.length, NY = ys.length;
  const xi = new Map(xs.map((v, i) => [v, i])), yi = new Map(ys.map((v, i) => [v, i]));
  const blocked = new Uint8Array(NX * NY);
  for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
    const x = xs[i], y = ys[j];
    for (const r of obs) if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) { blocked[i * NY + j] = 1; break; }
  }
  const usedH = new Uint16Array(NX * NY), usedV = new Uint16Array(NX * NY);
  const near = v => { let best = 0, bd = 1e9; for (let k = 0; k < v.length; k++) { const d = Math.abs(v[k] - arguments[1]); if (d < bd) { bd = d; best = k; } } return best; };
  const idxOf = (arr, map, v) => { const k = map.get(Math.round(v * 10) / 10); if (k !== undefined) return k; let b = 0, bd = 1e9; arr.forEach((a, i) => { const d = Math.abs(a - v); if (d < bd) { bd = d; b = i; } }); return b; };

  // A* with state (node, incoming direction)
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const route = (a, b) => {
    const si = idxOf(xs, xi, a.x), sj = idxOf(ys, yi, a.y), ti = idxOf(xs, xi, b.x), tj = idxOf(ys, yi, b.y);
    const N = NX * NY * 4;
    const g = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1);
    const heap = [];
    const push = (f, s) => { heap.push([f, s]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const h = (i, j) => Math.abs(xs[i] - xs[ti]) + Math.abs(ys[j] - ys[tj]);
    const startDir = { L: 1, R: 0, U: 3, D: 2 }[a.dir] ?? 0;
    const s0 = ((si * NY) + sj) * 4 + startDir;
    g[s0] = 0; push(h(si, sj), s0);
    const endDir = { L: 0, R: 1, U: 2, D: 3 }[b.dir]; // direction of travel INTO the goal
    let goal = -1, iter = 0;
    while (heap.length && iter++ < 400000) {
      const [f, s] = pop();
      const d = s & 3, node = s >> 2, i = (node / NY) | 0, j = node % NY;
      if (f - h(i, j) > g[s] + 1e-6) continue;
      if (i === ti && j === tj) { goal = s; break; }
      for (let k = 0; k < 4; k++) {
        const ni = i + DIRS[k][0], nj = j + DIRS[k][1];
        if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) continue;
        const nn = ni * NY + nj;
        if (blocked[nn] && !(ni === ti && nj === tj)) continue;
        if ((k ^ 1) === d && node !== s0 >> 2) continue; // no U-turn
        const len = Math.abs(xs[ni] - xs[i]) + Math.abs(ys[nj] - ys[j]);
        let c = len + (k !== d ? 25 : 0);
        const horiz = k < 2;
        const share = horiz ? usedH[nn] : usedV[nn];
        const cross = horiz ? usedV[nn] : usedH[nn];
        c += share * len * 6 + cross * 4;
        if (ni === ti && nj === tj && endDir !== undefined && k !== endDir) c += 40;
        const ns = nn * 4 + k;
        if (g[s] + c < g[ns]) { g[ns] = g[s] + c; prev[ns] = s; push(g[ns] + h(ni, nj), ns); }
      }
    }
    if (goal < 0) return null;
    const pts = [];
    for (let s = goal; s >= 0; s = prev[s]) { const n = s >> 2; pts.push({ x: xs[(n / NY) | 0], y: ys[n % NY], i: (n / NY) | 0, j: n % NY }); }
    pts.reverse();
    // mark the nodes of every step AND their neighbours within NEAR px across
    // the run: two wires 4 px apart read as one wire that stops dead
    const NEAR = 12;
    for (let k = 1; k < pts.length; k++) {
      const p = pts[k], q = pts[k - 1];
      const horiz = p.j === q.j;
      const arr = horiz ? usedH : usedV;
      if (horiz) {
        const y = ys[p.j], i0 = Math.min(p.i, q.i), i1 = Math.max(p.i, q.i);
        for (let jj = 0; jj < NY; jj++) if (Math.abs(ys[jj] - y) <= NEAR) for (let ii = i0; ii <= i1; ii++) arr[ii * NY + jj]++;
      } else {
        const x = xs[p.i], j0 = Math.min(p.j, q.j), j1 = Math.max(p.j, q.j);
        for (let ii = 0; ii < NX; ii++) if (Math.abs(xs[ii] - x) <= NEAR) for (let jj = j0; jj <= j1; jj++) arr[ii * NY + jj]++;
      }
    }
    return pts;
  };

  // short wires first: they have the fewest choices
  const order = wires.map((w, k) => k).sort((p, q) => {
    const L = k => Math.abs(ends[k][0].x - ends[k][1].x) + Math.abs(ends[k][0].y - ends[k][1].y);
    return L(p) - L(q);
  });
  const result = {};
  let failed = 0;
  for (const k of order) {
    const w = wires[k], [a, b] = ends[k];
    const pts = route(a, b);
    if (!pts) { failed++; continue; }
    // corners only
    const all = [{ x: w.start.x, y: w.start.y }, ...pts.map(p => ({ x: p.x, y: p.y })), { x: w.end.x, y: w.end.y }];
    const corners = [];
    for (let n = 1; n < all.length - 1; n++) {
      const p = all[n - 1], q = all[n], r = all[n + 1];
      const col = (Math.abs(p.x - q.x) < 0.01 && Math.abs(q.x - r.x) < 0.01) || (Math.abs(p.y - q.y) < 0.01 && Math.abs(q.y - r.y) < 0.01);
      if (!col) corners.push({ x: q.x, y: q.y });
    }
    result[w.id] = corners;
  }
  sim.getState().setWires(sim.getState().wires.map(w => result[w.id] ? { ...w, waypoints: result[w.id], autoRouted: false } : w));
  await wait(200);
  return { moved, wires: wires.length, failed, rects: rects.length };
};
