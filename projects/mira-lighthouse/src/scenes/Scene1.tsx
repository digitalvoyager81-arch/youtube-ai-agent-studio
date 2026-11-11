import React from "react";
import { useCurrentFrame } from "remotion";
import { BlobShadow, CameraRig, Cloud, Rock, Sea, Sky, Stars } from "../fx";
import { Mira, Pyh } from "../characters";
import { Lighthouse } from "../world";
import { lerp, lerp3, seg } from "../utils";

/** Сцена 1 — Потеря. Подножие маяка в сумерках. */
export const Scene1: React.FC = () => {
  const f = useCurrentFrame();

  const crouch = seg(f, 15, 70);
  const lookUp = seg(f, 150, 200);
  const point = seg(f, 125, 160) * (1 - seg(f, 255, 290));
  const blinkA = f > 95 && f < 101 ? 1 : f > 228 && f < 234 ? 1 : 0;

  const camPos = lerp3([0.15, 0.45, 3.4], [0.1, 0.35, 3.3], seg(f, 0, 300));
  const camTarget = lerp3([0.1, 1.25, -1], [0.45, 4.4, -8], seg(f, 165, 290));

  return (
    <>
      <CameraRig position={camPos} target={camTarget} fov={52} />
      <Sky top="#0f1d48" mid="#4c5e98" bottom="#1b2440" sun="#ff8a5c" sunDir={[-0.6, 0.02, -1]} sunAmt={0.5} />
      <Stars frame={f} opacity={0.75} count={600} />
      <fog attach="fog" args={["#2a3560", 14, 90]} />

      <hemisphereLight args={["#6f84c4", "#262a3c", 1.6]} />
      <directionalLight position={[3, 3, 5]} color="#7d90d0" intensity={0.8} />
      <directionalLight position={[-6, 4, -8]} color="#8aa0ff" intensity={0.7} />
      {/* warm rim from behind to wrap the heroes in a golden contour */}
      <spotLight position={[0.2, 1.4, -1.6]} target-position={[0, 0.4, 0.4]} angle={0.9} penumbra={1} color="#ffbe6e" intensity={6} distance={6} />

      {/* clouds */}
      <Cloud seed={1} position={[-14, 16, -50]} scale={2.2} color="#2a3354" emissive="#ff8a5c" emissiveIntensity={0.08} />
      <Cloud seed={2} position={[16, 22, -60]} scale={2.8} color="#283152" emissive="#6d7fd0" emissiveIntensity={0.05} />

      {/* cliff top plateau */}
      <Rock seed={10} position={[0, -2.95, -6]} scale={[11, 3, 11]} color="#3d4352" rough={0.12} />
      <Rock seed={11} position={[-3.2, -0.2, -1.8]} scale={[0.9, 0.6, 0.8]} color="#4a4f5e" />
      <Rock seed={12} position={[2.6, -0.15, -2.6]} scale={[0.7, 0.5, 0.6]} color="#474c5a" />
      <Rock seed={13} position={[-1.6, -0.05, 0.9]} scale={[0.35, 0.22, 0.3]} color="#555a69" />
      {/* tufts of grass */}
      {[[-1.1, 0.4], [1.2, 0.2], [-0.4, -1.2], [1.8, -0.6], [-2.2, 0.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 1, 2, 3, 4].map((j) => (
            <mesh key={j} position={[Math.sin(j * 2.3) * 0.06, 0.07, Math.cos(j * 1.7) * 0.06]} rotation={[Math.sin(j + f * 0.05) * 0.25, 0, Math.cos(j * 3) * 0.4]}>
              <coneGeometry args={[0.012, 0.18, 4]} />
              <meshStandardMaterial color="#4b5d4a" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      <Lighthouse position={[1.4, -0.3, -12]} lampOn={0} windowsGlow={0.15} />

      {/* the cold dark sea far below */}
      <Sea frame={f} y={-22} color="#0d1a30" amp={0.9} size={500} segments={90} />

      {/* heroes */}
      <BlobShadow position={[-0.25, 0.005, 0]} size={0.9} />
      <Mira
        position={[-0.25, 0, 0]}
        rotation={[0, 0.45, 0]}
        pose={{
          crouch,
          headPitch: lerp(-0.25, 0.5, lookUp) * (crouch > 0.5 ? 1 : 0.6),
          headYaw: lerp(0.25, 0.05, lookUp),
          headRoll: 0.08 * (1 - lookUp),
          look: [0.3 * (1 - lookUp), lerp(-0.6, 0.9, lookUp)],
          blink: blinkA,
          smile: lerp(0.25, -0.15, lookUp),
          armR: [-0.55 * crouch, 0, 0.05],
          elbowR: 0.6,
          armL: [-0.9 * crouch, 0, -0.15],
          elbowL: 0.9 * crouch,
          lantern: 0.95 + Math.sin(f * 0.4) * 0.05,
          scarfSway: Math.sin(f * 0.06) * 0.5,
          breathe: f * 0.1,
        }}
      />
      <BlobShadow position={[0.32, 0.005, 0.25]} size={0.4} opacity={0.5} />
      <Pyh
        position={[0.32, 0.13 + Math.sin(f * 0.08) * 0.01, 0.25]}
        rotation={[0, -0.35, 0]}
        pose={{
          frame: f,
          glow: 0.05 + Math.max(0, Math.sin(f * 0.2)) * 0.03,
          sad: 1 - point * 0.3,
          look: [0, lerp(-0.6, 1, point)],
          pointL: point,
          pointDir: [0, 0, -2.6],
          blink: f > 60 && f < 66 ? 1 : 0,
          smile: -1,
        }}
      />
    </>
  );
};
