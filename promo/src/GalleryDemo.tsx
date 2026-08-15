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

export type GalleryProps = {
  slug: string;
  title: string;
  board: string;
  description: string;
  /** seconds into the raw take where the sim went live */
  liveAt: number;
  /** seconds of the raw take */
  endAt: number;
  /** where the circuit sits on the 1920x1080 canvas (gallery-bbox.mjs) */
  box?: { x: number; y: number; w: number; h: number } | null;
};

export const INTRO_SEC = 3.4;
export const OUTRO_SEC = 2.6;
const ACCENT = "#0071e3";
const BG = "#0b0b0d";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Music: start on the track's first real beat so t=0 is a downbeat. */
const AUDIO_START = beatData.beats[0];

export const GalleryDemo: React.FC<GalleryProps> = ({
  slug,
  title,
  board,
  description,
  liveAt,
  endAt,
  box,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // Footage: from just before the sim went live to the end of the take.
  const from = Math.max(0, liveAt - 0.6);
  const runSec = Math.max(2, endAt - from);
  const totalSec = INTRO_SEC + runSec + OUTRO_SEC;

  // ── intro: logo + title on the left, the whole circuit on the right ──
  const introIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 26 });
  const introOut = interpolate(t, [INTRO_SEC - 0.45, INTRO_SEC], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardShift = interpolate(introIn, [0, 1], [26, 0]);

  // ── outro ────────────────────────────────────────────────────────────
  const outroStart = INTRO_SEC + runSec;
  const outroIn = interpolate(t, [outroStart - 0.35, outroStart + 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frame the footage on the circuit: scale so the box (plus margin)
  // fills the frame, then translate to centre it — clamped so the video
  // never pans past its own edges. A gentle push-in over the run adds
  // life without ever cropping the subject.
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  let frameTransform = "none";
  if (box && box.w > 20 && box.h > 20) {
    const marginX = 1.55;
    const marginY = 2.1;
    const base = clamp(
      Math.min(width / (box.w * marginX), height / (box.h * marginY)),
      1,
      2.4
    );
    const push = interpolate(
      t,
      [INTRO_SEC, INTRO_SEC + runSec],
      [1, 1.06],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const s = base * push;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const tx = clamp(width / 2 - s * cx, width - width * s, 0);
    const ty = clamp(height / 2 - s * cy, height - height * s, 0);
    frameTransform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }

  // Lower-third label while the demo runs (fades in, then out).
  const labelAlpha =
    interpolate(t, [INTRO_SEC + 0.2, INTRO_SEC + 0.8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(t, [INTRO_SEC + 5.2, INTRO_SEC + 5.9], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

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
            interpolate(s, [totalSec - 1.8, totalSec], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          );
        }}
      />

      {/* footage, framed on the circuit (the canvas is mostly empty at
          100% zoom, so fill the frame with what matters and clamp to the
          video edges so nothing black shows) */}
      <Sequence
        from={Math.round(INTRO_SEC * fps)}
        durationInFrames={Math.ceil(runSec * fps)}
      >
        <AbsoluteFill style={{ transform: frameTransform, transformOrigin: "0 0" }}>
          <OffthreadVideo
            src={staticFile(`gallery/${slug}.webm`)}
            startFrom={Math.floor(from * fps)}
            muted
          />
        </AbsoluteFill>
      </Sequence>

      {/* lower third over the running demo */}
      {labelAlpha > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: 54,
            bottom: 54,
            opacity: labelAlpha,
            background: "rgba(11,11,13,.84)",
            border: `2px solid ${ACCENT}`,
            borderRadius: 16,
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            boxShadow: "0 10px 40px rgba(0,0,0,.55)",
          }}
        >
          <Img src={staticFile("velxio-logo.png")} style={{ width: 46, height: 46 }} />
          <div>
            <div style={{ color: "#fff", fontSize: 30, fontWeight: 700 }}>{title}</div>
            <div style={{ color: ACCENT, fontSize: 21, fontWeight: 600, marginTop: 2 }}>
              {board}
            </div>
          </div>
        </div>
      )}

      {/* intro card */}
      {introOut > 0.01 && (
        <AbsoluteFill style={{ background: BG, opacity: introOut }}>
          <div style={{ display: "flex", width, height }}>
            {/* left half — brand + title */}
            <div
              style={{
                width: width / 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 76px",
                transform: `translateY(${cardShift}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <Img
                  src={staticFile("velxio-logo.png")}
                  style={{ width: 92, height: 92, borderRadius: 20 }}
                />
                <div style={{ fontSize: 46, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
                  velxio<span style={{ color: ACCENT }}>.dev</span>
                </div>
              </div>
              <div
                style={{
                  marginTop: 40,
                  fontSize: 62,
                  lineHeight: 1.06,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: -1.2,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  marginTop: 22,
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  background: ACCENT,
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: "9px 22px",
                }}
              >
                {board}
              </div>
              {description ? (
                <div
                  style={{
                    marginTop: 26,
                    fontSize: 26,
                    lineHeight: 1.4,
                    color: "#9c9ca6",
                    maxWidth: 640,
                  }}
                >
                  {description}
                </div>
              ) : null}
            </div>

            {/* right half — the whole circuit, centered */}
            <div
              style={{
                width: width / 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 54,
                background: "#0f0f12",
                borderLeft: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <Img
                src={staticFile(`gallery/${slug}-circuit.png`)}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: `scale(${interpolate(introIn, [0, 1], [0.93, 1])})`,
                  filter: "drop-shadow(0 18px 40px rgba(0,0,0,.55))",
                }}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* outro card */}
      {outroIn > 0.01 && (
        <AbsoluteFill
          style={{
            background: BG,
            opacity: outroIn,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Img
            src={staticFile("velxio-logo.png")}
            style={{ width: 128, height: 128, borderRadius: 28 }}
          />
          <div style={{ fontSize: 74, fontWeight: 800, color: "#fff" }}>
            velxio<span style={{ color: ACCENT }}>.dev</span>
          </div>
          <div style={{ fontSize: 30, color: "#9c9ca6" }}>
            Real boards. Real firmware. Zero setup.
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const galleryDuration = (p: GalleryProps, fps: number) =>
  Math.ceil(
    (INTRO_SEC + Math.max(2, p.endAt - Math.max(0, p.liveAt - 0.6)) + OUTRO_SEC) * fps
  );

export { Easing };
