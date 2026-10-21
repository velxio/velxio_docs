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

/**
 * Vertical 1080x1920 reel of a GALLERY example, cut from a take of
 * scripts/reel-assemble.mjs: the circuit assembles itself (no pointer, no
 * picker), the sketch scrolls by in the real editor, then it runs and the
 * pointer works the inputs.
 *
 * The take is filmed at exactly the size of the middle band, so nothing is
 * cropped or zoomed: two canvas scenes meet with a short cross-fade, and
 * only canvas <-> code is a real change of scene.
 */
export type AssembleBeats = {
  assembled: number;
  run: number;
  live: number;
  end: number;
  /** t: the pointer sets off, press: each button down / knob grab, done: finished */
  inputs: { id: string; type: string; t: number; press?: number[]; done?: number }[];
};

export type AssembleProps = {
  id: string;
  hook: string; // top band, the whole video; "\n" breaks lines
  kicker: string;
  outro?: string;
  hookSize?: number;
  beats: AssembleBeats;
  code: { lines: number; w: number; h: number } | null;
  /** take second the opening payoff starts at (default: first input, or live + 3) */
  payoffAt?: number;
  /** seconds of live footage (default: up to 10) */
  liveSec?: number;
  /** step labels */
  chips?: Partial<Record<"build" | "code" | "run" | "input", string>>;
};

const W = 1080;
const H = 1920;
const TOP = 440;
const BOTTOM = 250;
const AREA_H = H - TOP - BOTTOM; // 1230, the take's own height
const ACCENT = "#0071e3";
const BG = "#0b0b0d";
const CANVAS_BG = "#1e1e1e";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const AUDIO_START = beatData.beats[0];
const PAYOFF_SEC = 2.6;
const OUTRO_SEC = 2.4;
const XF = 8; // cross-fade frames between scenes

type Scene =
  | { kind: "take"; from: number; to: number; chip?: string }
  | { kind: "code"; dur: number; chip?: string };

const sceneLen = (s: Scene) => (s.kind === "take" ? s.to - s.from : s.dur);

export function codeSeconds(lines: number) {
  return lines <= 20 ? 3.4 : Math.min(5, 2.4 + lines * 0.045);
}

export function buildScenes(p: AssembleProps): Scene[] {
  const b = p.beats;
  const first = b.inputs[0];
  const firstPress = first?.press?.[0] ?? (first ? first.t + 1 : undefined);
  const lastDone = b.inputs.length ? b.inputs[b.inputs.length - 1].done ?? b.end : undefined;
  const payoffAt = p.payoffAt ?? (firstPress != null ? firstPress - 0.3 : b.live + 3);
  // the hands-on part ends after the last input, but never runs past ~11 s:
  // three inputs worked three times each made a 39 s reel
  const liveEnd = Math.min(
    b.end - 0.1,
    lastDone != null ? lastDone + 0.6 : b.live + (p.liveSec ?? 8),
    firstPress != null ? firstPress + (p.liveSec ?? 10) : Infinity,
  );
  const scenes: Scene[] = [
    { kind: "take", from: payoffAt, to: Math.min(payoffAt + PAYOFF_SEC, b.end - 0.1) },
    { kind: "take", from: 0.3, to: b.assembled + 0.5, chip: p.chips?.build ?? "Parts and wires" },
  ];
  if (p.code) scenes.push({ kind: "code", dur: codeSeconds(p.code.lines), chip: p.chips?.code ?? "The code" });
  // Run, with the compile wait cut out when it is long enough to notice
  const run = p.chips?.run ?? "Run";
  if (b.live - b.run > 1.2) {
    scenes.push({ kind: "take", from: b.run - 0.2, to: b.run + 0.5, chip: run });
    scenes.push({ kind: "take", from: b.live - 0.1, to: b.live + 1.2, chip: run });
  } else {
    scenes.push({ kind: "take", from: b.run - 0.2, to: b.live + 1.2, chip: run });
  }
  // then straight to the hand on the input: the solver's warm-up is dead air
  if (first) scenes.push({ kind: "take", from: Math.max(b.live + 1.2, firstPress! - 1.1), to: liveEnd, chip: p.chips?.input ?? "Try it" });
  else scenes[scenes.length - 1] = { kind: "take", from: b.run - 0.2, to: liveEnd, chip: run };
  return scenes;
}

function place(scenes: Scene[], fps: number) {
  let t = 0;
  return scenes.map((s, i) => {
    const start = i === 0 ? 0 : t - XF / fps;
    t = start + sceneLen(s);
    return { s, start };
  });
}

