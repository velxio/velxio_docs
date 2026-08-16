import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  Easing,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import beatData from "./beats.json";

export type Beat = { label: string; t: number; x?: number; y?: number; part?: string };
export type RebuildProps = {
  slug: string;
  title: string;
  board: string;
  description: string;
  parts: number;
  wires: number;
  beats: Beat[];
  box?: { x: number; y: number; w: number; h: number } | null;
};

export const INTRO_SEC = 3.2;
export const OUTRO_SEC = 2.4;
const ACCENT = "#0071e3";
const BG = "#0b0b0d";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const AUDIO_START = beatData.beats[0];

/** Speed-up applied to the building half — clicking through a picker is
 *  slower to watch than to do. The run segment plays at 1x. */
const BUILD_RATE = 2;

const CAPTION: Record<string, string> = {
  blank: "Start from a blank canvas",
  "add-board": "Pick the board",
  wired: "Wire it up, pin to pin",
  code: "Write the sketch",
  run: "Hit Run — real toolchain, real firmware",
  live: "It runs. Watch the circuit and the serial output",
};

export const RebuildDemo: React.FC<RebuildProps> = ({
  slug,
  title,
  board,
  description,
  parts,
  wires,
  beats,
  box,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const at = (label: string) => (beats.find(b => b.label === label)?.t ?? 0) / 1000;
  const buildFrom = at("blank") - 0.5;
  const runAt = at("run") || at("live");
  const liveAt = at("live");
  const endAt = at("end");

  // build segment (sped up) then the live segment (real time)
  const buildSrcSec = Math.max(1, runAt - buildFrom);
  const buildSec = buildSrcSec / BUILD_RATE;
  const liveSec = Math.max(2, endAt - Math.max(runAt, liveAt - 0.8));
  const totalSec = INTRO_SEC + buildSec + liveSec + OUTRO_SEC;

  const introIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const introOut = interpolate(t, [INTRO_SEC - 0.4, INTRO_SEC], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outroStart = INTRO_SEC + buildSec + liveSec;
  const outroIn = interpolate(t, [outroStart - 0.3, outroStart + 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── captions follow the recorded beats, mapped into composition time ──
  const toComp = (tt: number) =>
    tt <= runAt
      ? INTRO_SEC + Math.max(0, tt - buildFrom) / BUILD_RATE
      : INTRO_SEC + buildSec + Math.max(0, tt - Math.max(runAt, liveAt - 0.8));

  let caption: string | null = null;
  let capAlpha = 0;
  for (const b of beats) {
    const key = b.label.startsWith("add-") && b.label !== "add-board" ? "add-part" : b.label;
    const text =
      key === "add-part" ? `Add the ${b.part || "part"}` : CAPTION[b.label];
    if (!text) continue;
    const c = toComp(b.t / 1000);
    const rel = t - c;
    const dur = b.label === "live" ? 4.2 : 2.1;
    if (rel < -0.15 || rel > dur) continue;
    caption = text;
    capAlpha = interpolate(rel, [-0.15, 0.2, dur - 0.5, dur], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // ── frame the circuit during the live segment ─────────────────────────
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  let liveTransform = "none";
  if (box && box.w > 20 && box.h > 20) {
    const s = clamp(
      Math.min(width / (box.w * 1.7), height / (box.h * 2.3)),
      1,
      2.1
    );
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    liveTransform = `translate(${clamp(width / 2 - s * cx, width - width * s, 0)}px, ${clamp(
      height / 2 - s * cy,
      height - height * s,
      0
    )}px) scale(${s})`;
  }

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>
      <Audio
        src={staticFile("soundtrack.mp3")}
        startFrom={Math.round(AUDIO_START * fps)}
        volume={f => {
          const s = f / fps;
          return (
            0.5 *
            interpolate(s, [0, 0.8], [0, 1], { extrapolateRight: "clamp" }) *
            interpolate(s, [totalSec - 1.6, totalSec], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          );
        }}
      />

      {/* building the circuit, sped up */}
      <Sequence
        from={Math.round(INTRO_SEC * fps)}
        durationInFrames={Math.ceil(buildSec * fps)}
      >
        <OffthreadVideo
          src={staticFile(`rebuild/${slug}.webm`)}
          startFrom={Math.floor(buildFrom * fps)}
          playbackRate={BUILD_RATE}
          muted
        />
      </Sequence>

      {/* the emulation, real time, framed on the circuit */}
      <Sequence
        from={Math.round((INTRO_SEC + buildSec) * fps)}
        durationInFrames={Math.ceil(liveSec * fps)}
      >
        <AbsoluteFill style={{ transform: liveTransform, transformOrigin: "0 0" }}>
          <OffthreadVideo
            src={staticFile(`rebuild/${slug}.webm`)}
            startFrom={Math.floor(Math.max(runAt, liveAt - 0.8) * fps)}
            muted
          />
        </AbsoluteFill>
      </Sequence>

      {/* caption */}
      {caption && capAlpha > 0.01 && (
        <div
          style={{
            position: "absolute",
            bottom: 52,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: capAlpha,
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#fff",
              background: "rgba(11,11,13,.86)",
              border: `2px solid ${ACCENT}`,
              borderRadius: 16,
              padding: "14px 32px",
              boxShadow: "0 10px 40px rgba(0,0,0,.55)",
            }}
          >
            {caption}
          </div>
        </div>
      )}

      {/* intro: brand + what we are about to build, next to the finished circuit */}
      {introOut > 0.01 && (
        <AbsoluteFill style={{ background: BG, opacity: introOut }}>
          <div style={{ display: "flex", width, height }}>
            <div
              style={{
                width: width / 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 74px",
                transform: `translateY(${interpolate(introIn, [0, 1], [24, 0])}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Img
                  src={staticFile("velxio-logo.png")}
                  style={{ width: 88, height: 88, borderRadius: 20 }}
                />
                <div style={{ fontSize: 44, fontWeight: 800, color: "#fff" }}>
                  velxio<span style={{ color: ACCENT }}>.dev</span>
                </div>
              </div>
              <div
                style={{
                  marginTop: 34,
                  fontSize: 58,
                  lineHeight: 1.05,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: -1,
                }}
              >
                {title}
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                <span
                  style={{
                    background: ACCENT,
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: "8px 20px",
                  }}
                >
                  {board}
                </span>
                <span
                  style={{
                    border: "2px solid #2a2a30",
                    color: "#c9c9d1",
                    fontSize: 22,
                    fontWeight: 600,
                    borderRadius: 999,
                    padding: "8px 20px",
                  }}
                >
                  {parts} parts · {wires} wires
                </span>
              </div>
              {description ? (
                <div
                  style={{
                    marginTop: 24,
                    fontSize: 25,
                    lineHeight: 1.4,
                    color: "#9c9ca6",
                    maxWidth: 620,
                  }}
                >
                  {description}
                </div>
              ) : null}
              <div style={{ marginTop: 30, fontSize: 24, color: ACCENT, fontWeight: 700 }}>
                Built from scratch, in the browser
              </div>
            </div>
            <div
              style={{
                width: width / 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 52,
                background: "#0f0f12",
                borderLeft: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <Img
                src={staticFile(`rebuild/${slug}-circuit.png`)}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: `scale(${interpolate(introIn, [0, 1], [0.94, 1])})`,
                  filter: "drop-shadow(0 18px 40px rgba(0,0,0,.55))",
                }}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* outro */}
      {outroIn > 0.01 && (
        <AbsoluteFill
          style={{
            background: BG,
            opacity: outroIn,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <Img
            src={staticFile("velxio-logo.png")}
            style={{ width: 124, height: 124, borderRadius: 28 }}
          />
          <div style={{ fontSize: 70, fontWeight: 800, color: "#fff" }}>
            velxio<span style={{ color: ACCENT }}>.dev</span>
          </div>
          <div style={{ fontSize: 28, color: "#9c9ca6" }}>
            400+ examples. Build any of them yourself.
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const rebuildDuration = (p: RebuildProps, fps: number) => {
  const at = (l: string) => (p.beats.find(b => b.label === l)?.t ?? 0) / 1000;
  const buildFrom = at("blank") - 0.5;
  const runAt = at("run") || at("live");
  const buildSec = Math.max(1, runAt - buildFrom) / BUILD_RATE;
  const liveSec = Math.max(2, at("end") - Math.max(runAt, at("live") - 0.8));
  return Math.ceil((INTRO_SEC + buildSec + liveSec + OUTRO_SEC) * fps);
};

export { Easing };
