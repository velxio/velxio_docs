import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  Easing,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import data from "./data.json";

export const OUTRO_SEC = 2.4;
const ACCENT = "#0071e3";
const BG = "#0d0d0f";

/** Which recorded moments get a zoom-in, and what the caption says. */
const BEATS: Record<string, { zoom: number; caption: string }> = {
  "choose-blank": { zoom: 1.7, caption: "Start from a blank project" },
  "add-esp32": { zoom: 1.8, caption: "Pick your board — a real ESP32" },
  "add-led": { zoom: 1.8, caption: "Add parts from a 169-component catalog" },
  "wire-end-a": { zoom: 1.9, caption: "Wire it up — pins snap like hardware" },
  "code-set": { zoom: 1.6, caption: "Write plain Arduino code" },
  run: { zoom: 2.0, caption: "Hit Run — compiled by the real toolchain" },
  "sim-started": { zoom: 1.8, caption: "Alive. Real firmware, in your browser" },
};
const ZOOM_LEAD = 0.85; // start early enough that the peak lands ON the click
const ZOOM_IN = 0.45;
const ZOOM_HOLD = 0.95;
const ZOOM_OUT = 0.55;

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const aDur = data.segA.to - data.segA.from;
  const bDur = data.segB.to - data.segB.from;
  const videoSec = aDur + bDur;

  // ── camera: zoom around the active beat ──────────────────────────────────
  let scale = 1;
  let ox = 640;
  let oy = 360;
  for (const e of data.events) {
    const beat = BEATS[e.label];
    if (!beat) continue;
    const s = e.ct - ZOOM_LEAD;
    const rel = t - s;
    if (rel < 0 || rel > ZOOM_IN + ZOOM_HOLD + ZOOM_OUT) continue;
    scale = interpolate(
      rel,
      [0, ZOOM_IN, ZOOM_IN + ZOOM_HOLD, ZOOM_IN + ZOOM_HOLD + ZOOM_OUT],
      [1, beat.zoom, beat.zoom, 1],
      { easing: Easing.inOut(Easing.cubic), extrapolateRight: "clamp" }
    );
    // keep the focus point on-frame: nudge the origin toward the center
    ox = e.x + (640 - e.x) * 0.25;
    oy = e.y + (360 - e.y) * 0.25;
    break;
  }

  // ── captions ──────────────────────────────────────────────────────────────
  let caption: string | null = null;
  let captionAlpha = 0;
  for (const e of data.events) {
    const beat = BEATS[e.label];
    if (!beat) continue;
    const rel = t - e.ct;
    if (rel < -0.1 || rel > 2.6) continue;
    caption = beat.caption;
    captionAlpha = interpolate(rel, [-0.1, 0.25, 2.1, 2.6], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    break;
  }

  const introAlpha = interpolate(t, [0, 0.4, 2.0, 2.7], [1, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const outroAlpha = interpolate(
    t,
    [videoSec - 0.5, videoSec + 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const font =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${ox}px ${oy}px`,
        }}
      >
        <Sequence durationInFrames={Math.ceil(aDur * fps)}>
          <OffthreadVideo
            src={staticFile("promo-raw.webm")}
            startFrom={Math.floor(data.segA.from * fps)}
            endAt={Math.ceil(data.segA.to * fps)}
            muted
          />
        </Sequence>
        <Sequence
          from={Math.ceil(aDur * fps)}
          durationInFrames={Math.ceil(bDur * fps)}
        >
          <OffthreadVideo
            src={staticFile("promo-raw.webm")}
            startFrom={Math.floor(data.segB.from * fps)}
            endAt={Math.ceil(data.segB.to * fps)}
            muted
          />
        </Sequence>
      </AbsoluteFill>

      {/* caption pill */}
      {caption && captionAlpha > 0.01 && (
        <div
          style={{
            position: "absolute",
            bottom: 46,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: captionAlpha,
          }}
        >
          <div
            style={{
              fontFamily: font,
              fontSize: 30,
              fontWeight: 600,
              color: "#fff",
              background: "rgba(13,13,15,.82)",
              border: `2px solid ${ACCENT}`,
              borderRadius: 14,
              padding: "12px 28px",
              boxShadow: "0 8px 30px rgba(0,0,0,.5)",
            }}
          >
            {caption}
          </div>
        </div>
      )}

      {/* intro title */}
      {introAlpha > 0.01 && (
        <AbsoluteFill
          style={{
            background: `rgba(13,13,15,${0.6 * introAlpha})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            opacity: introAlpha,
            fontFamily: font,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 800, color: "#fff" }}>
            Build electronics in your browser
          </div>
          <div style={{ fontSize: 30, color: ACCENT, marginTop: 14 }}>
            From blank canvas to blinking LED in one minute
          </div>
        </AbsoluteFill>
      )}

      {/* outro card */}
      {outroAlpha > 0.01 && (
        <AbsoluteFill
          style={{
            background: BG,
            opacity: outroAlpha,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            fontFamily: font,
          }}
        >
          <div style={{ fontSize: 76, fontWeight: 800, color: "#fff" }}>
            velxio<span style={{ color: ACCENT }}>.dev</span>
          </div>
          <div style={{ fontSize: 28, color: "#9a9aa0", marginTop: 16 }}>
            Real boards. Real firmware. Zero setup.
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
