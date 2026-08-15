import React from "react";
import { Composition } from "remotion";
import { Promo, OUTRO_SEC } from "./Promo";
import data from "./data.json";

export const Root: React.FC = () => {
  const videoSec =
    data.segA.to - data.segA.from + (data.segB.to - data.segB.from);
  return (
    <Composition
      id="promo"
      component={Promo}
      durationInFrames={Math.ceil((videoSec + OUTRO_SEC) * data.fps)}
      fps={data.fps}
      width={data.width}
      height={data.height}
    />
  );
};
