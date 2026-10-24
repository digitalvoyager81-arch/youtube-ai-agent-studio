import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import type { SceneProps } from "../AiExplainer";
import { Appear, StrikeThrough, useProgress } from "../components";
import { COLORS, FONT, MONO } from "../theme";

export const Cat: React.FC<{ size?: number }> = ({ size = 260 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <polygon points="40,70 55,15 90,50" fill={COLORS.highlight} />
    <polygon points="160,70 145,15 110,50" fill={COLORS.highlight} />
    <circle cx={100} cy={110} r={70} fill={COLORS.highlight} />
    <ellipse cx={75} cy={100} rx={9} ry={14} fill={COLORS.background} />
    <ellipse cx={125} cy={100} rx={9} ry={14} fill={COLORS.background} />
    <polygon points="92,125 108,125 100,135" fill={COLORS.negative} />
    {[-1, 1].map((side) =>
      [0, 12].map((dy) => (
        <line
          key={`${side}-${dy}`}
          x1={100 + side * 20}
          y1={132 + dy / 2}
          x2={100 + side * 75}
          y2={124 + dy}
          stroke={COLORS.background}
          strokeWidth={3}
        />
      )),
    )}
  </svg>
);

export const Dog: React.FC<{ size?: number }> = ({ size = 260 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <ellipse cx={42} cy={95} rx={22} ry={50} fill="#B07A45" />
    <ellipse cx={158} cy={95} rx={22} ry={50} fill="#B07A45" />
    <circle cx={100} cy={105} r={65} fill={COLORS.accent} />
    <circle cx={77} cy={92} r={9} fill={COLORS.background} />
    <circle cx={123} cy={92} r={9} fill={COLORS.background} />
    <ellipse cx={100} cy={128} rx={18} ry={13} fill={COLORS.background} />
    <path d="M90 150 Q100 172 110 150 Z" fill={COLORS.negative} />
  </svg>
);

// 10×10 «пиксельная» кошка: X — светлый пиксель
const CAT_BITMAP = [
  "..X....X..",
  ".XX....XX.",
  ".XXXXXXXX.",
  "XXXXXXXXXX",
  "XX.XXXX.XX",
  "XXXXXXXXXX",
  "XXXX..XXXX",
  ".XXXXXXXX.",
  "..XXXXXX..",
  "..........",
];

const PIXELS = CAT_BITMAP.flatMap((row, r) =>
  row.split("").map((ch, c) => {
    const noise = random(`px-${r}-${c}`);
    return ch === "X" ? 0.6 + noise * 0.39 : noise * 0.12;
  }),
);

const PixelCat: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 46px)", gap: 3 }}>
      {PIXELS.map((v, i) => {
        const visible = frame >= at + i * 0.5;
        return (
          <div
            key={i}
            style={{
              width: 46,
              height: 46,
              borderRadius: 4,
              background: `rgba(255, 216, 77, ${v})`,
              opacity: visible ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
};

const NumberGrid: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 78px)", gap: 3 }}>
      {PIXELS.map((v, i) => {
        const visible = frame >= at + i * 0.6;
        return (
          <div
            key={i}
            style={{
              width: 78,
              height: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontSize: 25,
              color: v > 0.5 ? COLORS.highlight : COLORS.muted,
              background: COLORS.surface,
              borderRadius: 4,
              opacity: visible ? 1 : 0,
            }}
          >
            {v.toFixed(2)}
          </div>
        );
      })}
    </div>
  );
};

const PhotoGrid: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const count = Math.floor(interpolate(frame, [at, at + 90], [0, 12000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 170px)", gap: 16 }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const isCat = random(`photo-${i}`) > 0.5;
          return (
            <Appear key={i} at={at + i * 3} y={15} scale>
              <div
                style={{
                  background: COLORS.surface,
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: 14,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {isCat ? <Cat size={90} /> : <Dog size={90} />}
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 22,
                    fontWeight: 600,
                    color: isCat ? COLORS.highlight : COLORS.accent,
                  }}
                >
                  {isCat ? "кошка" : "собака"}
                </div>
              </div>
            </Appear>
          );
        })}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 44, color: COLORS.text }}>
        {count.toLocaleString("ru-RU")} фото
      </div>
    </div>
  );
};

export const Scene03Data: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const beats = scene.sentences.map((s) => s.from);
  const strike = useProgress(beats[1] + 55, beats[1] + 75);

  // Три фазы: кошка/собака → много фото → картинка как числа
  const phaseOpacity = (from: number, to: number) =>
    interpolate(frame, [from, from + 10, to - 10, to], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140 }}>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140, opacity: phaseOpacity(beats[0], beats[2]) }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
          <Appear at={beats[0] + 10} scale>
            <Cat />
          </Appear>
          <Appear at={beats[0] + 40}>
            <div style={{ fontFamily: FONT, fontSize: 120, fontWeight: 800, color: COLORS.muted }}>?</div>
          </Appear>
          <Appear at={beats[0] + 25} scale>
            <Dog />
          </Appear>
        </div>
        <div style={{ display: "flex", gap: 80, marginTop: 50, fontFamily: FONT, fontSize: 56, fontWeight: 700, color: COLORS.text }}>
          <Appear at={beats[1] + 15}>
            <StrikeThrough progress={strike}>«уши»</StrikeThrough>
          </Appear>
          <Appear at={beats[1] + 30}>
            <StrikeThrough progress={strike}>«усы»</StrikeThrough>
          </Appear>
          <Appear at={beats[1] + 45}>
            <StrikeThrough progress={strike}>«хвост»</StrikeThrough>
          </Appear>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140, opacity: phaseOpacity(beats[2], beats[3]) }}
      >
        <PhotoGrid at={beats[2]} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140, opacity: phaseOpacity(beats[3], scene.durationInFrames + 10) }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
          <PixelCat at={beats[3]} />
          <div style={{ fontFamily: FONT, fontSize: 80, color: COLORS.muted }}>=</div>
          <NumberGrid at={beats[3] + 40} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
