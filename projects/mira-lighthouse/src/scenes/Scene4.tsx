import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { Beam, CameraRig, Glow, Rock, Sparkles } from "../fx";
import { Lantern, Mira, Pyh } from "../characters";
import { lerp, lerp3, mixColor, rng, seg } from "../utils";

/** Сцена 4 — Обретение искры. Хрустальная чаша, взрыв золотого света. */
export const Scene4: React.FC = () => {
  const f = useCurrentFrame();

  const reach = seg(f, 20, 120);
  const flash = seg(f, 128, 150);
  const afterglow = seg(f, 150, 260);
  const burst = Math.max(0, 1 - Math.abs(f - 142) / 30); // peak at touch
  const pyhGlow = seg(f, 135, 230);
  const lightAmt = 0.15 + flash * 0.85;
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.25);

  const bowl = useMemo(() => {
    const pts: [number, number][] = [
      [0.0, 0.0],
      [0.06, 0.0],
      [0.08, 0.04],
      [0.05, 0.08],
      [0.05, 0.13],
      [0.16, 0.17],
      [0.24, 0.27],
      [0.27, 0.36],
      [0.265, 0.37],
      [0.23, 0.28],
      [0.15, 0.2],
      [0.0, 0.18],
    ];
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 64);
  }, []);

  const rays = useMemo(() => {
    const r = rng(17);
    return new Array(9).fill(0).map((_, i) => ({ rz: (i - 4) * 0.28 + (r() - 0.5) * 0.1, rx: (r() - 0.5) * 0.6, len: 3 + r() * 2.5, w: 0.25 + r() * 0.35 }));
  }, []);

  const camPos = lerp3([0.0, 1.0, 2.25], [-0.02, 0.92, 1.9], seg(f, 0, 300));
  const shake = burst * 0.008;
  camPos[0] += Math.sin(f * 1.7) * shake;
  camPos[1] += Math.cos(f * 2.1) * shake;
  const camTarget: [number, number, number] = [-0.02, 0.7, -0.15];

  const sparkPos: [number, number, number] = [0, 0.5, 0];
  const caveCol = mixColor("#1b1a33", "#5a3a22", flash);

  return (
    <>
      <CameraRig position={camPos} target={camTarget} fov={42} />
      <color attach="background" args={[mixColor("#05060f", "#1e1208", flash)]} />
      <fog attach="fog" args={[mixColor("#0a0b1f", "#2a1808", flash), 2, 9]} />

      <hemisphereLight args={[mixColor("#4a52a8", "#7a5530", flash), "#0a0614", 0.7 + flash * 0.2]} />
      <pointLight position={[-1.5, 1.6, 0.5]} color="#5470ff" intensity={4 * (1 - flash)} distance={8} />
      {/* the spark light */}
      <pointLight position={[0, 0.7, 0.05]} color="#ffb84d" intensity={0.8 + 3.5 * lightAmt + burst * 4} distance={5} decay={1.6} />
      <pointLight position={[0, 0.3, 0.5]} color="#ff9a3c" intensity={1.2 * flash} distance={3} decay={1.6} />

      {/* cave surroundings */}
      <Rock seed={70} position={[0, 0.0, 0]} scale={[0.45, 0.32, 0.45]} color="#3a3550" roughness={0.4} flat={0.3} />
      <Rock seed={71} position={[0.5, 0.15, -0.2]} scale={[0.3, 0.32, 0.3]} color="#363149" roughness={0.4} />
      <Rock seed={72} position={[-1.6, 0.6, -2.2]} scale={[1.4, 1.8, 1]} color={caveCol} roughness={0.35} metalness={0.2} />
      <Rock seed={73} position={[1.7, 0.8, -2.0]} scale={[1.3, 2, 1]} color={caveCol} roughness={0.35} metalness={0.2} />
      <Rock seed={74} position={[0.0, 1.6, -3.2]} scale={[3, 2.5, 1]} color={caveCol} roughness={0.35} metalness={0.2} />
      {[[-0.9, -1.2], [0.8, -1.4], [-0.4, -1.8], [1.4, -0.8], [-1.3, -0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 2.4, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12 + i * 0.03, 1.4 + i * 0.2, 10]} />
          <meshStandardMaterial color={caveCol} roughness={0.25} metalness={0.25} />
        </mesh>
      ))}

      {/* crystal bowl on pedestal rock */}
      <group position={[0, 0.3, 0]}>
        <mesh geometry={bowl}>
          <meshPhysicalMaterial
            color="#dff3ff"
            roughness={0.04}
            metalness={0}
            clearcoat={1}
            transparent
            opacity={0.38}
            side={THREE.DoubleSide}
            emissive="#ffcf80"
            emissiveIntensity={0.05 + flash * 0.2}
            depthWrite={false}
          />
        </mesh>
        {/* facets sparkle on the rim */}
        {new Array(16).fill(0).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 + f * 0.01;
          const tw = Math.max(0, Math.sin(f * 0.2 + i * 1.7)) ** 8;
          return <Glow key={i} position={[Math.cos(a) * 0.268, 0.365, Math.sin(a) * 0.268]} color="#fff4d0" size={0.03 + tw * 0.08} opacity={0.3 + tw * 0.7} />;
        })}
        {/* water */}
        <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.245, 48]} />
          <meshPhysicalMaterial color="#6fb4d6" transparent opacity={0.45} roughness={0.05} emissive="#ffb64d" emissiveIntensity={0.15 + lightAmt * 0.4} depthWrite={false} />
        </mesh>
        {/* ripples from the touch */}
        {f > 128 &&
          [0, 1, 2].map((i) => {
            const t = ((f - 128 - i * 12) / 60) % 1;
            if (f - 128 - i * 12 < 0) return null;
            return (
              <mesh key={i} position={[0, 0.302, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.02 + t * 0.22, 0.003, 6, 40]} />
                <meshBasicMaterial color="#ffe3a0" transparent opacity={(1 - t) * 0.8} />
              </mesh>
            );
          })}
      </group>

      {/* the living spark */}
      <mesh position={sparkPos} scale={0.035 + flash * 0.02 + pulse * 0.006}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#fff3cf" />
      </mesh>
      <Glow position={sparkPos} color="#ffc65e" size={0.3 + pulse * 0.08 + flash * 0.5 + burst * 1.2} opacity={0.85} />
      <Glow position={sparkPos} color="#ff8a2a" size={0.7 + flash * 1.5 + burst * 2} opacity={0.25 + burst * 0.25} />

      {/* volumetric god rays */}
      {rays.map((r, i) => (
        <Beam
          key={i}
          position={sparkPos}
          rotation={[Math.PI + r.rx, 0, r.rz + Math.sin(f * 0.01 + i) * 0.03]}
          length={r.len}
          radiusStart={0.02}
          radiusEnd={r.w}
          color="#ffc56a"
          intensity={(0.08 + burst * 0.22) * flash + afterglow * 0.08 * flash}
          falloff={0.9}
        />
      ))}
      <Sparkles frame={f} count={36} radius={0.55} center={[0, 0.75, 0]} color="#ffd88a" size={0.05} rise={0.006} opacity={flash} seed={21} />

      {/* Mira kneeling, reaching in */}
      <group position={[-0.08, 0, 0]}>
        <Mira
          position={[-0.42, 0, -0.18]}
          rotation={[0, 0.95, 0]}
          pose={{
            crouch: 0.55,
            showLantern: false,
            headPitch: lerp(-0.4, -0.15, flash),
            headYaw: 0,
            look: [0.2 * (1 - flash), lerp(-0.7, -0.2, flash)],
            smile: lerp(0.2, 1, flash),
            mouthOpen: flash * 0.7 * (1 - afterglow * 0.6),
            blink: f > 60 && f < 66 ? 1 : 0,
            armL: [-1.55 * reach, -0.1, 0.05 + 0.15 * reach],
            elbowL: 0.4 - reach * 0.3,
            armR: [-0.3, 0, -0.05],
            elbowR: 0.5,
            scarfSway: Math.sin(f * 0.05) * 0.3,
            breathe: f * 0.1,
          }}
        />
      </group>
      <group position={[-0.35, 0, 0.45]}>
        <Lantern glow={0.5 * (1 - flash) + 0.1} />
      </group>

      {/* Pyh on a rock, reaching with a paw */}
      <Pyh
        position={[0.42, 0.53 + Math.sin(f * 0.1) * 0.01 + pyhGlow * 0.05, -0.12]}
        rotation={[0, -0.75, 0]}
        pose={{
          frame: f,
          glow: lerp(0.05, 1, pyhGlow),
          sad: 0.3 * (1 - flash),
          look: [-0.6, -0.6 + flash * 0.6],
          pointL: reach,
          pointDir: [0.0, 0, -1.2],
          smile: flash > 0.5 ? 1 : 0,
          squash: burst * -0.5,
          blink: f > 200 && f < 206 ? 1 : 0,
          light: false,
        }}
      />
      <pointLight position={[0.42, 0.6, 0.1]} color="#ffbd59" intensity={0.3 + pyhGlow * 1.2} distance={2.5} decay={1.6} />
    </>
  );
};
