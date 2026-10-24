import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "./theme";

// Появление элемента: плавно проявляется и поднимается снизу начиная с кадра `at`.
// До появления место уже занято, чтобы соседние элементы не прыгали.
export const Appear: React.FC<{
  at: number;
  y?: number;
  scale?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, y = 30, scale = false, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = frame < at ? 0 : spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 110 } });
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * y}px) scale(${scale ? 0.6 + 0.4 * p : 1})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Линейный прогресс 0→1 на отрезке кадров [from, to]
export const useProgress = (from: number, to: number): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const Card: React.FC<{
  color?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ color = COLORS.border, style, children }) => (
  <div
    style={{
      background: COLORS.surface,
      border: `3px solid ${color}`,
      borderRadius: 24,
      padding: "28px 40px",
      color: COLORS.text,
      fontFamily: FONT,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Arrow: React.FC<{ progress: number; color?: string; width?: number }> = ({
  progress,
  color = COLORS.muted,
  width = 110,
}) => (
  <svg width={width} height={40} viewBox={`0 0 ${width} 40`}>
    <line
      x1={4}
      y1={20}
      x2={4 + (width - 24) * progress}
      y2={20}
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
    />
    {progress > 0.95 && (
      <polyline
        points={`${width - 26},6 ${width - 8},20 ${width - 26},34`}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

// Зачёркивание поверх элемента
export const StrikeThrough: React.FC<{ progress: number; children: React.ReactNode }> = ({
  progress,
  children,
}) => (
  <div style={{ position: "relative", display: "inline-block" }}>
    {children}
    <div
      style={{
        position: "absolute",
        left: -10,
        top: "50%",
        height: 8,
        width: `calc(${progress * 100}% + ${progress * 20}px)`,
        background: COLORS.negative,
        borderRadius: 4,
        transform: "rotate(-6deg)",
      }}
    />
  </div>
);
