import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SCENES, SceneConfig, getSceneStart, TOTAL_FRAMES } from "./audioConfig";
import { COLORS, FONT } from "./theme";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02What } from "./scenes/Scene02What";
import { Scene03Data } from "./scenes/Scene03Data";
import { Scene04Network } from "./scenes/Scene04Network";
import { Scene05Learning } from "./scenes/Scene05Learning";
import { Scene06Scale } from "./scenes/Scene06Scale";
import { Scene07Outro } from "./scenes/Scene07Outro";

export type SceneProps = { scene: SceneConfig };

const SCENE_COMPONENTS: Record<string, React.FC<SceneProps>> = {
  "01-hook": Scene01Hook,
  "02-what": Scene02What,
  "03-data": Scene03Data,
  "04-network": Scene04Network,
  "05-learning": Scene05Learning,
  "06-scale": Scene06Scale,
  "07-outro": Scene07Outro,
};

const FADE = 12;

// Обёртка сцены: плавный вход/выход, номер и название в углу
const SceneFrame: React.FC<{ scene: SceneConfig; index: number; children: React.ReactNode }> = ({
  scene,
  index,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, scene.durationInFrames - FADE, scene.durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 64,
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 600,
          color: COLORS.muted,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: COLORS.highlight }}>{String(index + 1).padStart(2, "0")}</span>
        {"  ·  "}
        {scene.title}
      </div>
    </AbsoluteFill>
  );
};

// Субтитры: текущее предложение озвучки
const Subtitles: React.FC<{ scene: SceneConfig }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const current = scene.sentences.find((s, i) => {
    const next = scene.sentences[i + 1];
    return frame >= s.from && frame < (next ? next.from : scene.durationInFrames - FADE);
  });
  if (!current) return null;
  const opacity = interpolate(frame, [current.from, current.from + 6], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          padding: "14px 32px",
          borderRadius: 14,
          background: "rgba(0, 0, 0, 0.6)",
          color: COLORS.text,
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        {current.text}
      </div>
    </div>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 8,
        width: `${(frame / TOTAL_FRAMES) * 100}%`,
        background: COLORS.positive,
      }}
    />
  );
};

// Едва заметная сетка на фоне
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.3) % 60;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        backgroundPosition: `${shift}px ${shift}px`,
      }}
    />
  );
};

export const AiExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <Background />
      {SCENES.map((scene, i) => {
        const Component = SCENE_COMPONENTS[scene.id];
        return (
          <Sequence key={scene.id} from={getSceneStart(i)} durationInFrames={scene.durationInFrames}>
            <SceneFrame scene={scene} index={i}>
              <Component scene={scene} />
            </SceneFrame>
            <Subtitles scene={scene} />
            <Audio src={staticFile(`audio/${scene.audioFile}`)} />
          </Sequence>
        );
      })}
      <ProgressBar />
    </AbsoluteFill>
  );
};
