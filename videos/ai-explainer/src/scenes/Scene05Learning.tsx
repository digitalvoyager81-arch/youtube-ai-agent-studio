import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import type { SceneProps } from "../AiExplainer";
import { Appear, Card } from "../components";
import { COLORS, FONT, MONO } from "../theme";

const N_WEIGHTS = 6;
const START = Array.from({ length: N_WEIGHTS }, (_, k) => random(`ws-${k}`) * 2 - 1);
const TARGET = [0.7, -0.4, 0.9, -0.8, 0.3, 0.55];

const CHART_W = 760;
const CHART_H = 440;
const PAD = 60;

// Точность (%) в зависимости от прогресса обучения p ∈ [0, 1]
const accuracy = (p: number) => {
  const smooth = (1 - Math.exp(-4 * p)) / (1 - Math.exp(-4));
  const noise = (random(`acc-${Math.round(p * 200)}`) - 0.5) * 10 * (1 - p);
  return Math.max(35, Math.min(99, 50 + 48 * smooth + noise));
};

export const Scene05Learning: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const beats = scene.sentences.map((s) => s.from);
  const end = scene.durationInFrames - 30;

  const p = interpolate(frame, [beats[0] + 20, beats[1], beats[2], end], [0, 0.06, 0.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const converge = (1 - Math.exp(-5 * p)) / (1 - Math.exp(-5));
  const acc = accuracy(p);

  // Поправки весов «ступеньками», пока идёт фраза про ошибки
  const correcting = frame >= beats[1] && frame < beats[2];
  const errorFlash = correcting && Math.floor((frame - beats[1]) / 30) % 2 === 0;

  const guess = Math.floor(frame / 14) % 2 === 0 ? "кошка?" : "собака?";
  const status =
    frame < beats[1]
      ? { text: `Угадывает: ${guess}`, color: COLORS.muted }
      : frame < beats[2]
        ? { text: errorFlash ? "✗ Ошибка" : "→ поправка весов", color: errorFlash ? COLORS.negative : COLORS.positive }
        : { text: "× 1 000 000 повторов", color: COLORS.highlight };

  const points: string[] = [];
  const steps = Math.max(1, Math.round(p * 200));
  for (let s = 0; s <= steps; s++) {
    const q = s / 200;
    const x = PAD + q * (CHART_W - PAD * 2);
    const y = CHART_H - PAD - (accuracy(q) / 100) * (CHART_H - PAD * 2);
    points.push(`${x},${y}`);
  }
  const y50 = CHART_H - PAD - 0.5 * (CHART_H - PAD * 2);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
      <div style={{ display: "flex", gap: 70, alignItems: "center" }}>
        <Appear at={beats[0]}>
          <Card style={{ width: 620 }}>
            <div style={{ fontSize: 38, fontWeight: 700, marginBottom: 10 }}>Веса сети</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: status.color, height: 50, marginBottom: 20 }}>{status.text}</div>
            {START.map((w0, k) => {
              const jitter = Math.sin(frame * 0.25 + k * 1.7) * 0.25 * (1 - converge);
              const w = w0 + (TARGET[k] - w0) * converge + jitter;
              const clamped = Math.max(-1, Math.min(1, w));
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", height: 54 }}>
                  <div style={{ width: 70, fontFamily: MONO, fontSize: 24, color: COLORS.muted }}>w{k + 1}</div>
                  <div style={{ position: "relative", width: 380, height: 22, background: COLORS.border, borderRadius: 11 }}>
                    <div style={{ position: "absolute", left: 189, top: -6, width: 2, height: 34, background: COLORS.muted }} />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        height: 22,
                        borderRadius: 11,
                        left: clamped >= 0 ? 190 : 190 + clamped * 190,
                        width: Math.abs(clamped) * 190,
                        background: clamped >= 0 ? COLORS.positive : COLORS.negative,
                      }}
                    />
                  </div>
                  <div style={{ width: 100, textAlign: "right", fontFamily: MONO, fontSize: 24, color: COLORS.text }}>
                    {clamped.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </Card>
        </Appear>

        <Appear at={beats[0] + 20}>
          <Card style={{ padding: 20 }}>
            <svg width={CHART_W} height={CHART_H}>
              <line x1={PAD} y1={CHART_H - PAD} x2={CHART_W - PAD} y2={CHART_H - PAD} stroke={COLORS.muted} strokeWidth={2} />
              <line x1={PAD} y1={PAD} x2={PAD} y2={CHART_H - PAD} stroke={COLORS.muted} strokeWidth={2} />
              <line x1={PAD} y1={y50} x2={CHART_W - PAD} y2={y50} stroke={COLORS.muted} strokeWidth={2} strokeDasharray="8 8" opacity={0.6} />
              <text x={PAD - 10} y={y50 + 8} textAnchor="end" fontFamily={MONO} fontSize={20} fill={COLORS.muted}>50%</text>
              <text x={PAD - 10} y={PAD + 8} textAnchor="end" fontFamily={MONO} fontSize={20} fill={COLORS.muted}>100%</text>
              <text x={CHART_W / 2} y={CHART_H - 15} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={COLORS.muted}>
                шаги обучения
              </text>
              <polyline points={points.join(" ")} fill="none" stroke={COLORS.result} strokeWidth={5} strokeLinejoin="round" />
            </svg>
            <div style={{ textAlign: "center", fontFamily: FONT, fontSize: 30, color: COLORS.muted }}>
              Точность:{" "}
              <span style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, color: acc > 90 ? COLORS.result : COLORS.text }}>
                {Math.round(acc)}%
              </span>
            </div>
          </Card>
        </Appear>
      </div>
    </AbsoluteFill>
  );
};
