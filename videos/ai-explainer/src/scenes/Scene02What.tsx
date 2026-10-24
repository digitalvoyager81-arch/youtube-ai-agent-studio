import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../AiExplainer";
import { Appear, Arrow, Card, useProgress } from "../components";
import { COLORS, FONT } from "../theme";

const Block: React.FC<{ text: string; color: string; glow?: boolean }> = ({ text, color, glow }) => {
  const frame = useCurrentFrame();
  const pulse = glow ? 1 + Math.sin(frame * 0.15) * 0.04 : 1;
  return (
    <Card
      color={color}
      style={{
        width: 300,
        textAlign: "center",
        fontSize: 46,
        fontWeight: 700,
        color,
        transform: `scale(${pulse})`,
        boxShadow: glow ? `0 0 50px ${color}66` : "none",
      }}
    >
      {text}
    </Card>
  );
};

const Plus: React.FC = () => (
  <div style={{ fontFamily: FONT, fontSize: 70, color: COLORS.muted, width: 60, textAlign: "center" }}>+</div>
);

const Row: React.FC<{
  label: string;
  labelColor: string;
  labelAt: number;
  at: number;
  blocks: [string, string, string];
  colors: [string, string, string];
  glowLast?: boolean;
}> = ({ label, labelColor, labelAt, at, blocks, colors, glowLast }) => {
  const arrow = useProgress(at + 30, at + 50);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Appear at={labelAt}>
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: labelColor }}>{label}</div>
      </Appear>
      <div style={{ display: "flex", alignItems: "center", gap: 24, height: 130 }}>
        <Appear at={at}>
          <Block text={blocks[0]} color={colors[0]} />
        </Appear>
        <Appear at={at + 12}>
          <Plus />
        </Appear>
        <Appear at={at + 18}>
          <Block text={blocks[1]} color={colors[1]} />
        </Appear>
        <Appear at={at + 30}>
          <Arrow progress={arrow} width={140} />
        </Appear>
        <Appear at={at + 50} scale>
          <Block text={blocks[2]} color={colors[2]} glow={glowLast} />
        </Appear>
      </div>
    </div>
  );
};

export const Scene02What: React.FC<SceneProps> = ({ scene }) => {
  const beats = scene.sentences.map((s) => s.from);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 90 }}>
        <Row
          label="Обычная программа"
          labelColor={COLORS.muted}
          labelAt={beats[0]}
          at={beats[0] + 20}
          blocks={["Правила", "Данные", "Ответы"]}
          colors={[COLORS.highlight, COLORS.positive, COLORS.result]}
        />
        <Row
          label="Искусственный интеллект"
          labelColor={COLORS.highlight}
          labelAt={beats[1]}
          at={beats[2]}
          blocks={["Данные", "Ответы", "Правила"]}
          colors={[COLORS.positive, COLORS.result, COLORS.highlight]}
          glowLast
        />
      </div>
    </AbsoluteFill>
  );
};
