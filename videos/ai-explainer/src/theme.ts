// Шрифты встроены в бандл (fontsource), чтобы рендер не зависел от сети
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";

export const FONT = "Inter, sans-serif";
export const MONO = "'JetBrains Mono', monospace";

// Цвета несут смысл (3Blue1Brown): синий — положительное, красный — отрицательное,
// жёлтый — фокус, зелёный — результат
export const COLORS = {
  background: "#0B0F1A",
  surface: "#141A2A",
  border: "#26304A",
  text: "#FFFFFF",
  muted: "#8A93A8",
  positive: "#58C4DD",
  negative: "#FF6B6B",
  highlight: "#FFD84D",
  result: "#83C167",
  accent: "#FF8C00",
};
