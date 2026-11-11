import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { BlobShadow, CameraRig, Glow, Rock, Sea } from "../fx";
import { Mira, Pyh } from "../characters";
import { lerp, lerp3, rng, seg } from "../utils";

/** Сцена 3 — Спуск в бездну. Внутри пещеры, ракурс сверху вниз. */
export const Scene3: React.FC = () => {
  const f = useCurrentFrame();

  const ledges: [number, number, number][] = [
    [0, 1.2, -0.6],
    [0.4, 0.78, 0.0],
    [0.05, 0.36, 0.6],
  ];
  const s1 = seg(f, 50, 110);
  const s2 = seg(f, 175, 235);
  let pos = lerp3(ledges[0], ledges[1], s1);
  if (f >= 175) pos = lerp3(ledges[1], ledges[2], s2);
  const stepArc = Math.sin((f < 175 ? s1 : s2) * Math.PI) * 0.12;
  pos = [pos[0], pos[1] + stepArc, pos[2]];
  const stepping = (f > 50 && f < 110) || (f > 175 && f < 235);
  const yaw = f < 175 ? lerp(0.1, 0.5, s1) : lerp(0.5, -0.3, s2);

  const camPos = lerp3([0.8, 3.6, 2.9], [0.5, 2.6, 3.4], seg(f, 0, 300));
  const camTarget = lerp3([0.15, 0.9, -0.2], [0.1, 0.25, 0.5], seg(f, 0, 300));

  // stalagmites / stalactites
  const spikes = useMemo(() => {
    const r = rng(77);
    return new Array(26).fill(0).map(() => ({
      x: (r() - 0.5) * 9,
      z: (r() - 0.5) * 9 - 1,
      h: 0.8 + r() * 2.2,
      w: 0.12 + r() * 0.25,
      top: r() > 0.55,
    }));
  }, []);
  const drips = useMemo(() => {
    const r = rng(5);
    return new Array(9).fill(0).map(() => ({ x: (r() - 0.5) * 5, z: (r() - 0.5) * 4 + 0.5, ph: r() * 90, per: 60 + r() * 50 }));
  }, []);
  const glints = useMemo(() => {
    const r = rng(9);
    return new Array(40).fill(0).map(() => ({ p: [(r() - 0.5) * 7, r() * 2.5 - 0.8, (r() - 0.5) * 6 - 0.5] as [number, number, number], ph: r() * 6, c: r() > 0.5 ? "#8fb6ff" : "#c79bff" }));
  }, []);

  return (
    <>
      <CameraRig position={camPos} target={camTarget} fov={50} />
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#0a0b1f", 3, 14]} />

      <hemisphereLight args={["#4a52a8", "#120a24", 0.9]} />
      <directionalLight position={[1, 4, 4]} color="#8a9cff" intensity={0.7} />
      <pointLight position={[-2.5, 2.5, -2]} color="#4a6cff" intensity={8} distance={12} decay={1.5} />
      <pointLight position={[2.5, 1.0, 1.5]} color="#9a52ff" intensity={6} distance={10} decay={1.5} />
      <pointLight position={[0, -1.0, 2.5]} color="#2fb8ff" intensity={3} distance={8} decay={1.5} />

      {/* ledges */}
      {ledges.map((l, i) => (
        <Rock key={i} seed={50 + i} position={[l[0], l[1] - 0.32, l[2]]} scale={[0.55, 0.32, 0.5]} color="#3b3a55" roughness={0.55} metalness={0.05} flat={0.2} />
      ))}
      <Rock seed={60} position={[-0.7, 0.5, -1.4]} scale={[1.3, 1.2, 1]} color="#2e2d45" roughness={0.6} />
      <Rock seed={61} position={[1.4, 0.0, -0.6]} scale={[0.8, 1.0, 0.9]} color="#33304d" roughness={0.6} />
      <Rock seed={62} position={[-0.9, -0.4, 0.9]} scale={[0.7, 0.6, 0.6]} color="#2f2c47" roughness={0.6} />
      <Rock seed={63} position={[1.3, -0.5, 1.6]} scale={[0.6, 0.4, 0.5]} color="#33304d" roughness={0.6} />
      <Rock seed={64} position={[-2.8, 0.5, -3]} scale={[2.2, 3, 2]} color="#26243a" />
      <Rock seed={65} position={[3, 0.5, -3.2]} scale={[2, 3.5, 2]} color="#26243a" />
      <Rock seed={66} position={[0.3, 1.0, -4.5]} scale={[3.5, 3, 1.5]} color="#211f33" />

      {spikes.map((s, i) =>
        s.top ? (
          <mesh key={i} position={[s.x, 4.2 - s.h / 2, s.z]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[s.w, s.h, 10]} />
            <meshStandardMaterial color="#3d3a5c" roughness={0.3} metalness={0.2} />
          </mesh>
        ) : (
          <mesh key={i} position={[s.x * 1.1, -1.2 + s.h / 2, s.z]}>
            <coneGeometry args={[s.w, s.h, 10]} />
            <meshStandardMaterial color="#3a3858" roughness={0.3} metalness={0.2} />
          </mesh>
        ),
      )}

      {/* dark water */}
      <Sea frame={f} y={-1.0} size={30} segments={60} amp={0.03} speed={0.6} color="#06081a" roughness={0.08} />

      {/* drips + ripples */}
      {drips.map((d, i) => {
        const t = ((f + d.ph) % d.per) / d.per;
        const fallT = Math.min(1, t / 0.55);
        const y = lerp(3.6, -0.98, fallT * fallT);
        const ripple = t > 0.55 ? (t - 0.55) / 0.45 : -1;
        return (
          <group key={i}>
            {fallT < 1 && <Glow position={[d.x, y, d.z]} color="#bcd6ff" size={0.12} opacity={0.9} />}
            {ripple >= 0 && (
              <mesh position={[d.x, -0.97, d.z]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.05 + ripple * 0.5, 0.006, 6, 32]} />
                <meshBasicMaterial color="#8fb0ff" transparent opacity={(1 - ripple) * 0.6} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* twinkling wet glints on rock */}
      {glints.map((g, i) => {
        const tw = Math.max(0, Math.sin(f * 0.18 + g.ph * 3)) ** 6;
        return <Glow key={i} position={g.p} color={g.c} size={0.06 + tw * 0.18} opacity={0.2 + tw * 0.8} />;
      })}

      {/* Mira carrying trembling Pyh */}
      <BlobShadow position={[pos[0], pos[1] - stepArc + 0.005, pos[2]]} size={0.7} opacity={0.5} />
      <Mira
        position={pos}
        rotation={[0, yaw, 0]}
        pose={{
          walk: (f - 50) * 0.2,
          walkAmt: stepping ? 0.5 : 0,
          bodyLean: 0.15,
          headPitch: -0.45,
          headYaw: -0.1,
          look: [0, -0.8],
          smile: -0.2,
          blink: f > 140 && f < 146 ? 1 : 0,
          armL: [-0.75, 0.0, 0.25],
          elbowL: 1.35,
          armR: [-0.45, 0, 0.2],
          elbowR: 0.6,
          lantern: 0.75 + Math.sin(f * 0.5) * 0.06,
          scarfSway: Math.sin(f * 0.07) * 0.3,
          breathe: f * 0.16,
        }}
      >
        <Pyh
          position={[0.0, 0.55, 0.2]}
          rotation={[0, Math.PI - 0.5, 0]}
          scale={0.85}
          pose={{ frame: f, glow: 0.08, hide: 1, tremble: 1, sad: 0.6 }}
        />
      </Mira>
    </>
  );
};
