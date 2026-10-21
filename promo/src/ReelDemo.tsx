import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import beatData from "./beats.json";
import type { Beat } from "./RebuildDemo";

/**
 * Vertical 1080x1920 cut of a rebuild take, for Instagram Reels / YouTube
 * Shorts. Same recording as the `rebuild` composition, re-edited after
 * what the research in velxio-prod/project/social-video-research-2026-10
 * found: payoff in the first second, a hook line that stays on screen,
 * the canvas filling the frame instead of the whole IDE, picker time cut
 * out, and under 30 s.
 */
export type ReelProps = {
  slug: string;
  hook: string; // top band, stays the whole video; "\n" breaks lines
  kicker: string; // small line under the hook
  board: string;
  beats: Beat[];
  box?: { x: number; y: number; w: number; h: number } | null;
  /** source second the opening payoff starts at (default: the input beat) */
  hookAt?: number;
  /** seconds of live footage after the build (default 8) */
  liveSec?: number;
  /** source second the live segment starts at (default: input beat - 2) */
  liveAt?: number;
  /** end card lines */
  outro?: string;
  /** source rect the opening payoff zooms onto (a display, say); default: the circuit */
  focus?: { x: number; y: number; w: number; h: number };
  /** hook font size, for long hooks */
  hookSize?: number;
  /** source second the wiring segment starts at (skips a panel left open) */
  wireFrom?: number;
  /** source window replayed in slow motion inside the live segment */
  slow?: { from: number; to: number; rate: number };
  /** chip text overrides, keyed by step: parts, wire, code, run, live */
  chips?: Partial<Record<"parts" | "wire" | "code" | "run" | "live", string>>;
};

const W = 1080;
const H = 1920;
const TOP = 440; // hook band
const BOTTOM = 250; // brand band
const AREA_H = H - TOP - BOTTOM;
const SRC_W = 1920;
const SRC_H = 1080;
const ACCENT = "#0071e3";
const BG = "#0b0b0d";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const AUDIO_START = beatData.beats[0];
const HOOK_SEC = 2.6;
const OUTRO_SEC = 2.6;

type Crop = { x: number; y: number; w: number; h: number };
type Seg = { from: number; to: number; rate: number; crop: Crop; chip: string };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** A source rectangle with the reel area's aspect, around `box`, padded. */
const cropAround = (box: Crop, pad: number, minH: number): Crop => {
  const aspect = W / AREA_H;
  let h = Math.max(box.h * pad, (box.w * pad) / aspect, minH);
  h = Math.min(h, SRC_H);
  let w = h * aspect;
  if (w > SRC_W) {
    w = SRC_W;
    h = w / aspect;
  }
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  return {
    x: clamp(cx - w / 2, 0, SRC_W - w),
    y: clamp(cy - h / 2, 0, SRC_H - h),
    w,
    h,
  };
};

/** The sketch editor sits top-left of the take. */
const CODE_CROP: Crop = { x: 0, y: 30, w: 640, h: (640 * AREA_H) / W };