export function assembleDuration(p: AssembleProps, fps: number) {
  const placed = place(buildScenes(p), fps);
  const last = placed[placed.length - 1];
  return Math.ceil((last.start + sceneLen(last.s) + OUTRO_SEC) * fps);
}

const TakeClip: React.FC<{ id: string; from: number; fade: boolean }> = ({ id, from, fade }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = fade ? interpolate(frame, [0, XF], [0, 1], { extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ top: TOP, height: AREA_H, background: CANVAS_BG, opacity: o }}>
      <OffthreadVideo
        src={staticFile(`reels-take/${id}.mp4`)}
        startFrom={Math.round(from * fps)}
        muted
        style={{ width: W, height: AREA_H }}
      />
    </AbsoluteFill>
  );
};

/** The sketch as the real editor drew it, scrolled top to bottom. */
const CodeScene: React.FC<{ id: string; code: NonNullable<AssembleProps["code"]>; dur: number }> = ({ id, code, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const TAB = 78;
  const PAD = 26;
  const scale = W / code.w;
  const imgH = code.h * scale;
  const viewH = AREA_H - TAB - PAD;
  const travel = Math.max(0, imgH - viewH);
  // hold the top, glide, hold the bottom
  const k = interpolate(t, [0.7, dur - 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const fadeIn = interpolate(frame, [0, XF], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ top: TOP, height: AREA_H, background: CANVAS_BG, opacity: fadeIn, overflow: "hidden" }}>
      <div style={{ height: TAB, display: "flex", alignItems: "flex-end", background: "#181818", borderBottom: "1px solid #2b2b2b" }}>
        <div
          style={{
            marginLeft: 24,
            padding: "0 30px",
            height: 60,
            display: "flex",
            alignItems: "center",
            background: CANVAS_BG,
            borderTop: `3px solid ${ACCENT}`,
            color: "#e6e6e6",
            fontSize: 30,
            fontFamily: "ui-monospace, Menlo, Consolas, monospace",
          }}
        >
          sketch.ino
        </div>
      </div>
      <div style={{ position: "absolute", top: TAB + PAD, left: 0, width: W, height: viewH, overflow: "hidden" }}>
        <Img
          src={staticFile(`reels-take/${id}-code.png`)}
          style={{ width: W, height: imgH, transform: `translateY(${-travel * eased}px)` }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 10 });
  return (
    <div
      style={{
        position: "absolute",
        top: TOP + AREA_H - 110,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: k,
      }}
    >
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: "#fff",
          background: "rgba(11,11,13,.85)",
          border: `3px solid ${ACCENT}`,
          borderRadius: 20,
          padding: "12px 28px",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const ReelAssemble: React.FC<AssembleProps> = p => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const placed = place(buildScenes(p), fps);
  const last = placed[placed.length - 1];
  const outroStart = last.start + sceneLen(last.s);
  const total = outroStart + OUTRO_SEC;
  const t = frame / fps;

  // one chip per run of equal labels, so consecutive Run scenes share it
  const chips: { text: string; start: number; end: number }[] = [];
  for (const { s, start } of placed) {
    if (!s.chip) continue;
    const end = start + sceneLen(s);
    const prev = chips[chips.length - 1];
    if (prev && prev.text === s.chip && Math.abs(prev.end - start) < 0.6) prev.end = end;
    else chips.push({ text: s.chip, start, end });
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
        volume={f =>
          0.55 *
          interpolate(f / fps, [total - 1.4, total], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {placed.map(({ s, start }, i) => (
        <Sequence key={i} from={Math.round(start * fps)} durationInFrames={Math.ceil(sceneLen(s) * fps) + 1}>
          {s.kind === "take" ? (
            <TakeClip id={p.id} from={s.from} fade={i > 0} />
          ) : (
            p.code && <CodeScene id={p.id} code={p.code} dur={s.dur} />
          )}
        </Sequence>
      ))}

      {chips.map((c, i) => (
        <Sequence key={`c${i}`} from={Math.round(c.start * fps)} durationInFrames={Math.ceil((c.end - c.start) * fps)}>
          <Chip text={c.text} />
        </Sequence>
      ))}

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
            opacity: hookIn,
          }}
        >
          {p.hook}
        </div>
        <div style={{ marginTop: 22, fontSize: 36, fontWeight: 700, color: "#7fb8ff" }}>{p.kicker}</div>
      </div>

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
          <div style={{ fontSize: 28, color: "#9c9ca6", fontWeight: 600 }}>Free simulator. Runs in your browser.</div>
        </div>
      </div>

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
