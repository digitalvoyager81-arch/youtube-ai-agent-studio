import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneProps } from "../AiExplainer";
import { Appear, useProgress } from "../components";
import { COLORS, FONT, MONO } from "../theme";

const W = 1500;
const H = 560;
const LAYERS = [5, 6, 6, 2];
const INPUTS = [0.82, 0.12, 0.95, 0.07, 0.64];
const FOCUS = { layer: 1, index: 3 }; // нейрон, на котором показываем вычисление

const layerX = (l: number) => 200 + l * ((W - 400) / (LAYERS.length - 1));
const nodeY = (l: number, i: number) => {
  const n = LAYERS[l];
  const gap = 88;
  return H / 2 + (i - (n - 1) / 2) * gap;
};
const weight = (l: number, i: number, j: number) => random(`w-${l}-${i}-${j}`) * 2 - 1;

type Edge = { l: number; i: number; j: number; w: number };
const EDGES: Edge[] = [];
for (let l = 0; l < LAYERS.length - 1; l++) {
  for (let i = 0; i < LAYERS[l]; i++) {
    for (let j = 0; j < LAYERS[l + 1]; j++) {
      EDGES.push({ l, i, j, w: weight(l, i, j) });
    }
  }
}

export const Scene04Network: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beats = scene.sentences.map((s) => s.from);

  const layerAt = (l: number) => beats[0] + 15 + l * 22;
  const edgesProgress = useProgress(beats[0] + 100, beats[0] + 140);
  const focusOn = frame >= beats[1];
  const outputOn = frame >= beats[2] + 50;

  // Импульсы бегут слой за слоем
  const pulseStart = beats[0] + 140;
  const cycle = 45;
  const t = frame - pulseStart;
  const segment = t >= 0 ? Math.floor(t / cycle) % (LAYERS.length - 1) : -1;
  const pulseP = t >= 0 ? (t % cycle) / cycle : 0;

  // Формула для выделенного нейрона: входы × веса
  const focusTerms = INPUTS.slice(0, 3).map((x, i) => ({
    x,
    w: weight(0, i, FOCUS.index),
  }));
  const focusSum = INPUTS.reduce((s, x, i) => s + x * weight(0, i, FOCUS.index), 0);

  const outputs = [0.92, 0.08];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {EDGES.map((e, k) => {
          const isFocus = focusOn && e.l === 0 && e.j === FOCUS.index;
          const dim = focusOn && !isFocus;
          const x1 = layerX(e.l);
          const y1 = nodeY(e.l, e.i);
          const x2 = layerX(e.l + 1);
          const y2 = nodeY(e.l + 1, e.j);
          return (
            <line
              key={k}
              x1={x1}
              y1={y1}
              x2={x1 + (x2 - x1) * edgesProgress}
              y2={y1 + (y2 - y1) * edgesProgress}
              stroke={e.w > 0 ? COLORS.positive : COLORS.negative}
              strokeWidth={isFocus ? 5 : 1 + Math.abs(e.w) * 2.5}
              opacity={dim ? 0.08 : isFocus ? 1 : 0.15 + Math.abs(e.w) * 0.45}
            />
          );
        })}

        {!focusOn &&
          segment >= 0 &&
          EDGES.filter((e) => e.l === segment && Math.abs(e.w) > 0.45).map((e, k) => {
            const x = layerX(e.l) + (layerX(e.l + 1) - layerX(e.l)) * pulseP;
            const y = nodeY(e.l, e.i) + (nodeY(e.l + 1, e.j) - nodeY(e.l, e.i)) * pulseP;
            return <circle key={`p${k}`} cx={x} cy={y} r={7} fill={COLORS.highlight} opacity={0.9} />;
          })}

        {LAYERS.map((n, l) =>
          Array.from({ length: n }).map((_, i) => {
            const s = spring({ frame: frame - layerAt(l) - i * 3, fps, config: { damping: 12 } });
            const isFocus = focusOn && l === FOCUS.layer && i === FOCUS.index;
            const isOutput = l === LAYERS.length - 1;
            const fill = isOutput && outputOn ? (i === 0 ? COLORS.result : COLORS.surface) : COLORS.surface;
            return (
              <g key={`${l}-${i}`} transform={`translate(${layerX(l)} ${nodeY(l, i)}) scale(${Math.max(0, s)})`}>
                <circle
                  r={30}
                  fill={isFocus ? COLORS.highlight : fill}
                  stroke={isFocus ? COLORS.highlight : COLORS.text}
                  strokeWidth={3}
                />
                {l === 0 && (
                  <text x={-50} y={9} textAnchor="end" fontFamily={MONO} fontSize={26} fill={COLORS.highlight}>
                    {INPUTS[i].toFixed(2)}
                  </text>
                )}
              </g>
            );
          }),
        )}

        {["кошка", "собака"].map((label, i) => {
          const p = spring({ frame: frame - beats[2] - 50 - i * 10, fps, config: { damping: 14 } });
          const x = layerX(LAYERS.length - 1) + 55;
          const y = nodeY(LAYERS.length - 1, i);
          return (
            <g key={label} opacity={frame >= beats[2] ? 1 : 0}>
              <text x={x} y={y - 4} fontFamily={FONT} fontSize={30} fontWeight={700} fill={COLORS.text}>
                {label}
              </text>
              <rect x={x} y={y + 8} width={160} height={14} rx={7} fill={COLORS.border} />
              <rect x={x} y={y + 8} width={160 * outputs[i] * p} height={14} rx={7} fill={i === 0 ? COLORS.result : COLORS.muted} />
              <text x={x + 175} y={y + 22} fontFamily={MONO} fontSize={26} fill={i === 0 ? COLORS.result : COLORS.muted}>
                {Math.round(outputs[i] * 100 * p)}%
              </text>
            </g>
          );
        })}

        {LAYERS.map((_, l) => (
          <text
            key={`label-${l}`}
            x={layerX(l)}
            y={H + 20}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={24}
            fill={COLORS.muted}
            opacity={interpolate(frame, [layerAt(l), layerAt(l) + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          >
            {l === 0 ? "вход" : l === LAYERS.length - 1 ? "ответ" : "скрытый слой"}
          </text>
        ))}
      </svg>

      <div style={{ height: 90, marginTop: 40, display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 36 }}>
        {focusTerms.map((term, i) => (
          <Appear key={i} at={beats[1] + 30 + i * 20} y={10}>
            <span style={{ color: COLORS.text, whiteSpace: "pre" }}>
              {i > 0 ? " + " : ""}
              <span style={{ color: COLORS.highlight }}>{term.x.toFixed(2)}</span>
              <span style={{ color: COLORS.muted }}>×</span>
              <span style={{ color: term.w > 0 ? COLORS.positive : COLORS.negative }}>
                {term.w > 0 ? term.w.toFixed(2) : `(${term.w.toFixed(2)})`}
              </span>
            </span>
          </Appear>
        ))}
        <Appear at={beats[1] + 90} y={10}>
          <span style={{ color: COLORS.muted, whiteSpace: "pre" }}> + … = </span>
        </Appear>
        <Appear at={beats[1] + 110} scale>
          <span style={{ color: COLORS.result, fontWeight: 700 }}>{focusSum.toFixed(2)}</span>
        </Appear>
      </div>
    </AbsoluteFill>
  );
};
