import React from "react";
import { useCurrentFrame } from "remotion";
import { BlobShadow, CameraRig, Cloud, Glow, Rock, Sea, Sky, Sparkles } from "../fx";
import { Mira, Pyh } from "../characters";
import { Lighthouse } from "../world";
import { lerp, lerp3, rng, seg } from "../utils";

const groundY = (z: number) => -z * 0.18;

/** Сцена 2 — Путь к пещере. Тропа вниз к прибою на закате. */
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();

  // walking: starts at 105
  const walkT = Math.max(0, f - 105);
  const walkAmt = seg(f, 100, 125);
  const z = walkT * 0.011;
  const x = Math.sin(walkT * 0.01) * 0.15;
  const miraPos: [number, number, number] = [x, groundY(z), z];

  // palm out & hop
  const palm = seg(f, 20, 50) * (1 - seg(f, 95, 120));
  const hop = seg(f, 55, 92);
  const smile = lerp(0.6, 1, seg(f, 10, 40));

  // Pyh positions (world)
  const pyhGround: [number, number, number] = [-0.3, 0.13, 0.35];
  const shoulder: [number, number, number] = [miraPos[0] + 0.21, miraPos[1] + 0.83, miraPos[2] + 0.0];
  let pyhPos: [number, number, number];
  if (hop <= 0) pyhPos = pyhGround;
  else {
    pyhPos = lerp3(pyhGround, shoulder, hop);
    pyhPos[1] += Math.sin(hop * Math.PI) * 0.45;
  }
  if (f > 92) pyhPos = shoulder;
  const point = seg(f, 140, 165) * (1 - seg(f, 250, 275));

  const camBase: [number, number, number] = [miraPos[0] + 0.7, miraPos[1] + 1.0, miraPos[2] + 3.4];
  const camPos = lerp3([0.75, 0.9, 3.0], camBase, seg(f, 95, 130));
  camPos[0] += Math.sin(f * 0.02) * 0.04;
  const camTarget: [number, number, number] = [miraPos[0] - 0.6, miraPos[1] + 0.7, miraPos[2] - 1.5];

  const spray = (seed: number, period: number, origin: [number, number, number]) => {
    const r = rng(seed);
    const drops = new Array(22).fill(0).map(() => [r() - 0.5, r(), r() - 0.5, 0.6 + r() * 0.6]);
    const t = ((f + seed * 13) % period) / period;
    return (
      <group position={origin}>
        {drops.map(([dx, up, dz, sp], i) => {
          const tt = t * sp;
          if (tt > 1) return null;
          return (
            <Glow
              key={i}
              position={[dx * 2.5 * tt, up * 3.2 * Math.sin(tt * Math.PI) + tt * 0.5, dz * 2 * tt]}
              color="#9ff3ee"
              size={0.45 + up * 0.5}
              opacity={(1 - tt) * 0.55}
            />
          );
        })}
      </group>
    );
  };

  return (
    <>
      <CameraRig position={camPos} target={camTarget} fov={50} />
      <Sky top="#232a4a" mid="#b8604a" bottom="#2a2a3c" sun="#ffc070" sunDir={[-0.35, 0.06, -1]} sunAmt={1.4} />
      <fog attach="fog" args={["#3a3346", 25, 140]} />

      <hemisphereLight args={["#7d7fb5", "#2b2530", 1.1]} />
      {/* sunset key light from behind -> strong warm rim */}
      <directionalLight position={[-4, 3, -10]} color="#ffae6b" intensity={3.2} />
      {/* cool front fill */}
      <directionalLight position={[4, 2, 8]} color="#6b85c9" intensity={0.9} />

      {/* storm clouds with sun breaking through */}
      <Cloud seed={21} position={[-10, 12, -55]} scale={3.2} color="#2b2c40" emissive="#ff8c4a" emissiveIntensity={0.18} />
      <Cloud seed={22} position={[14, 15, -60]} scale={3.6} color="#262839" emissive="#ff7a40" emissiveIntensity={0.12} />
      <Cloud seed={23} position={[-2, 22, -70]} scale={4.2} color="#22243a" emissive="#c86a50" emissiveIntensity={0.1} />
      <Cloud seed={24} position={[-30, 9, -40]} scale={2.4} color="#323248" emissive="#ff9a55" emissiveIntensity={0.15} />

      {/* sea and surf, down on the left */}
      <Sea frame={f} y={-5} position={[-30, 0, 0]} color="#0a2a36" amp={0.7} speed={1.4} size={260} segments={110} emissive="#0b4450" emissiveIntensity={0.25} roughness={0.85} />

      {/* slope / path */}
      <group rotation={[-Math.atan(0.18), 0, 0]}>
        <Rock seed={30} position={[0.6, -1.6, -2]} scale={[4.5, 1.6, 12]} color="#5a5056" rough={0.1} />
        <Rock seed={31} position={[-1.7, 0.0, -1]} scale={[0.6, 0.45, 0.6]} color="#6a5c5f" />
        <Rock seed={32} position={[1.8, 0.05, 1.5]} scale={[0.55, 0.5, 0.5]} color="#625558" />
        <Rock seed={33} position={[-1.3, -0.05, 3.2]} scale={[0.45, 0.3, 0.4]} color="#6a5c5f" />
        <Rock seed={34} position={[2.2, 0.0, -3.5]} scale={[0.8, 0.7, 0.7]} color="#5e5256" />
        <Rock seed={35} position={[1.6, -0.1, 4.5]} scale={[0.5, 0.35, 0.5]} color="#6a5c5f" />
      </group>
      {/* sea cliffs + cave mouth */}
      <Rock seed={40} position={[-6.5, -4, -2]} scale={[2.2, 4, 3.5]} color="#3e3843" />
      <Rock seed={41} position={[-9, -4.5, 6]} scale={[3, 3.4, 3.5]} color="#3a3540" />
      <group position={[-6.3, -4.2, 3.2]} rotation={[0, 1.2, 0]}>
        <mesh scale={[1.2, 1.5, 0.4]}>
          <sphereGeometry args={[1, 24, 16, 0, Math.PI]} />
          <meshBasicMaterial color="#040507" />
        </mesh>
        <Sparkles frame={f} count={14} radius={1.1} center={[0, 0.2, 0.5]} color="#7ff9ff" size={0.22} opacity={0.9} seed={8} />
      </group>
      <Rock seed={42} position={[-12, -5, -14]} scale={[4, 5, 4]} color="#3a3440" />
      {spray(1, 70, [-5.2, -5, -0.5])}
      {spray(2, 90, [-7.5, -5, 4.5])}
      {spray(3, 80, [-10, -5, -9])}

      {/* lighthouse up the hill behind */}
      <Lighthouse position={[3.5, 3.0, -20]} lampOn={0} windowsGlow={0.25} />

      {/* heroes */}
      <BlobShadow position={[miraPos[0], miraPos[1] + 0.01, miraPos[2]]} size={0.9} />
      <Mira
        position={miraPos}
        rotation={[0, -0.05, 0]}
        pose={{
          walk: walkT * 0.21,
          walkAmt,
          smile,
          mouthOpen: 0.4 * seg(f, 10, 40) * (1 - seg(f, 110, 140)),
          headYaw: lerp(0.15, 0, walkAmt) - point * 0.45,
          headPitch: -0.12 - 0.15 * hop * (1 - walkAmt) + point * -0.1,
          look: [-0.6 * point + (hop > 0 && hop < 1 ? -0.4 : 0), -0.3],
          blink: f > 140 && f < 146 ? 1 : 0,
          armL: [-1.25 * palm, 0.2 * palm, 0.35 * palm + Math.sin(walkT * 0.21) * 0.3 * walkAmt],
          elbowL: 0.2 + 0.2 * palm,
          armR: [Math.sin(walkT * 0.21 + Math.PI) * 0.35 * walkAmt - 0.2, 0, 0.05],
          elbowR: 0.5,
          lantern: 0.6,
          scarfSway: Math.sin(f * 0.09) * 0.9 + 0.5,
          breathe: f * 0.1,
        }}
      />
      {hop <= 0 && <BlobShadow position={[pyhGround[0], 0.01, pyhGround[2]]} size={0.4} />}
      <Pyh
        position={pyhPos}
        scale={f > 92 ? 0.8 : 1}
        rotation={[0, -0.2 + point * 0.4, 0]}
        pose={{
          frame: f,
          glow: 0.1,
          sad: 0.4 - hop * 0.4,
          squash: hop > 0 && hop < 1 ? -0.6 : 0,
          look: [-point, -0.3 * point],
          pointL: point,
          pointDir: [0.6, 0, -1.4],
          smile: hop > 0.5 ? 1 : -0.5,
        }}
      />
    </>
  );
};
