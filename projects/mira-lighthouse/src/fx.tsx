import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { rng, wobble } from "./utils";

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */
export const CameraRig: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}> = ({ position, target, fov = 45 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...position);
  camera.lookAt(...target);
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.near = 0.05;
  camera.far = 900;
  return null;
};

/* ------------------------------------------------------------------ */
/* Soft glow sprite (fake bloom)                                       */
/* ------------------------------------------------------------------ */
let glowTex: THREE.Texture | null = null;
const getGlowTexture = () => {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, "rgba(255,255,255,0.55)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.16)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
};

export const Glow: React.FC<{
  position?: [number, number, number];
  color?: string;
  size?: number;
  opacity?: number;
}> = ({ position = [0, 0, 0], color = "#ffd27a", size = 1, opacity = 1 }) => {
  const tex = useMemo(getGlowTexture, []);
  if (opacity <= 0.001) return null;
  return (
    <sprite position={position} scale={[size, size, size]} renderOrder={10}>
      <spriteMaterial
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </sprite>
  );
};

/* ------------------------------------------------------------------ */
/* Volumetric-looking light beam / god ray (additive cone)             */
/* ------------------------------------------------------------------ */
const beamVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main(){
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const beamFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uFalloff;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main(){
    float along = pow(vUv.y, uFalloff);          // 1 at source (top), 0 at far end
    float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
    float a = along * edge * uIntensity;
    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
  }`;

/**
 * Cone that starts at `position` and extends `length` along local -Y.
 * Rotate the group to aim it.
 */
export const Beam: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  radiusStart?: number;
  radiusEnd?: number;
  color?: string;
  intensity?: number;
  falloff?: number;
}> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  length = 10,
  radiusStart = 0.1,
  radiusEnd = 2,
  color = "#ffcc66",
  intensity = 0.6,
  falloff = 1.4,
}) => {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
      uFalloff: { value: falloff },
    }),
    [],
  );
  uniforms.uColor.value.set(color);
  uniforms.uIntensity.value = intensity;
  uniforms.uFalloff.value = falloff;
  if (intensity <= 0.001) return null;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -length / 2, 0]} renderOrder={9}>
        <cylinderGeometry args={[radiusStart, radiusEnd, length, 48, 1, true]} />
        <shaderMaterial
          vertexShader={beamVert}
          fragmentShader={beamFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Gradient sky dome                                                   */
/* ------------------------------------------------------------------ */
const skyVert = /* glsl */ `
  varying vec3 vP;
  void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const skyFrag = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom; uniform vec3 uSun; uniform vec3 uSunDir; uniform float uSunAmt;
  varying vec3 vP;
  void main(){
    float h = vP.y;
    vec3 c = h > 0.0 ? mix(uMid, uTop, pow(clamp(h*1.6,0.0,1.0), 0.8)) : mix(uMid, uBottom, clamp(-h*4.0,0.0,1.0));
    float s = max(dot(normalize(vP), normalize(uSunDir)), 0.0);
    c += uSun * (pow(s, 6.0) * 0.6 + pow(s, 60.0) * 0.8) * uSunAmt;
    gl_FragColor = vec4(c, 1.0);
  }`;

export const Sky: React.FC<{
  top: string;
  mid: string;
  bottom: string;
  sun?: string;
  sunDir?: [number, number, number];
  sunAmt?: number;
}> = ({ top, mid, bottom, sun = "#ff9a4a", sunDir = [0, 0.05, -1], sunAmt = 0 }) => {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3() },
      uSunAmt: { value: 0 },
    }),
    [],
  );
  uniforms.uTop.value.set(top);
  uniforms.uMid.value.set(mid);
  uniforms.uBottom.value.set(bottom);
  uniforms.uSun.value.set(sun);
  uniforms.uSunDir.value.set(...sunDir);
  uniforms.uSunAmt.value = sunAmt;
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[600, 48, 24]} />
      <shaderMaterial
        vertexShader={skyVert}
        fragmentShader={skyFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */
export const Stars: React.FC<{ count?: number; opacity?: number; frame: number; seed?: number; minY?: number }> = ({
  count = 900,
  opacity = 1,
  frame,
  seed = 7,
  minY = 0.02,
}) => {
  const geom = useMemo(() => {
    const r = rng(seed);
    const pos: number[] = [];
    const col: number[] = [];
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      let y = Math.abs(u) * 0.95 + minY;
      const rad = Math.sqrt(1 - Math.min(1, y * y));
      const R = 500;
      pos.push(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
      const w = 0.7 + r() * 0.3;
      const tint = r();
      col.push(w, w * (0.9 + tint * 0.1), w * (0.85 + (1 - tint) * 0.15));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, [count, seed, minY]);
  return (
    <points geometry={geom} renderOrder={-9}>
      <pointsMaterial
        size={2.2 + Math.sin(frame * 0.15) * 0.15}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        fog={false}
      />
    </points>
  );
};

/* ------------------------------------------------------------------ */
/* Animated sea                                                        */
/* ------------------------------------------------------------------ */
export const Sea: React.FC<{
  frame: number;
  y?: number;
  size?: number;
  segments?: number;
  color?: string;
  amp?: number;
  speed?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  position?: [number, number, number];
}> = ({
  frame,
  y = 0,
  size = 400,
  segments = 140,
  color = "#0b1d33",
  amp = 0.6,
  speed = 1,
  roughness = 0.35,
  emissive = "#000000",
  emissiveIntensity = 0,
  position = [0, 0, 0],
}) => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, segments, segments);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [size, segments]);
  const t = (frame / 30) * speed;
  const pos = geom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h =
      Math.sin(x * 0.08 + t * 1.1) * 0.5 +
      Math.sin(z * 0.11 - t * 0.9 + x * 0.03) * 0.45 +
      Math.sin((x + z) * 0.23 + t * 1.9) * 0.18 +
      Math.sin((x - z) * 0.41 - t * 2.6) * 0.08;
    pos.setY(i, h * amp);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return (
    <mesh geometry={geom} position={[position[0], y + position[1], position[2]]}>
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={0.15}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* Organic rock                                                        */
/* ------------------------------------------------------------------ */
const rockCache = new Map<string, THREE.BufferGeometry>();
export const rockGeometry = (seed: number, detail = 3, rough = 0.28, flat = 0) => {
  const key = `${seed}-${detail}-${rough}-${flat}`;
  const hit = rockCache.get(key);
  if (hit) return hit;
  const base = new THREE.IcosahedronGeometry(1, Math.max(detail, 4));
  base.deleteAttribute("normal");
  base.deleteAttribute("uv");
  const g = mergeVertices(base);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      wobble(v.x * 1.3, v.y * 1.3, v.z * 1.3, seed) * rough +
      wobble(v.x * 3.1, v.y * 3.1, v.z * 3.1, seed + 3) * rough * 0.35;
    v.multiplyScalar(1 + n);
    if (flat > 0 && v.y < 0) v.y *= 1 - flat;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  rockCache.set(key, g);
  return g;
};

export const Rock: React.FC<{
  seed: number;
  position: [number, number, number];
  scale: [number, number, number] | number;
  rotation?: [number, number, number];
  color?: string;
  roughness?: number;
  detail?: number;
  rough?: number;
  flat?: number;
  metalness?: number;
}> = ({ seed, position, scale, rotation = [0, 0, 0], color = "#4a4f5c", roughness = 0.9, detail = 3, rough = 0.28, flat = 0, metalness = 0 }) => {
  const g = useMemo(() => rockGeometry(seed, detail, rough, flat), [seed, detail, rough, flat]);
  const s: [number, number, number] = typeof scale === "number" ? [scale, scale, scale] : scale;
  return (
    <mesh geometry={g} position={position} scale={s} rotation={rotation}>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* Puffy cloud                                                         */
/* ------------------------------------------------------------------ */
export const Cloud: React.FC<{
  seed: number;
  position: [number, number, number];
  scale?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  puffs?: number;
}> = ({ seed, position, scale = 1, color = "#2a3145", emissive = "#000000", emissiveIntensity = 0, opacity = 1, puffs = 9 }) => {
  const parts = useMemo(() => {
    const r = rng(seed);
    return new Array(puffs).fill(0).map((_, i) => {
      const t = i / (puffs - 1) - 0.5;
      return {
        p: [t * 6 + (r() - 0.5) * 1.2, (r() - 0.3) * 1.1 - Math.abs(t) * 1.4, (r() - 0.5) * 2] as [number, number, number],
        s: 1.2 + r() * 1.4 - Math.abs(t) * 0.9,
      };
    });
  }, [seed, puffs]);
  return (
    <group position={position} scale={scale}>
      {parts.map((q, i) => (
        <mesh key={i} position={q.p} scale={[q.s * 1.25, q.s * 0.85, q.s]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial
            color={color}
            roughness={1}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            transparent={opacity < 1}
            opacity={opacity}
            depthWrite={opacity >= 1}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Rain streaks                                                        */
/* ------------------------------------------------------------------ */
export const Rain: React.FC<{
  frame: number;
  count?: number;
  area?: [number, number, number];
  center?: [number, number, number];
  speed?: number;
  opacity?: number;
  color?: string;
  wind?: number;
}> = ({ frame, count = 1400, area = [30, 24, 30], center = [0, 8, 0], speed = 0.9, opacity = 0.35, color = "#9fb4d8", wind = 0.25 }) => {
  const seeds = useMemo(() => {
    const r = rng(99);
    return new Array(count).fill(0).map(() => [r(), r(), r(), 0.25 + r() * 0.35]);
  }, [count]);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 6), 3));
    return g;
  }, [count]);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < count; i++) {
    const [a, b, c, len] = seeds[i];
    const fall = (b - frame * speed / area[1]) % 1;
    const yy = ((fall + 1) % 1) * area[1] - area[1] / 2;
    const x = center[0] + (a - 0.5) * area[0] + yy * wind * -1;
    const y = center[1] + yy;
    const z = center[2] + (c - 0.5) * area[2];
    pos.setXYZ(i * 2, x, y, z);
    pos.setXYZ(i * 2 + 1, x + wind * len, y + len, z);
  }
  pos.needsUpdate = true;
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
};

/* ------------------------------------------------------------------ */
/* Soft contact shadow                                                 */
/* ------------------------------------------------------------------ */
let shadowTex: THREE.Texture | null = null;
const getShadowTex = () => {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(0,0,0,0.75)");
  grd.addColorStop(0.5, "rgba(0,0,0,0.35)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
};
export const BlobShadow: React.FC<{ position: [number, number, number]; size?: number; opacity?: number }> = ({
  position,
  size = 0.8,
  opacity = 0.6,
}) => {
  const tex = useMemo(getShadowTex, []);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* Sparkle particles (twinkling points around an object)               */
/* ------------------------------------------------------------------ */
export const Sparkles: React.FC<{
  frame: number;
  count?: number;
  radius?: number;
  center?: [number, number, number];
  color?: string;
  size?: number;
  rise?: number;
  opacity?: number;
  seed?: number;
}> = ({ frame, count = 40, radius = 0.6, center = [0, 0, 0], color = "#ffe29a", size = 0.06, rise = 0.01, opacity = 1, seed = 5 }) => {
  const s = useMemo(() => {
    const r = rng(seed);
    return new Array(count).fill(0).map(() => ({
      a: r() * Math.PI * 2,
      h: r() * 2 - 1,
      d: 0.35 + r() * 0.65,
      sp: 0.4 + r(),
      ph: r() * 10,
    }));
  }, [count, seed]);
  if (opacity <= 0.001) return null;
  return (
    <group position={center}>
      {s.map((p, i) => {
        const t = frame / 30;
        const a = p.a + t * 0.6 * p.sp;
        const yy = ((p.h + 1 + t * rise * 30 * p.sp) % 2) - 1;
        const tw = 0.5 + 0.5 * Math.sin(t * 5 * p.sp + p.ph);
        return (
          <Glow
            key={i}
            position={[Math.cos(a) * radius * p.d, yy * radius * 0.8, Math.sin(a) * radius * p.d]}
            color={color}
            size={size * (0.6 + tw)}
            opacity={opacity * (0.35 + 0.65 * tw)}
          />
        );
      })}
    </group>
  );
};
