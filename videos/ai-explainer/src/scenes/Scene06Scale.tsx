import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { SceneProps } from "../AiExplainer";
import { Appear, Card } from "../components";
import { COLORS, FONT, MONO } from "../theme";

const QUESTION = "Объясни, что такое нейросеть";
const ANSWER = "Нейросеть — это программа из слоёв простых вычислений, которая учится на примерах, подстраивая свои веса…";

const Counter: React.FC<{ at: number; to: number; label: string; color: string }> = ({ at, to, label, color }) => {
  const frame = useCurrentFrame();
  // Экспоненциальный рост выглядит честнее линейного для таких порядков
  const p = interpolate(frame, [at, at + 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const value = p === 0 ? 0 : Math.round(Math.pow(10, Math.log10(to) * p));
  return (
    <Appear at={at}>
      <Card color={color} style={{ width: 900, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 68, fontWeight: 700, color }}>
          {value.toLocaleString("ru-RU")}+
        </div>
        <div style={{ fontSize: 38, fontWeight: 600, marginTop: 8 }}>{label}</div>
      </Card>
    </Appear>
  );
};

export const Scene06Scale: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const beats = scene.sentences.map((s) => s.from);

  const typed = Math.floor(
    interpolate(frame, [beats[0] + 60, beats[1] - 20], [0, ANSWER.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const chatOpacity = interpolate(frame, [beats[1] - 10, beats[1] + 5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160, opacity: chatOpacity }}>
        <div style={{ width: 1200, display: "flex", flexDirection: "column", gap: 30, fontFamily: FONT }}>
          <Appear at={beats[0] + 10} style={{ alignSelf: "flex-end" }}>
            <div
              style={{
                background: COLORS.positive,
                color: COLORS.background,
                fontSize: 40,
                fontWeight: 600,
                padding: "22px 34px",
                borderRadius: "28px 28px 6px 28px",
              }}
            >
              {QUESTION}
            </div>
          </Appear>
          <Appear at={beats[0] + 50} style={{ alignSelf: "flex-start" }}>
            <div
              style={{
                background: COLORS.surface,
                border: `3px solid ${COLORS.border}`,
                color: COLORS.text,
                fontSize: 40,
                lineHeight: 1.4,
                padding: "22px 34px",
                borderRadius: "28px 28px 28px 6px",
                maxWidth: 1000,
                minHeight: 60,
              }}
            >
              {ANSWER.slice(0, typed)}
              <span style={{ color: COLORS.highlight, opacity: cursorOn ? 1 : 0 }}>▍</span>
            </div>
          </Appear>
        </div>
      </AbsoluteFill>

      <div style={{ display: "flex", flexDirection: "column", gap: 50, alignItems: "center" }}>
        <Counter at={beats[1] + 15} to={1e12} label="слов в обучающих текстах" color={COLORS.highlight} />
        <Counter at={beats[1] + 60} to={1e11} label="весов в нейросети" color={COLORS.positive} />
      </div>
    </AbsoluteFill>
  );
};
