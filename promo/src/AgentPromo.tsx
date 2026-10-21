import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  Easing,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import data from "./agent-data.json";

/**
 * The cinematic agent promo: a dark stage, one headline per step, and a
 * FLOATING CARD cut out of the real take for each step (the composer being
 * typed into, the canvas while parts land, the wiring, the code, the chat
 * explaining, the compile progress card, the serial monitor at boot, the
 * display coming alive, the follow-up request). The scene list comes
 * resolved from prepare-agent.mjs; this file only knows how to stage a
 * scene. Scenes overlap (prepare's OVERLAP): the next headline and card
 * come in while the previous card fades, and the stage itself (glow + grid
 * floor) lives outside the scenes so it never blinks.
 */

type Box = { x: number; y: number; w: number; h: number };
type Card = {
  crop: Box;
  place: { x: number; y: number; w: number };
  src: { start: number; end: number; rate: number };
  /** seconds into the scene the card enters */
  at?: number;
  /** seconds into the scene the card leaves (default: with the scene) */
  until?: number;
  /** [rotateX, rotateY] degrees */
  tilt?: [number, number];
  /** scale from -> to across the card's life (default: a slow dolly in) */
  zoom?: [number, number];
  /** crop pan down, CSS px from -> to across the card's life */
  pan?: [number, number];
  dim?: boolean;
};
type Scene = {
  id: string;
  kind: "logo" | "cards" | "boards" | "claim" | "outro";
  from: number;
  to: number;
  dur: number;
  headline?: [string, string];
  cards?: Card[];
  boards?: { file: string; name: string }[];
  text?: string;
};

