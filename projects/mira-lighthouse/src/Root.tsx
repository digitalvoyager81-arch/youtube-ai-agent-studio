import React from "react";
import { Composition } from "remotion";
import { Movie } from "./Movie";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MiraLighthouse"
    component={Movie}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
