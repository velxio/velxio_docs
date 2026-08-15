import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  Easing,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import data from "./data.json";
import beatData from "./beats.json";

export const OUTRO_SEC = 2.4;
const ACCENT = "#0071e3";
const BG = "#0d0d0f";

/** Which recorded moments get a zoom-in, and what the caption says.
 *  hold: seconds at full zoom (short for add-clicks so the part's
 *  placement is visible right after). fx/fy: focus override — e.g. the
 *  code beat centers the WHOLE editor pane, never a corner of it. */
const BEATS: Record<
  string,
  {
    zoom: number;
    caption: string;
    hold?: number;
    fx?: number;
    fy?: number;
    /** seconds the zoom PEAK lands BEFORE the click — for beats whose
     *  modal closes on click, so the peak shows the card still open and
     *  the release reveals where the part landed. */
    lead?: number;
  }
> = {
  "choose-blank": { zoom: 1.6, caption: "Start from a blank project", hold: 0.45, lead: 0.45 },
  "add-esp32": { zoom: 1.7, caption: "Pick your board — a real ESP32", hold: 0.45, lead: 0.45 },
  "add-led": { zoom: 1.7, caption: "Add parts from a 169-component catalog", hold: 0.45, lead: 0.45 },
  "wire-end-r2-a": { zoom: 1.9, caption: "Wire it up — pins snap like hardware" },
  "code-set": { zoom: 1.55, caption: "Write plain Arduino code", hold: 1.3, fx: 357, fy: 280 },
  run: { zoom: 1.8, caption: "Hit Run — compiled by the real toolchain" },
  "sim-started": { zoom: 1.8, caption: "Alive. Real firmware, in your browser" },
};
const ZOOM_IN = 0.45; // s of push-in; the peak lands ON the (snapped) click

const ZOOM_HOLD = 0.95;
const ZOOM_OUT = 0.55;

// ── beat sync ───────────────────────────────────────────────────────────────
// The soundtrack opens with an intro; AUDIO_START is its first detected
// beat, so composition t=0 lands on a downbeat and the grid below is in
// composition time.
const AUDIO_START = beatData.beats[0];
const BEAT_GRID = beatData.beats
  .map((b: number) => b - AUDIO_START)
  .filter((b: number) => b >= 0);
const SNAP_WINDOW = 0.34; // s — nudge a punch onto a beat, never further

/** Nearest beat to t, if one is close enough — else t untouched. */
const snap = (t: number): number => {
  let best = t;
  let bestD = SNAP_WINDOW;
  for (const b of BEAT_GRID) {
    const d = Math.abs(b - t);
    if (d < bestD) {
      bestD = d;
      best = b;
    }
    if (b > t + SNAP_WINDOW) break;
  }
  return best;
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const aDur = data.segA.to - data.segA.from;
  const bDur = data.segB.to - data.segB.from;
  const videoSec = aDur + bDur;

  // ── camera: zoom that CENTERS the focus point, clamped to the frame ─────
  // translate+scale (origin 0,0): tx = 640 - s*fx keeps fx at the center;
  // clamping guarantees we never pan past the video edges, so nothing gets
  // cut off at the borders.
  let scale = 1;
  let fx = 640;
  let fy = 360;
  for (const e of data.events) {
    const beat = BEATS[e.label];
    if (!beat) continue;
    const hold = beat.hold ?? ZOOM_HOLD;
    // the zoom PEAK is what the eye+ear register together: put it on the
    // click (snapped to the nearest beat) and derive the envelope start
    const peak = snap(e.ct - (beat.lead ?? 0));
    const s = peak - ZOOM_IN;
    const rel = t - s;
    if (rel < 0 || rel > ZOOM_IN + hold + ZOOM_OUT) continue;
    scale = interpolate(
      rel,
      [0, ZOOM_IN, ZOOM_IN + hold, ZOOM_IN + hold + ZOOM_OUT],
      [1, beat.zoom, beat.zoom, 1],
      { easing: Easing.inOut(Easing.cubic), extrapolateRight: "clamp" }
    );
    fx = beat.fx ?? e.x;
    fy = beat.fy ?? e.y;
    break;
  }
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));
  const tx = clamp(640 - scale * fx, 1280 - 1280 * scale, 0);
  const ty = clamp(360 - scale * fy, 720 - 720 * scale, 0);

  // ── captions ──────────────────────────────────────────────────────────────
  let caption: string | null = null;
  let captionAlpha = 0;
  for (const e of data.events) {
    const beat = BEATS[e.label];
    if (!beat) continue;
    const rel = t - snap(e.ct);
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

  const totalSec = videoSec + OUTRO_SEC;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Audio
        src={staticFile("soundtrack.mp3")}
        startFrom={Math.round(AUDIO_START * fps)}
        volume={f => {
          const s = f / fps;
          return (
            0.55 *
            interpolate(s, [0, 0.9], [0, 1], { extrapolateRight: "clamp" }) *
            interpolate(s, [totalSec - 2.2, totalSec], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          );
        }}
      />
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: "0 0",
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

      {/* intro title — SOLID card (the UI behind made it hard to read) */}
      {introAlpha > 0.01 && (
        <AbsoluteFill
          style={{
            background: BG,
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
