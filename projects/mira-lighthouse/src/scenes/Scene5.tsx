import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { Beam, CameraRig, Cloud, Glow, Rain, Sea, Sky, Sparkles } from "../fx";
import { Keeper, Mira, Pyh } from "../characters";
import { FresnelLens, Ship } from "../world";
import { lerp, lerp3, seg } from "../utils";

/** Сцена 5 — Возвращение на маяк. Смотровая площадка, луч прорезает бурю. */
export const Scene5: React.FC = () => {
  const f = useCurrentFrame();

  const arrive = seg(f, 0, 70);
  const miraPos = lerp3([-1.75, 0, 0.9], [-0.75, 0, 1.55], arrive);
  const relief = seg(f, 30, 75) * (1 - seg(f, 120, 160) * 0.7);
  const fly = seg(f, 95, 160);
  const ignite = seg(f, 160, 185);
  const beamOn = seg(f, 165, 200);
  const beamAngle = (f - 165) * 0.012 + 0.55;

  const lensCenter: [number, number, number] = [0, 1.55, 0];
  const shoulder: [number, number, number] = [miraPos[0] - 0.12, 0.85, miraPos[2] + 0.05];
  let pyhPos = lerp3(shoulder, lensCenter, fly);
  pyhPos = [pyhPos[0], pyhPos[1] + Math.sin(fly * Math.PI) * 0.6, pyhPos[2]];
  const flutter = fly > 0 && fly < 1 ? Math.sin(f * 0.9) * 0.4 : 0;

  // lightning flashes
  const lightning = Math.max(0, 1 - Math.abs(f - 28) / 4) + Math.max(0, 1 - Math.abs(f - 33) / 3) * 0.6 + Math.max(0, 1 - Math.abs(f - 252) / 4) * 0.7;

  const camPos = lerp3([0.9, 1.0, 6.4], [0.5, 1.6, 7.6], seg(f, 150, 300));
  const camTarget = lerp3([0, 1.15, 0], [0, 1.6, -1], seg(f, 150, 300));

  const beamDir = (a: number) => [-Math.sin(a), -Math.cos(a)];
  const shipLit = (sx: number, sz: number) => {
    const d = Math.atan2(-sx, -sz);
    let diff = Math.abs(((d - beamAngle) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
    const diff2 = Math.abs(((d - beamAngle - Math.PI) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
    diff = Math.min(diff, diff2);
    return beamOn * Math.max(0, 1 - diff / 0.25);
  };
  void beamDir;

  return (
    <>
      <CameraRig position={camPos} target={camTarget} fov={52} />
      <Sky top="#05070f" mid={lightning > 0.1 ? "#5a6a9a" : "#1a2236"} bottom="#060910" />
      <fog attach="fog" args={["#111827", 25, 220]} />

      <hemisphereLight args={["#40507a", "#0b0d14", 0.7 + lightning * 3]} />
      <directionalLight position={[3, 6, 8]} color="#6d82b8" intensity={0.6 + lightning * 2} />
      <pointLight position={[1.5, 2.6, 2.4]} color="#ffb766" intensity={3} distance={6} />

      {/* storm clouds */}
      {[
        [-30, 18, -80, 5],
        [20, 22, -90, 6],
        [-5, 30, -120, 7],
        [40, 14, -60, 4],
        [-45, 12, -50, 4],
      ].map(([x, y, z, s], i) => (
        <Cloud key={i} seed={80 + i} position={[x, y, z]} scale={s} color="#1b2132" emissive="#ffb04a" emissiveIntensity={beamOn * 0.06 + lightning * 0.25} />
      ))}
      <Rain frame={f} count={1600} area={[16, 12, 12]} center={[0, 2, 2]} speed={0.7} opacity={0.3} />

      {/* stormy sea far below with distant ships */}
      <Sea frame={f} y={-26} size={600} segments={120} amp={1.3} speed={1.4} color="#0a1424" emissive="#ffae4a" emissiveIntensity={beamOn * 0.03} />
      <Ship position={[-26, -25.3, -110]} scale={2.2} rotation={0.4} frame={f} lit={shipLit(-26, -110)} />
      <Ship position={[30, -25.3, -150]} scale={2.6} rotation={-0.3} frame={f} lit={shipLit(30, -150)} />
      <Ship position={[-60, -25.3, -170]} scale={2.4} rotation={0.2} frame={f} lit={shipLit(-60, -170)} />

      {/* tower top below gallery */}
      <mesh position={[0, -3, 0]}>
        <cylinderGeometry args={[1.6, 2.0, 6, 48]} />
        <meshStandardMaterial color="#efe7da" roughness={0.7} />
      </mesh>
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[1.62, 1.75, 1.2, 48]} />
        <meshStandardMaterial color="#b8332e" roughness={0.7} />
      </mesh>
      {/* gallery deck */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[2.5, 2.2, 0.2, 64]} />
        <meshStandardMaterial color="#2b2d33" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.45, 0.035, 8, 96]} />
        <meshStandardMaterial color="#17191d" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.45, 0.02, 8, 96]} />
        <meshStandardMaterial color="#17191d" metalness={0.7} roughness={0.35} />
      </mesh>
      {new Array(36).fill(0).map((_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.45, 0.42, Math.sin(a) * 2.45]}>
            <cylinderGeometry args={[0.022, 0.022, 0.86, 6]} />
            <meshStandardMaterial color="#17191d" metalness={0.7} roughness={0.35} />
          </mesh>
        );
      })}
      {/* hatch the heroes climbed through */}
      <mesh position={[-1.8, 0.01, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color="#ffcf7a" emissive="#ffa040" emissiveIntensity={1.2} />
      </mesh>

      {/* lantern room */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1.25, 1.3, 0.5, 48]} />
        <meshStandardMaterial color="#9d2b27" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 2.2, 48, 1, true]} />
        <meshPhysicalMaterial color="#cfe4ff" transparent opacity={0.16 + ignite * 0.06} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} emissive="#ffc46a" emissiveIntensity={ignite * 0.25} />
      </mesh>
      {new Array(10).fill(0).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.16, 1.6, Math.sin(a) * 1.16]}>
            <boxGeometry args={[0.05, 2.2, 0.05]} />
            <meshStandardMaterial color="#17191d" metalness={0.5} roughness={0.5} />
          </mesh>
        );
      })}
      <mesh position={[0, 3.05, 0]}>
        <coneGeometry args={[1.4, 0.8, 48]} />
        <meshStandardMaterial color="#9d2b27" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 3.55, 0]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#9d2b27" roughness={0.4} metalness={0.4} />
      </mesh>

      <FresnelLens position={[0, 1.55, 0]} glow={ignite} scale={0.95} />
      <Glow position={lensCenter} color="#ffcf73" size={0.8 + ignite * 4.5} opacity={0.2 + ignite * 0.9} />
      <pointLight position={lensCenter} color="#ffc060" intensity={ignite * 30} distance={14} decay={1.6} />

      {/* the great rotating beam (two opposite beams) */}
      {[0, Math.PI].map((off, i) => (
        <group key={i} position={lensCenter} rotation={[0, beamAngle + off, 0]}>
          <Beam rotation={[Math.PI / 2 - 0.03, 0, 0]} length={140} radiusStart={0.55} radiusEnd={14} color="#ffd27e" intensity={beamOn * 0.55} falloff={0.7} />
          <Beam rotation={[Math.PI / 2 - 0.03, 0, 0]} length={60} radiusStart={0.4} radiusEnd={3.5} color="#fff0c8" intensity={beamOn * 0.4} falloff={1.2} />
        </group>
      ))}

      {/* keeper meets them */}
      <Keeper
        position={[0.95, 0, 1.45]}
        rotation={[0, lerp(-0.7, -0.15, seg(f, 160, 200)), 0]}
        scale={0.95}
        pose={{
          armsOpen: relief,
          smile: lerp(0.6, 1, relief),
          headYaw: lerp(-0.2, -0.75, seg(f, 100, 160)) * (1 - seg(f, 200, 240) * 0.6),
          headPitch: lerp(0, 0.25, seg(f, 100, 160)),
          blink: f > 85 && f < 91 ? 1 : 0,
          breathe: f * 0.08,
        }}
      />
      {/* Mira, out of breath */}
      <Mira
        position={miraPos}
        rotation={[0, lerp(1.0, 0.35, arrive) - seg(f, 100, 150) * 0.75, 0]}
        pose={{
          walk: f * 0.22,
          walkAmt: 1 - arrive,
          breathe: f * 0.38,
          bodyLean: 0.12 * (1 - seg(f, 90, 130)),
          smile: lerp(0.5, 1, ignite),
          mouthOpen: 0.5 * (1 - seg(f, 90, 130)) + ignite * 0.4,
          headPitch: lerp(-0.05, 0.35, seg(f, 100, 160)),
          headYaw: 0.25 * relief,
          look: [0.3 * relief, 0.6 * seg(f, 100, 160)],
          armL: [-0.2, 0, 0.1 + relief * 0.3],
          elbowL: 0.5,
          armR: [-0.3, 0, 0.1],
          elbowR: 0.5,
          lantern: 0.7,
          scarfSway: Math.sin(f * 0.15) * 1.2 + 0.8,
          blink: f > 210 && f < 216 ? 1 : 0,
        }}
      />
      {/* Pyh flutters up into the lens */}
      <Pyh
        position={pyhPos}
        scale={fly < 1 ? lerp(0.8, 1.2, fly) : 1.2}
        rotation={[0, lerp(0.3, Math.PI * 2, fly), flutter * 0.2]}
        pose={{
          frame: f,
          glow: 1,
          squash: flutter,
          smile: 1,
          look: [0, 0.4],
          blink: f > 60 && f < 66 ? 1 : 0,
        }}
      />
      <Sparkles frame={f} count={30} radius={0.6} center={pyhPos} color="#ffd88a" size={0.08} opacity={0.6 + ignite * 0.4} seed={33} />
    </>
  );
};
