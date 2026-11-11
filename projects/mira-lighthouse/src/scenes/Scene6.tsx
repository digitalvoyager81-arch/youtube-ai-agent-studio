import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { BlobShadow, CameraRig, Glow, Sea, Sky, Sparkles, Stars } from "../fx";
import { Keeper, Mira, Pyh } from "../characters";
import { lerp3, seg } from "../utils";

/** Сцена 6 — Тепло единства. Уютная комната маяка у круглого окна. */
export const Scene6: React.FC = () => {
  const f = useCurrentFrame();

  const wallGeom = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-4, -0.5);
    s.lineTo(4, -0.5);
    s.lineTo(4, 5);
    s.lineTo(-4, 5);
    s.lineTo(-4, -0.5);
    const hole = new THREE.Path();
    hole.absarc(0, 1.95, 0.95, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return new THREE.ShapeGeometry(s, 64);
  }, []);

  const pull = seg(f, 0, 300);
  const camPos = lerp3([0.0, 1.35, 1.2], [0.15, 1.5, 4.6], pull);
  const camTarget = lerp3([0, 1.3, 0], [0, 1.45, -0.6], pull);
  const hover = Math.sin(f * 0.07) * 0.05;
  const pyhPos: [number, number, number] = [0, 1.3 + hover, 0.15];

  return (
    <>
      <CameraRig position={camPos} target={camTarget} fov={50} />
      <color attach="background" args={["#0a0d1c"]} />

      {/* outside: calm starry ocean */}
      <group position={[0, 0, -2.2]}>
        <Sky top="#070b1c" mid="#1b2a4e" bottom="#0a1020" />
        <Stars frame={f} count={1400} opacity={1} seed={3} minY={0.0} />
        <Sea frame={f} y={-6} position={[0, 0, -100]} size={300} segments={100} amp={0.35} speed={0.5} color="#0d1d3a" roughness={0.15} />
        {/* moon */}
        <mesh position={[-14, 16, -110]}>
          <sphereGeometry args={[3.2, 32, 24]} />
          <meshBasicMaterial color="#fff5dc" fog={false} />
        </mesh>
        <Glow position={[-14, 16, -109]} color="#cfe0ff" size={26} opacity={0.5} />
        <directionalLight position={[-14, 16, -110]} color="#9fb6ff" intensity={0.8} />
      </group>

      {/* warm interior light */}
      <hemisphereLight args={["#ffd7a8", "#3b2418", 0.45]} />
      <pointLight position={[-1.6, 1.4, 0.4]} color="#ffb565" intensity={6} distance={8} decay={1.4} />
      <pointLight position={[1.5, 2.8, 1.5]} color="#ffcf90" intensity={1.5} distance={8} decay={1.4} />
      <directionalLight position={[0, 3, -6]} color="#7f9cff" intensity={0.6} />

      {/* back wall with round window */}
      <mesh geometry={wallGeom} position={[0, 0, -2]}>
        <meshStandardMaterial color="#c99a6e" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* wainscot */}
      <mesh position={[0, 0.4, -1.98]}>
        <boxGeometry args={[8, 0.9, 0.05]} />
        <meshStandardMaterial color="#6b3f25" roughness={0.6} />
      </mesh>
      {/* window frame */}
      <mesh position={[0, 1.95, -1.97]}>
        <torusGeometry args={[0.97, 0.09, 16, 64]} />
        <meshStandardMaterial color="#6b3f25" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.95, -1.99]}>
        <boxGeometry args={[0.05, 1.9, 0.05]} />
        <meshStandardMaterial color="#6b3f25" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.95, -1.99]}>
        <boxGeometry args={[1.9, 0.05, 0.05]} />
        <meshStandardMaterial color="#6b3f25" roughness={0.45} />
      </mesh>
      {/* side walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 3.2, 2, 1.5]} rotation={[0, -s * Math.PI / 2, 0]}>
          <planeGeometry args={[8, 5]} />
          <meshStandardMaterial color="#b98a60" roughness={0.9} />
        </mesh>
      ))}
      {/* wooden floor planks */}
      {new Array(14).fill(0).map((_, i) => (
        <mesh key={i} position={[-3.25 + i * 0.5, -0.02, 1.5]}>
          <boxGeometry args={[0.49, 0.04, 8]} />
          <meshStandardMaterial color={i % 2 ? "#7a4a2c" : "#84522f"} roughness={0.55} />
        </mesh>
      ))}
      {/* round rug */}
      <mesh position={[0, 0.005, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 48]} />
        <meshStandardMaterial color="#9b3b33" roughness={1} />
      </mesh>
      <mesh position={[0, 0.008, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.3, 48]} />
        <meshStandardMaterial color="#e8c070" roughness={1} />
      </mesh>

      {/* little table with lamp and teacups */}
      <group position={[-1.75, 0, -0.9]}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 32]} />
          <meshStandardMaterial color="#6b3f25" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.06, 0.12, 0.7, 12]} />
          <meshStandardMaterial color="#5a341f" roughness={0.5} />
        </mesh>
        {/* lamp */}
        <mesh position={[0, 0.95, -0.15]}>
          <cylinderGeometry args={[0.03, 0.08, 0.45, 12]} />
          <meshStandardMaterial color="#b98a3e" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.25, -0.15]}>
          <cylinderGeometry args={[0.12, 0.25, 0.25, 24, 1, true]} />
          <meshStandardMaterial color="#ffe0a8" emissive="#ffb050" emissiveIntensity={1.4} side={THREE.DoubleSide} />
        </mesh>
        <Glow position={[0, 1.2, -0.15]} color="#ffb565" size={1.6} opacity={0.6} />
        <pointLight position={[0, 1.15, -0.1]} color="#ffb060" intensity={4} distance={6} decay={1.4} />
        {[[0.25, 0.15], [-0.2, 0.25]].map(([x, z], i) => (
          <group key={i} position={[x, 0.77, z]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.045, 0.08, 16]} />
              <meshStandardMaterial color="#f3ece0" roughness={0.3} />
            </mesh>
            <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.025, 0.008, 6, 12]} />
              <meshStandardMaterial color="#f3ece0" roughness={0.3} />
            </mesh>
            {/* steam */}
            {[0, 1, 2].map((k) => {
              const t = ((f * 0.012 + k / 3 + i * 0.2) % 1);
              return (
                <mesh key={k} position={[Math.sin(t * 6 + k) * 0.02, 0.06 + t * 0.35, 0]} scale={0.02 + t * 0.04}>
                  <sphereGeometry args={[1, 10, 8]} />
                  <meshStandardMaterial color="#ffffff" transparent opacity={Math.sin(t * Math.PI) * 0.18} depthWrite={false} />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>

      {/* bookshelf on the right */}
      <group position={[2.4, 0, -1.6]}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.2, 2.2, 0.4]} />
          <meshStandardMaterial color="#5a341f" roughness={0.6} />
        </mesh>
        {[0.45, 1.1, 1.75].map((y, r) =>
          new Array(7).fill(0).map((_, i) => (
            <mesh key={`${r}-${i}`} position={[-0.45 + i * 0.15, y + 0.15, 0.12]} rotation={[0, 0, i === 3 ? 0.2 : 0]}>
              <boxGeometry args={[0.11, 0.38 - (i % 3) * 0.05, 0.25]} />
              <meshStandardMaterial color={["#9b3b33", "#2f6f86", "#e8c070", "#4b5d4a", "#7a4a8a"][(i + r) % 5]} roughness={0.7} />
            </mesh>
          )),
        )}
      </group>

      {/* heroes */}
      <BlobShadow position={[-0.75, 0.012, 0.35]} size={0.9} />
      <Mira
        position={[-0.75, 0, 0.35]}
        rotation={[0, 0.65, 0]}
        pose={{
          smile: 1,
          headPitch: 0.25,
          headYaw: 0.05,
          headRoll: -0.08,
          look: [0.3, 0.5],
          blink: f > 130 && f < 136 ? 1 : 0,
          armL: [-0.15, 0, 0.05],
          elbowL: 1.0,
          armR: [-0.2, 0, 0.05],
          elbowR: 1.0,
          showLantern: false,
          breathe: f * 0.08,
          scarfSway: Math.sin(f * 0.04) * 0.2,
        }}
      />
      <BlobShadow position={[0.8, 0.012, 0.2]} size={1.2} />
      <Keeper
        position={[0.8, 0, 0.2]}
        rotation={[0, -0.6, 0]}
        scale={0.9}
        pose={{ smile: 1, headPitch: 0.1, headYaw: 0.05, blink: f > 200 && f < 206 ? 1 : 0, breathe: f * 0.06, armsOpen: 0.1 }}
      />
      <Pyh
        position={pyhPos}
        rotation={[0, Math.sin(f * 0.03) * 0.3, 0]}
        scale={1.15}
        pose={{ frame: f, glow: 1, smile: 1, look: [0, 0.2], blink: f > 90 && f < 96 ? 1 : 0, squash: Math.sin(f * 0.07) * 0.15 }}
      />
      <Glow position={pyhPos} color="#ffcf73" size={3.5} opacity={0.35} />
      <Sparkles frame={f} count={50} radius={1.6} center={[0, 1.3, 0.2]} color="#ffd88a" size={0.07} rise={0.004} opacity={0.85} seed={44} />
    </>
  );
};
