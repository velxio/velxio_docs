import React from "react";
import { Composition } from "remotion";
import { Promo, OUTRO_SEC } from "./Promo";
import { GalleryDemo, galleryDuration, type GalleryProps } from "./GalleryDemo";
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
    </>
  );
};
