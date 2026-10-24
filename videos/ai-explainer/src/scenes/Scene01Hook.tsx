import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneProps } from "../AiExplainer";
import { Appear, Card } from "../components";
import { COLORS, FONT, MONO } from "../theme";

const FaceIcon: React.FC = () => {
  const frame = useCurrentFrame();
  const scanY = 40 + ((frame * 3) % 160);
  return (
    <svg width={240} height={240} viewBox="0 0 240 240">
      {/* уголки рамки сканера */}
      {[
        "M20 60 V20 H60",
        "M180 20 H220 V60",
        "M220 180 V220 H180",
        "M60 220 H20 V180",
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke={COLORS.positive} strokeWidth={8} strokeLinecap="round" />
      ))}
      <circle cx={120} cy={115} r={62} fill="none" stroke={COLORS.text} strokeWidth={6} />
      <circle cx={98} cy={105} r={7} fill={COLORS.text} />
      <circle cx={142} cy={105} r={7} fill={COLORS.text} />
      <path d="M95 138 Q120 158 145 138" fill="none" stroke={COLORS.text} strokeWidth={6} strokeLinecap="round" />
      <line x1={30} x2={210} y1={scanY} y2={scanY} stroke={COLORS.result} strokeWidth={4} opacity={0.8} />
    </svg>
  );
};

const RecommendIcon: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.floor(frame / 20) % 6;
  return (
    <svg width={240} height={240} viewBox="0 0 240 240">
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 20 + (i % 2) * 105;
        const y = 22 + Math.floor(i / 2) * 68;
        const on = i === active;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={95}
              height={56}
              rx={10}
              fill={on ? COLORS.negative : COLORS.border}
              opacity={on ? 1 : 0.8}
            />
            <polygon points={`${x + 40},${y + 16} ${x + 40},${y + 40} ${x + 60},${y + 28}`} fill={COLORS.text} />
          </g>
        );
      })}
    </svg>
  );
};

const TranslateIcon: React.FC = () => (
  <svg width={240} height={240} viewBox="0 0 240 240">
    <rect x={14} y={40} width={130} height={90} rx={16} fill={COLORS.border} />
    <text x={79} y={98} textAnchor="middle" fontFamily={MONO} fontSize={34} fill={COLORS.text}>
      Hello
    </text>
    <rect x={96} y={120} width={130} height={90} rx={16} fill={COLORS.positive} />
    <text x={161} y={178} textAnchor="middle" fontFamily={MONO} fontSize={30} fill={COLORS.background} fontWeight={700}>
      Привет
    </text>
  </svg>
);

const EXAMPLES = [
  { label: "Узнаёт лицо", Icon: FaceIcon },
  { label: "Подбирает видео", Icon: RecommendIcon },
  { label: "Переводит текст", Icon: TranslateIcon },
];

export const Scene01Hook: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beats = scene.sentences.map((s) => s.from);

  // На 4-м предложении карточки уезжают вверх, освобождая место заголовку
  const lift = spring({ frame: frame - beats[3], fps, config: { damping: 18 } });
  const cardsY = interpolate(lift, [0, 1], [0, -190]);
  const cardsScale = interpolate(lift, [0, 1], [1, 0.62]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 120 }}>
      <div
        style={{
          display: "flex",
          gap: 60,
          transform: `translateY(${cardsY}px) scale(${cardsScale})`,
        }}
      >
        {EXAMPLES.map(({ label, Icon }, i) => (
          <Appear key={label} at={beats[i]} scale>
            <Card style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <Icon />
              <div style={{ fontSize: 40, fontWeight: 600 }}>{label}</div>
            </Card>
          </Appear>
        ))}
      </div>

      <div style={{ position: "absolute", top: 520, textAlign: "center", fontFamily: FONT }}>
        <Appear at={beats[3] + 40}>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              color: COLORS.text,
              textShadow: `0 0 40px ${COLORS.positive}88`,
            }}
          >
            Искусственный интеллект
          </div>
        </Appear>
        <Appear at={beats[4]}>
          <div style={{ fontSize: 64, fontWeight: 600, color: COLORS.highlight, marginTop: 20 }}>
            Как он на самом деле работает?
          </div>
        </Appear>
      </div>
    </AbsoluteFill>
  );
};
