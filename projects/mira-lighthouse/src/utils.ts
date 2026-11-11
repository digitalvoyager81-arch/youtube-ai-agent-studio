import * as THREE from "three";

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const smoother = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
/** eased 0..1 progress of frame f between a and b */
export const seg = (f: number, a: number, b: number) => smoother((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const mixColor = (a: string, b: string, t: number) =>
  "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(t)).getHexString();

/** deterministic PRNG */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** cheap smooth 3D value-noise-ish function (sum of sines), deterministic */
export const wobble = (x: number, y: number, z: number, s: number) =>
  Math.sin(x * 1.7 + s) * Math.cos(y * 2.3 + s * 1.3) * 0.5 +
  Math.sin(z * 2.9 + x * 0.7 + s * 2.1) * 0.3 +
  Math.cos(y * 4.1 + z * 3.7 + s) * 0.2;
