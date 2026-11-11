import React, { useMemo } from "react";
import * as THREE from "three";
import { Glow } from "./fx";

/* ------------------------------------------------------------------ */
/* Lighthouse exterior                                                 */
/* ------------------------------------------------------------------ */
export const Lighthouse: React.FC<{
  position?: [number, number, number];
  scale?: number;
  lampOn?: number; // 0..1
  lampColor?: string;
  windowsGlow?: number;
}> = ({ position = [0, 0, 0], scale = 1, lampOn = 0, lampColor = "#ffcf73", windowsGlow = 0.6 }) => {
  const H = 10;
  const r0 = 1.5;
  const r1 = 1.0;
  const radiusAt = (y: number) => r0 + (r1 - r0) * (y / H);
  const bands = 5;
  return (
    <group position={position} scale={scale}>
      {/* stone base */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[r0 + 0.35, r0 + 0.5, 0.6, 40]} />
        <meshStandardMaterial color="#5d5a57" roughness={0.95} />
      </mesh>
      {/* striped tower */}
      {new Array(bands).fill(0).map((_, i) => {
        const y0 = 0.6 + (i * (H - 0.6)) / bands;
        const y1 = 0.6 + ((i + 1) * (H - 0.6)) / bands;
        return (
          <mesh key={i} position={[0, (y0 + y1) / 2, 0]}>
            <cylinderGeometry args={[radiusAt(y1), radiusAt(y0), y1 - y0, 48]} />
            <meshStandardMaterial color={i % 2 ? "#b8332e" : "#efe7da"} roughness={0.7} />
          </mesh>
        );
      })}
      {/* door */}
      <group position={[0, 0.6, 0]}>
        <mesh position={[0, 0.65, r0 - 0.06]}>
          <boxGeometry args={[0.7, 1.3, 0.2]} />
          <meshStandardMaterial color="#3b2a20" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.3, r0 - 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 24, 1, false, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#3b2a20" roughness={0.8} />
        </mesh>
      </group>
      {/* small windows spiralling up */}
      {[2.6, 4.6, 6.6, 8.4].map((y, i) => {
        const a = i * 1.3 - 0.6;
        const r = radiusAt(y) - 0.02;
        return (
          <group key={i} position={[Math.sin(a) * r, y, Math.cos(a) * r]} rotation={[0, a, 0]}>
            <mesh>
              <boxGeometry args={[0.32, 0.5, 0.1]} />
              <meshStandardMaterial color="#ffcf7a" emissive="#ffb04d" emissiveIntensity={windowsGlow * 1.4} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.04, 0.5, 0.04]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
          </group>
        );
      })}
      {/* gallery deck */}
      <mesh position={[0, H + 0.08, 0]}>
        <cylinderGeometry args={[1.55, 1.35, 0.25, 48]} />
        <meshStandardMaterial color="#2b2d33" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* railing */}
      <mesh position={[0, H + 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.03, 8, 64]} />
        <meshStandardMaterial color="#1f2126" metalness={0.6} roughness={0.4} />
      </mesh>
      {new Array(24).fill(0).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.5, H + 0.45, Math.sin(a) * 1.5]}>
            <cylinderGeometry args={[0.02, 0.02, 0.62, 6]} />
            <meshStandardMaterial color="#1f2126" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
      {/* lantern room */}
      <mesh position={[0, H + 0.95, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 1.4, 32, 1, true]} />
        <meshPhysicalMaterial
          color={lampOn > 0.05 ? "#fff1c8" : "#4a5a70"}
          emissive={lampColor}
          emissiveIntensity={lampOn * 2.2}
          transparent
          opacity={0.55 + lampOn * 0.3}
          roughness={0.08}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* mullions */}
      {new Array(8).fill(0).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.86, H + 0.95, Math.sin(a) * 0.86]}>
            <boxGeometry args={[0.05, 1.4, 0.05]} />
            <meshStandardMaterial color="#1c1e22" metalness={0.5} roughness={0.5} />
          </mesh>
        );
      })}
      {/* inner lamp */}
      <mesh position={[0, H + 0.95, 0]}>
        <sphereGeometry args={[0.35, 24, 16]} />
        <meshStandardMaterial color={lampOn > 0.05 ? "#ffe6a6" : "#39424f"} emissive={lampColor} emissiveIntensity={lampOn * 4} roughness={0.3} />
      </mesh>
      {/* roof */}
      <mesh position={[0, H + 1.85, 0]}>
        <coneGeometry args={[1.05, 0.8, 32]} />
        <meshStandardMaterial color="#9d2b27" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, H + 2.35, 0]}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color="#9d2b27" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, H + 2.65, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {lampOn > 0 && (
        <>
          <Glow position={[0, H + 0.95, 0]} color={lampColor} size={6 * lampOn} opacity={lampOn} />
          <pointLight position={[0, H + 0.95, 0]} color={lampColor} intensity={lampOn * 30} distance={30} decay={1.6} />
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Distant ship silhouette                                             */
/* ------------------------------------------------------------------ */
export const Ship: React.FC<{ position: [number, number, number]; scale?: number; rotation?: number; lit?: number; frame: number }> = ({
  position,
  scale = 1,
  rotation = 0,
  lit = 0,
  frame,
}) => {
  const rock = Math.sin(frame * 0.05 + position[0]) * 0.06;
  const hullCol = lit > 0 ? `#${new THREE.Color("#141a24").lerp(new THREE.Color("#6a4a2a"), lit).getHexString()}` : "#141a24";
  const sailCol = `#${new THREE.Color("#1d2633").lerp(new THREE.Color("#f2d49b"), lit).getHexString()}`;
  return (
    <group position={position} rotation={[0, rotation, rock]} scale={scale}>
      <mesh position={[0, 0.3, 0]} scale={[2.2, 0.5, 0.6]}>
        <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={hullCol} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[4.2, 0.08, 1.1]} />
        <meshStandardMaterial color={hullCol} roughness={0.8} />
      </mesh>
      {[-0.8, 0.6].map((x, i) => (
        <group key={i} position={[x, 0.3, 0]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 3.2, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0.05, 1.8 - i * 0.2, 0.05]} scale={[1, 1, 0.12]}>
            <sphereGeometry args={[1.05 - i * 0.15, 16, 12, 0, Math.PI]} />
            <meshStandardMaterial color={sailCol} roughness={0.9} emissive={sailCol} emissiveIntensity={lit * 0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* tiny cabin light */}
      <Glow position={[1.4, 0.7, 0.3]} color="#ffcf80" size={0.9} opacity={0.75} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Fresnel lens (beehive of glass rings)                               */
/* ------------------------------------------------------------------ */
export const FresnelLens: React.FC<{ glow: number; position?: [number, number, number]; scale?: number }> = ({ glow, position = [0, 0, 0], scale = 1 }) => {
  const rings = useMemo(() => new Array(9).fill(0).map((_, i) => i), []);
  return (
    <group position={position} scale={scale}>
      {rings.map((i) => {
        const y = (i - 4) * 0.16;
        const r = 0.62 - Math.abs(i - 4) * 0.045;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.065, 12, 48]} />
            <meshPhysicalMaterial
              color="#d9f1ff"
              roughness={0.05}
              metalness={0.1}
              clearcoat={1}
              transparent
              opacity={0.55}
              emissive="#ffc35a"
              emissiveIntensity={glow * 1.6}
            />
          </mesh>
        );
      })}
      {/* brass frame */}
      {[-0.78, 0.78].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.08, 32]} />
          <meshStandardMaterial color="#b98a3e" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6]}>
            <boxGeometry args={[0.035, 1.5, 0.035]} />
            <meshStandardMaterial color="#b98a3e" metalness={0.85} roughness={0.3} />
          </mesh>
        );
      })}
      {/* pedestal */}
      <mesh position={[0, -1.25, 0]}>
        <cylinderGeometry args={[0.25, 0.45, 0.9, 24]} />
        <meshStandardMaterial color="#2a2c31" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};