const BG = "#050506";
const ACCENT_TEXT = "#3ea2ff";
const TEXT = "#f5f5f7";
const MUTED = "#86868b";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const TAKE = data.take;
const SCENES = data.scenes as Scene[];
const AUDIO = (data as { audio?: { file: string; start: number; volume: number } }).audio ?? {
  file: "soundtrack.mp3",
  start: 7.94,
  volume: 0.42,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

/** 0 -> 1 over [a, b] with an easing, clamped. */
const ramp = (t: number, a: number, b: number, e = easeOut) =>
  e(clamp01((t - a) / Math.max(1e-6, b - a)));

// ── stage: one continuous glow + grid floor under every scene ─────────────

const cardCentre = (s: Scene): [number, number] => {
  const c = s.cards?.[0];
  if (!c) return [960, 560];
  return [c.place.x + c.place.w / 2, c.place.y + (c.place.w * (c.crop.h / c.crop.w)) / 2];
};

const Stage: React.FC<{ t: number }> = ({ t }) => {
  // the glow drifts from one card centre to the next
  const keys = SCENES.map((s) => s.from + 0.6);
  const xs = SCENES.map((s) => cardCentre(s)[0]);
  const ys = SCENES.map((s) => cardCentre(s)[1]);
  const gx = interpolate(t, keys, xs, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const gy = interpolate(t, keys, ys, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  // the grid floor is for the card scenes: in after the logo, out before the claim
  const firstCards = SCENES.find((s) => s.kind === "cards");
  const claim = SCENES.find((s) => s.kind === "claim");
  const gridIn = firstCards ? ramp(t, firstCards.from - 0.4, firstCards.from + 0.9) : 1;
  const gridOut = claim ? 1 - ramp(t, claim.from - 0.3, claim.from + 0.6, easeInOut) : 1;
  const slide = Math.sin(t * 0.21) * 26; // slow parallax
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1300px 760px at ${gx}px ${gy}px, rgba(0,113,227,0.17), rgba(0,113,227,0) 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -800 + slide,
          top: 560,
          width: 3520,
          height: 1800,
          opacity: gridIn * gridOut,
          transform: "perspective(900px) rotateX(74deg)",
          transformOrigin: "50% 0%",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.075) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0) 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0) 85%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── headline: words rise in one after another ─────────────────────────────

const Headline: React.FC<{ parts: [string, string]; t: number; dur: number }> = ({ parts, t, dur }) => {
  const out = 1 - ramp(t, dur - 0.5, dur - 0.08, easeInOut);
  const words: { w: string; accent: boolean }[] = [];
  for (const w of parts[0].split(/(\s+)/)) if (w.trim()) words.push({ w, accent: false });
  for (const w of parts[1].split(/(\s+)/)) if (w.trim()) words.push({ w, accent: true });
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        top: 104,
        fontFamily: FONT,
        fontSize: 56,
        fontWeight: 600,
        letterSpacing: -0.6,
        lineHeight: 1.15,
        opacity: out,
        textShadow: "0 2px 24px rgba(0,0,0,0.6)",
        display: "flex",
        flexWrap: "wrap",
        gap: "0 0.28em",
        maxWidth: 1700,
      }}
    >
      {words.map((w, i) => {
        const a = ramp(t, 0.05 + i * 0.07, 0.5 + i * 0.07);
        return (
          <span
            key={i}
            style={{
              color: w.accent ? ACCENT_TEXT : TEXT,
              opacity: a,
              transform: `translateY(${(1 - a) * 22}px)`,
              display: "inline-block",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ── a floating card cut from the take ─────────────────────────────────────

const TakeCard: React.FC<{ card: Card; t: number; dur: number; fps: number }> = ({
  card,
  t,
  dur,
  fps,
}) => {
  const at = card.at ?? 0.3;
  const until = card.until ?? dur;
  const local = t - at;
  if (local < 0 || t > until + 0.05) return null;
  const enter = ramp(local, 0, 0.55);
  const out = 1 - ramp(t, until - 0.45, until - 0.02, easeInOut);
  const k = card.place.w / (card.crop.w * TAKE.dsf);
  const h = card.place.w * (card.crop.h / card.crop.w);
  const [rx, ry] = card.tilt ?? [2, -5];
  const life = until - at;
  const drift = interpolate(local, [0, life], [-1.4, 1.4], { extrapolateRight: "clamp" });
  const dolly = card.zoom ?? [1.0, 1.045];
  const zoom = interpolate(local, [0.2, life - 0.2], dolly, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const pan = card.pan
    ? interpolate(local, [0.8, life - 0.5], card.pan, {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeInOut,
      })
    : 0;
  const scale = (0.95 + 0.05 * enter) * zoom;
  const lift = (1 - enter) * 56;
  const startFrom = Math.max(0, Math.round(card.src.start * fps));
  const playDur = Math.max(0.2, life);
  const endAt = startFrom + Math.ceil(playDur * card.src.rate * fps) + 4;
  return (
    <div
      style={{
        position: "absolute",
        left: card.place.x,
        top: card.place.y,
        width: card.place.w,
        height: h,
        opacity: enter * out * (card.dim ? 0.9 : 1),
        transform: `perspective(2400px) translateY(${lift}px) rotateX(${rx}deg) rotateY(${ry + drift}deg) scale(${scale})`,
        transformOrigin: "50% 50%",
        borderRadius: 18,
        overflow: "hidden",
        background: "#0d0d0f",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.6), 0 0 90px rgba(0,113,227,0.10)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -card.crop.x * TAKE.dsf * k,
          top: -(card.crop.y + pan) * TAKE.dsf * k,
          width: TAKE.width * k,
          height: TAKE.height * k,
        }}
      >
        <Sequence from={Math.round(at * fps)} durationInFrames={Math.ceil(playDur * fps) + 2} layout="none">
          <OffthreadVideo
            src={staticFile(TAKE.file)}
            startFrom={startFrom}
            endAt={endAt}
            playbackRate={card.src.rate}
            muted
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </Sequence>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ── logo mark (the favicon IC, drawn in) ──────────────────────────────────

const LogoMark: React.FC<{ size: number; t: number; animate?: boolean }> = ({ size, t, animate = true }) => {
  const body = animate ? ramp(t, 0.1, 0.75, Easing.out(Easing.back(1.4))) : 1;
  const pins = [
    [12, 3, 3, 5],
    [17, 3, 3, 5],
    [24, 12, 5, 3],
    [24, 17, 5, 3],
    [17, 24, 3, 5],
    [12, 24, 3, 5],
    [3, 17, 5, 3],
    [3, 12, 5, 3],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ filter: "drop-shadow(0 0 28px rgba(0,122,204,0.55))", overflow: "visible" }}
    >
      <g transform={`translate(16 16) scale(${body}) translate(-16 -16)`}>
        <rect x="8" y="8" width="16" height="16" rx="2" fill="#007acc" />
        <rect x="11" y="11" width="10" height="10" rx="1" fill="#005fa3" />
      </g>
      {pins.map(([x, y, w, h], i) => {
        const p = animate ? ramp(t, 0.55 + i * 0.08, 0.85 + i * 0.08, Easing.out(Easing.back(2))) : 1;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx="1"
            fill="#007acc"
            transform={`translate(${x + w / 2} ${y + h / 2}) scale(${p}) translate(${-(x + w / 2)} ${-(y + h / 2)})`}
          />
        );
      })}
    </svg>
  );
};

const LogoScene: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const word = ramp(t, 1.2, 1.9);
  const out = 1 - ramp(t, dur - 0.55, dur - 0.05, easeInOut);
  return (
    <AbsoluteFill style={{ opacity: out, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 34, transform: `translateX(${-(word * 120)}px)` }}>
        <LogoMark size={190} t={t} />
        <div
          style={{
            fontFamily: FONT,
            fontSize: 150,
            fontWeight: 700,
            letterSpacing: -4,
            color: TEXT,
            opacity: word,
            transform: `translateX(${(1 - word) * 40}px)`,
            width: word > 0 ? "auto" : 0,
            overflow: "visible",
          }}
        >
          Velxio
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── boards montage: a named grid that glides past the camera ──────────────

const BoardsScene: React.FC<{ boards: { file: string; name: string }[]; t: number; dur: number }> = ({
  boards,
  t,
  dur,
}) => {
  const cols = 4;
  const cellW = 350;
  const cellH = 262;
  const gap = 26;
  const gridW = cols * cellW + (cols - 1) * gap;
  const rows = Math.ceil(boards.length / cols);
  const gridH = rows * cellH + (rows - 1) * gap;
  const left = (1920 - gridW) / 2;
  const top = 232;
  const out = 1 - ramp(t, dur - 0.5, dur - 0.05, easeInOut);
  const tiltIn = ramp(t, 0, 1.2, easeOut);
  const glide = interpolate(t, [0, dur], [40, -40]);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: gridW,
        height: gridH,
        opacity: out,
        transform: `perspective(2200px) rotateX(${14 - 4 * tiltIn}deg) translateX(${glide}px) translateY(${(1 - tiltIn) * 30}px)`,
        transformOrigin: "50% 100%",
      }}
    >
      {boards.map((b, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const p = ramp(t, 0.12 + i * 0.09, 0.6 + i * 0.09, Easing.out(Easing.back(1.6)));
        const float = Math.sin(t * 1.6 + i * 0.9) * 4;
        return (
          <div
            key={b.file}
            style={{
              position: "absolute",
              left: c * (cellW + gap),
              top: r * (cellH + gap),
              width: cellW,
              height: cellH,
              opacity: clamp01(p * 1.2),
              transform: `translateY(${(1 - p) * 40 + float}px) scale(${0.85 + 0.15 * p})`,
              borderRadius: 16,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              overflow: "hidden",
              padding: "14px 16px 12px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile(b.file)} style={{ maxWidth: cellW - 40, maxHeight: cellH - 64, objectFit: "contain" }} />
            </div>
            <div style={{ fontFamily: FONT, fontSize: 19, color: MUTED, letterSpacing: 0.1, whiteSpace: "nowrap" }}>
              {b.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── composition ───────────────────────────────────────────────────────────

export const agentDuration = (fps: number) => Math.ceil(data.totalSec * fps);

export const AgentPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const total = data.totalSec;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>
      <Audio
        src={staticFile(AUDIO.file)}
        startFrom={Math.round(AUDIO.start * fps)}
        volume={(f) => {
          const s = f / fps;
          return (
            AUDIO.volume *
            interpolate(s, [0, 1.4], [0, 1], { extrapolateRight: "clamp" }) *
            interpolate(s, [total - 2.6, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          );
        }}
      />
      <Stage t={t} />
      {SCENES.map((scene) => {
        const from = Math.round(scene.from * fps);
        const durF = Math.ceil(scene.dur * fps);
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durF} layout="none">
            <SceneView scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = scene.dur;

  if (scene.kind === "logo") return <LogoScene t={t} dur={dur} />;
  if (scene.kind === "claim") {
    const a = ramp(t, 0.1, 0.9) * (1 - ramp(t, dur - 0.6, dur - 0.05, easeInOut));
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 480,
          textAlign: "center",
          fontSize: 70,
          fontWeight: 600,
          letterSpacing: -1,
          color: TEXT,
          opacity: a,
          transform: `translateY(${(1 - ramp(t, 0.1, 0.9)) * 20}px)`,
        }}
      >
        {scene.text}
      </div>
    );
  }
  if (scene.kind === "outro") {
    const a = ramp(t, 0.05, 0.7);
    const sub = ramp(t, 0.5, 1.2);
    return (
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
          <LogoMark size={96} t={t} animate={false} />
          <div style={{ fontSize: 108, fontWeight: 800, letterSpacing: -3, color: TEXT }}>
            velxio<span style={{ color: ACCENT_TEXT }}>.dev</span>
          </div>
        </div>
        <div style={{ marginTop: 22, fontSize: 32, color: MUTED, opacity: sub, letterSpacing: 0.2 }}>
          Real boards. Real firmware. Zero setup.
        </div>
      </AbsoluteFill>
    );
  }
  if (scene.kind === "boards") {
    return (
      <AbsoluteFill>
        {scene.headline && <Headline parts={scene.headline} t={t} dur={dur} />}
        <BoardsScene boards={scene.boards ?? []} t={t} dur={dur} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      {scene.headline && <Headline parts={scene.headline} t={t} dur={dur} />}
      {(scene.cards ?? []).map((c, i) => (
        <TakeCard key={i} card={c} t={t} dur={dur} fps={fps} />
      ))}
    </AbsoluteFill>
  );
};
