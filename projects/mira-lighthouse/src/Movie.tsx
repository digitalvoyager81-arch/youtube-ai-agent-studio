import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, getStaticFiles } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { SCENE_FRAMES, TOTAL_FRAMES } from "./timeline";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];
const FADE = 12;

const SceneCanvas: React.FC<{ Scene: React.FC }> = ({ Scene }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: 45, position: [0, 1, 4], near: 0.05, far: 900 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <Scene />
    </ThreeCanvas>
  );
};

/** dip-to-black between scenes */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const local = f % SCENE_FRAMES;
  const idx = Math.floor(f / SCENE_FRAMES);
  let o = 0;
  if (idx > 0) o = Math.max(o, interpolate(local, [0, FADE], [1, 0], { extrapolateRight: "clamp" }));
  if (idx < SCENES.length - 1) o = Math.max(o, interpolate(local, [SCENE_FRAMES - FADE, SCENE_FRAMES], [0, 1], { extrapolateLeft: "clamp" }));
  // opening fade-in & long final fade-out
  o = Math.max(o, interpolate(f, [0, 20], [1, 0], { extrapolateRight: "clamp" }));
  o = Math.max(o, interpolate(f, [TOTAL_FRAMES - 45, TOTAL_FRAMES - 1], [0, 1], { extrapolateLeft: "clamp" }));
  return <AbsoluteFill style={{ backgroundColor: "black", opacity: o }} />;
};

export const Movie: React.FC = () => {
  const hasMusic = getStaticFiles().some((s) => s.name === "soundtrack.wav");
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SCENES.map((Scene, i) => (
        <Sequence key={i} from={i * SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
          <SceneCanvas Scene={Scene} />
        </Sequence>
      ))}
      {/* cinematic vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      <Fades />
      {hasMusic && <Audio src={staticFile("soundtrack.wav")} />}
    </AbsoluteFill>
  );
};