export const buildSegments = (p: ReelProps): Seg[] => {
  const at = (l: string) => (p.beats.find(b => b.label === l)?.t ?? 0) / 1000;
  const box = p.box && p.box.w > 20 ? p.box : { x: 1100, y: 250, w: 500, h: 500 };
  const wide = cropAround(box, 1.35, 560);
  const tight = cropAround(box, 1.18, 470);
  const segs: Seg[] = [];

  // parts landing on the canvas: from each place-* to the next picker-*
  // (the picker itself is cut; the part just pops in)
  // the board's own drop is a drag across an empty canvas: skip it
  const places = p.beats.filter(b => b.label.startsWith("place-") && b.label !== "place-board");
  const wiredAt = at("wired");
  places.forEach((pl, i) => {
    const t0 = pl.t / 1000 - 0.1; // earlier still shows the picker closing
    const next = p.beats.find(b => b.t > pl.t && b.label.startsWith("picker-"));
    const isLast = i === places.length - 1;
    const t1 = isLast ? t0 + 1.2 : Math.min((next?.t ?? pl.t + 1500) / 1000, t0 + 1.6);
    segs.push({ from: t0, to: t1, rate: 1.4, crop: wide, chip: p.chips?.parts ?? "Add the parts" });
  });
  // wiring, the bulk of the build
  // +5.5 s: after the last drop the recorder briefly re-opens the picker
  // (seen in every take), so the wiring footage starts after it closes
  const lastPlace =
    p.wireFrom ?? (places.length ? places[places.length - 1].t / 1000 + 5.5 : at("blank"));
  if (wiredAt > lastPlace) {
    const src = wiredAt - lastPlace;
    const rate = clamp(src / 7, 2, 5); // ~7 s on screen whatever the wire count
    segs.push({ from: lastPlace, to: wiredAt + 0.3, rate, crop: wide, chip: p.chips?.wire ?? "Wire it, pin to pin" });
  }
  // the sketch
  const codeAt = at("code") || at("focus-code");
  if (codeAt) {
    const scrolled = at("code-scrolled");
    const to = scrolled ? Math.min(scrolled + 0.8, codeAt + 4.5) : codeAt + 2.4;
    segs.push({ from: codeAt + 0.2, to, rate: scrolled ? 1.5 : 1, crop: CODE_CROP, chip: p.chips?.code ?? "The code" });
  }
  // Run click
  const runAt = at("run");
  if (runAt) segs.push({ from: runAt - 0.4, to: runAt + 0.6, rate: 1, crop: wide, chip: p.chips?.run ?? "Hit Run" });
  // live, real time
  const inputAt = at("input");
  const liveAt = p.liveAt ?? (inputAt ? inputAt - 2 : at("live") + 1);
  const liveSec = p.liveSec ?? 8;
  const endAt = at("end") || liveAt + liveSec;
  const liveTo = Math.min(endAt, liveAt + liveSec);
  const liveChip = p.chips?.live ?? "It runs. In the browser.";
  const sl = p.slow;
  if (sl && sl.from > liveAt && sl.to < liveTo) {
    segs.push({ from: liveAt, to: sl.from, rate: 1, crop: tight, chip: liveChip });
    segs.push({ from: sl.from, to: sl.to, rate: sl.rate, crop: tight, chip: liveChip });
    segs.push({ from: sl.to, to: liveTo, rate: 1, crop: tight, chip: liveChip });
  } else segs.push({ from: liveAt, to: liveTo, rate: 1, crop: tight, chip: liveChip });
  return segs;
};

const segLen = (s: Seg) => Math.max(0.3, (s.to - s.from) / s.rate);

export const reelDuration = (p: ReelProps, fps: number) => {
  const body = buildSegments(p).reduce((a, s) => a + segLen(s), 0);
  return Math.ceil((HOOK_SEC + body + OUTRO_SEC) * fps);
};

const hookStart = (p: ReelProps) => {
  const at = (l: string) => (p.beats.find(b => b.label === l)?.t ?? 0) / 1000;
  if (p.hookAt != null) return p.hookAt;
  const input = at("input");
  return input ? input - 0.3 : at("live") + 3;
};

