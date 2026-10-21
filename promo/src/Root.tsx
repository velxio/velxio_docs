import React from "react";
import { Composition } from "remotion";
import { Promo, OUTRO_SEC } from "./Promo";
import { GalleryDemo, galleryDuration, type GalleryProps } from "./GalleryDemo";
import { RebuildDemo, rebuildDuration, type RebuildProps } from "./RebuildDemo";
import { AgentPromo, agentDuration } from "./AgentPromo";
import { ReelDemo, reelDuration, type ReelProps } from "./ReelDemo";
import { ReelAssemble, assembleDuration, type AssembleProps } from "./ReelAssemble";
import data from "./data.json";

/** Placeholder props; every gallery render passes real ones with --props. */
const GALLERY_DEFAULTS: GalleryProps = {
  slug: "blink-led",
  title: "Blink LED",
  board: "Arduino Uno",
  description: "",
  liveAt: 26,
  endAt: 40,
};

const REBUILD_DEFAULTS: RebuildProps = {
  slug: "pot-adc-reader",
  title: "Potentiometer ADC Reader",
  board: "Arduino Uno",
  description: "",
  parts: 2,
  wires: 3,
  beats: [
    { label: "blank", t: 8000 },
    { label: "run", t: 40000 },
    { label: "live", t: 54000 },
    { label: "end", t: 67000 },
  ],
  box: null,
};

const ASSEMBLE_DEFAULTS: AssembleProps = {
  id: "button-led",
  hook: "Built in the browser",
  kicker: "Arduino Uno",
  beats: { assembled: 4, run: 5, live: 5.6, end: 16, inputs: [] },
  code: null,
};

const REEL_DEFAULTS: ReelProps = {
  slug: REBUILD_DEFAULTS.slug,
  hook: "Built in the browser",
  kicker: "Arduino Uno",
  board: "Arduino Uno",
  beats: REBUILD_DEFAULTS.beats,
  box: null,
};

export const Root: React.FC = () => {
  const videoSec =
    data.segA.to - data.segA.from + (data.segB.to - data.segB.from);
  return (
    <>
    <Composition
      id="promo"
      component={Promo}
      durationInFrames={Math.ceil((videoSec + OUTRO_SEC) * data.fps)}
      fps={data.fps}
      width={data.width}
      height={data.height}
    />
    <Composition
      id="gallery"
      component={GalleryDemo}
      defaultProps={GALLERY_DEFAULTS}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={galleryDuration(GALLERY_DEFAULTS, 30)}
      calculateMetadata={({ props }) => ({
        durationInFrames: galleryDuration(props as GalleryProps, 30),
      })}
    />
    <Composition
      id="rebuild"
      component={RebuildDemo}
      defaultProps={REBUILD_DEFAULTS}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={rebuildDuration(REBUILD_DEFAULTS, 30)}
      calculateMetadata={({ props }) => ({
        durationInFrames: rebuildDuration(props as RebuildProps, 30),
      })}
    />
    <Composition
      id="reel"
      component={ReelDemo}
      defaultProps={REEL_DEFAULTS}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={reelDuration(REEL_DEFAULTS, 30)}
      calculateMetadata={({ props }) => ({
        durationInFrames: reelDuration(props as ReelProps, 30),
      })}
    />
    <Composition
      id="reel-assemble"
      component={ReelAssemble}
      defaultProps={ASSEMBLE_DEFAULTS}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={assembleDuration(ASSEMBLE_DEFAULTS, 30)}
      calculateMetadata={({ props }) => ({
        durationInFrames: assembleDuration(props as AssembleProps, 30),
      })}
    />
    <Composition
      id="agent"
      component={AgentPromo}
      fps={30}
      width={1920}
      height={1080}
      durationInFrames={agentDuration(30)}
    />
    </>
  );
};
