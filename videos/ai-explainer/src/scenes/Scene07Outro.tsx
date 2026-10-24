import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneProps } from "../AiExplainer";
import { Appear, StrikeThrough, useProgress } from "../components";
import { COLORS, FONT } from "../theme";

const Pill: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 60,
      fontWeight: 800,
      color: COLORS.background,
      background: color,
      padding: "20px 48px",
      borderRadius: 999,
    }}
  >
    {text}
  </div>
);

const Bell: React.FC<{ angle: number }> = ({ angle }) => (
  <svg width={70} height={70} viewBox="0 0 24 24" style={{ transform: `rotate(${angle}deg)` }}>
    <path
      d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z"
      fill={COLORS.text}
    />
  </svg>
);

export const Scene07Outro: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beats = scene.sentences.map((s) => s.from);
  const strike = useProgress(beats[0] + 95, beats[0] + 115);
  const press = spring({ frame: frame - beats[2] - 60, fps, config: { damping: 8 } });
  const subscribed = frame >= beats[2] + 60;
  const bellAngle = subscribed ? Math.sin((frame - beats[2] - 60) * 0.5) * 20 * Math.max(0, 1 - (frame - beats[2] - 60) / 45) : 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
      <div style={{ display: "flex", gap: 90, fontFamily: FONT, fontSize: 64, fontWeight: 700, color: COLORS.muted }}>
        <Appear at={beats[0] + 30}>
          <StrikeThrough progress={strike}>Магия</StrikeThrough>
        </Appear>
        <Appear at={beats[0] + 60}>
          <StrikeThrough progress={strike}>Разум из фантастики</StrikeThrough>
        </Appear>
      </div>

      <div style={{ display: "flex", gap: 40, marginTop: 70, alignItems: "center" }}>
        <Appear at={beats[1] + 10} scale>
          <Pill text="Математика" color={COLORS.positive} />
        </Appear>
        <Appear at={beats[1] + 35} scale>
          <Pill text="Данные" color={COLORS.highlight} />
        </Appear>
        <Appear at={beats[1] + 60} scale>
          <Pill text="Примеры" color={COLORS.result} />
        </Appear>
      </div>

      <Appear at={beats[2]} style={{ marginTop: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 48,
              fontWeight: 800,
              color: COLORS.text,
              background: subscribed ? COLORS.border : COLORS.negative,
              padding: "22px 56px",
              borderRadius: 16,
              transform: `scale(${subscribed ? 0.92 + 0.08 * press : 1})`,
            }}
          >
            {subscribed ? "Вы подписаны ✓" : "Подписаться"}
          </div>
          <Bell angle={bellAngle} />
        </div>
      </Appear>
    </AbsoluteFill>
  );
};