/** One source window, cropped and scaled into the reel area. */
const Clip: React.FC<{ slug: string; seg: Seg; fps: number }> = ({ slug, seg, fps }) => {
  const frame = useCurrentFrame();
  const s = W / seg.crop.w;
  // a small punch-in on every cut keeps hard cuts from feeling static
  const punch = interpolate(frame, [0, 8], [1.035, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ top: TOP, height: AREA_H, overflow: "hidden", background: "#141416" }}>
      <div
        style={{
          position: "absolute",
          width: SRC_W,
          height: SRC_H,
          transformOrigin: "0 0",
          transform: `scale(${punch}) translate(${-seg.crop.x * s}px, ${-seg.crop.y * s}px) scale(${s})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(`rebuild/${slug}.webm`)}
          startFrom={Math.floor(seg.from * fps)}
          playbackRate={seg.rate}
          muted
          style={{ width: SRC_W, height: SRC_H }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ text: string; rate: number }> = ({ text, rate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 10 });
  return (
    <div
      style={{
        position: "absolute",
        top: TOP + AREA_H - 120,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 14,
        opacity: k,
        transform: `translateY(${interpolate(k, [0, 1], [16, 0])}px)`,
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: "#fff",
          background: "rgba(11,11,13,.88)",
          border: `3px solid ${ACCENT}`,
          borderRadius: 20,
          padding: "14px 30px",
        }}
      >
        {text}
      </div>
      {rate >= 1.9 && (
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#fff",
            background: ACCENT,
            borderRadius: 20,
            padding: "16px 22px",
          }}
        >
          {Math.round(rate)}x
        </div>
      )}
    </div>
  );
};

export const ReelDemo: React.FC<ReelProps> = p => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const segs = buildSegments(p);
  const total = reelDuration(p, fps) / fps;
  const box = p.box && p.box.w > 20 ? p.box : { x: 1100, y: 250, w: 500, h: 500 };
  const hookSeg: Seg = {
    from: hookStart(p),
    to: hookStart(p) + HOOK_SEC,
    rate: 1,
    crop: p.focus ? cropAround(p.focus, 1.15, 300) : cropAround(box, 1.18, 470),
    chip: "",
  };

  let cursor = HOOK_SEC;
  const placed = segs.map(s => {
    const start = cursor;
    cursor += segLen(s);
    return { s, start };
  });
  const outroStart = cursor;
  const chipGroups: { chip: string; rate: number; start: number; dur: number }[] = [];
  for (const { s, start } of placed) {
    const last = chipGroups[chipGroups.length - 1];
    if (last && last.chip === s.chip) {
      last.dur += segLen(s);
      last.rate = Math.max(last.rate, s.rate);
    } else chipGroups.push({ chip: s.chip, rate: s.rate, start, dur: segLen(s) });
  }
  const outroIn = interpolate(t, [outroStart - 0.2, outroStart + 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hookIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>
      <Audio
        src={staticFile("soundtrack.mp3")}
        startFrom={Math.round(AUDIO_START * fps)}
        volume={f => {
          const s = f / fps;
          return (
            0.55 *
            interpolate(s, [total - 1.4, total], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          );
        }}
      />

      {/* 1. the payoff first */}
      <Sequence durationInFrames={Math.ceil(HOOK_SEC * fps)}>
        <Clip slug={p.slug} seg={hookSeg} fps={fps} />
      </Sequence>

      {/* 2. how it was built, then it running */}
      {placed.map(({ s, start }, i) => (
        <Sequence
          key={i}
          from={Math.round(start * fps)}
          durationInFrames={Math.ceil(segLen(s) * fps)}
        >
          <Clip slug={p.slug} seg={s} fps={fps} />
        </Sequence>
      ))}

      {/* one chip per run of equal labels, so it does not re-pop per part */}
      {chipGroups.map((g, i) => (
        <Sequence key={`c${i}`} from={Math.round(g.start * fps)} durationInFrames={Math.ceil(g.dur * fps)}>
          <Chip text={g.chip} rate={g.rate} />
        </Sequence>
      ))}

      {/* top band: the hook, the whole video */}
      <div
        style={{
          position: "absolute",
          top: 0,
          height: TOP,
          width: "100%",
          background: BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 60px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: p.hookSize ?? 74,
            lineHeight: 1.08,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -1,
            whiteSpace: "pre-line",
            transform: `scale(${interpolate(hookIn, [0, 1], [0.92, 1])})`,
            opacity: hookIn,
          }}
        >
          {p.hook}
        </div>
        <div style={{ marginTop: 22, fontSize: 36, fontWeight: 700, color: "#7fb8ff" }}>
          {p.kicker}
        </div>
      </div>

      {/* bottom band: brand */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          height: BOTTOM,
          width: "100%",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
        }}
      >
        <Img src={staticFile("velxio-logo.png")} style={{ width: 76, height: 76, borderRadius: 18 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 50, fontWeight: 800, color: "#fff" }}>
            velxio<span style={{ color: ACCENT }}>.dev</span>
          </div>
          <div style={{ fontSize: 28, color: "#9c9ca6", fontWeight: 600 }}>
            Free simulator. Runs in your browser.
          </div>
        </div>
      </div>

      {/* end card */}
      {outroIn > 0.01 && (
        <AbsoluteFill
          style={{
            background: BG,
            opacity: outroIn,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 26,
            padding: 80,
            textAlign: "center",
          }}
        >
          <Img src={staticFile("velxio-logo.png")} style={{ width: 170, height: 170, borderRadius: 38 }} />
          <div style={{ fontSize: 96, fontWeight: 900, color: "#fff" }}>
            velxio<span style={{ color: ACCENT }}>.dev</span>
          </div>
          <div style={{ fontSize: 46, color: "#d5d5dc", fontWeight: 700, lineHeight: 1.25, whiteSpace: "pre-line" }}>
            {p.outro || "No hardware. No install.\nBuild it yourself, free."}
          </div>
          <div style={{ marginTop: 18, fontSize: 36, color: "#7fb8ff", fontWeight: 700 }}>Link in bio</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
