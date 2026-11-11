import React, { useMemo } from "react";
import * as THREE from "three";
import { Glow } from "./fx";
import { mixColor, rng } from "./utils";

/* ================================================================== */
/* Shared look                                                         */
/* ================================================================== */
const SKIN = "#f3c4a2";
const SKIN_OLD = "#e8b393";

const Mat: React.FC<{ c: string; r?: number; m?: number; e?: string; ei?: number; cc?: number }> = ({
  c,
  r = 0.62,
  m = 0,
  e = "#000000",
  ei = 0,
  cc = 0,
}) =>
  cc > 0 ? (
    <meshPhysicalMaterial color={c} roughness={r} metalness={m} emissive={e} emissiveIntensity={ei} clearcoat={cc} clearcoatRoughness={0.2} />
  ) : (
    <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e} emissiveIntensity={ei} />
  );

/** Bell-ish coat body made with a lathe */
const useLathe = (pts: [number, number][], segs = 40) =>
  useMemo(() => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs), []);

/** Big expressive cartoon eye. look = [x,y] in -1..1, blink 0..1 (1 = closed), lid = sad droop 0..1 */
const Eye: React.FC<{
  position: [number, number, number];
  size: number;
  iris: string;
  look?: [number, number];
  blink?: number;
  lid?: number;
  lidColor: string;
  side: 1 | -1;
}> = ({ position, size, iris, look = [0, 0], blink = 0, lid = 0, lidColor, side }) => {
  const lx = look[0] * size * 0.28;
  const ly = look[1] * size * 0.22;
  const close = Math.min(1, Math.max(blink, lid * 0.45));
  return (
    <group position={position}>
      {/* eyeball */}
      <mesh scale={[size, size * 1.12, size * 0.55]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color="#fbfbf6" roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {/* iris */}
      <mesh position={[lx, ly, size * 0.42]} scale={[size * 0.66, size * 0.74, size * 0.24]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color={iris} roughness={0.2} clearcoat={1} />
      </mesh>
      {/* pupil */}
      <mesh position={[lx * 1.05, ly * 1.05, size * 0.56]} scale={[size * 0.36, size * 0.42, size * 0.12]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#0b0b10" roughness={0.1} />
      </mesh>
      {/* highlights */}
      <mesh position={[lx + size * 0.2, ly + size * 0.28, size * 0.66]}>
        <sphereGeometry args={[size * 0.16, 12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[lx - size * 0.18, ly - size * 0.2, size * 0.64]}>
        <sphereGeometry args={[size * 0.07, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* upper lid (closes down) */}
      {close > 0.02 && (
        <group rotation={[0, 0, side * -lid * 0.35]}>
          <mesh
            position={[0, size * 1.15 * (1 - close), 0]}
            scale={[size * 1.08, size * 1.2 * close + 0.001, size * 0.62]}
          >
            <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={lidColor} roughness={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/* ================================================================== */
/* MIRA                                                                 */
/* ================================================================== */
export type MiraPose = {
  crouch?: number; // 0..1
  walk?: number; // phase in radians (0 = still)
  walkAmt?: number; // 0..1
  headYaw?: number;
  headPitch?: number; // + looks up
  headRoll?: number;
  look?: [number, number];
  blink?: number;
  smile?: number; // -1 sad .. 1 big smile
  mouthOpen?: number; // 0..1
  armL?: [number, number, number]; // shoulder rotation (x fwd, y, z out)
  armR?: [number, number, number];
  elbowL?: number;
  elbowR?: number;
  lantern?: number; // 0..1 lantern brightness (in right hand)
  showLantern?: boolean;
  scarfSway?: number;
  breathe?: number; // phase
  bodyLean?: number; // x tilt
  bodyTwist?: number; // y
  sit?: number;
};

const Arm: React.FC<{
  side: 1 | -1;
  rot: [number, number, number];
  elbow: number;
  coat: string;
  children?: React.ReactNode;
}> = ({ side, rot, elbow, coat, children }) => (
  <group position={[side * 0.15, 0.6, 0]} rotation={[rot[0], rot[1], side * (0.18 + rot[2])]}>
    {/* shoulder puff */}
    <mesh scale={[0.075, 0.075, 0.075]}>
      <sphereGeometry args={[1, 20, 16]} />
      <Mat c={coat} r={0.75} />
    </mesh>
    <mesh position={[0, -0.09, 0]}>
      <capsuleGeometry args={[0.052, 0.12, 8, 16]} />
      <Mat c={coat} r={0.75} />
    </mesh>
    <group position={[0, -0.17, 0]} rotation={[-elbow, 0, 0]}>
      <mesh position={[0, -0.07, 0]}>
        <capsuleGeometry args={[0.047, 0.1, 8, 16]} />
        <Mat c={coat} r={0.75} />
      </mesh>
      {/* knitted cuff */}
      <mesh position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.018, 10, 20]} />
        <Mat c="#d9573f" r={0.95} />
      </mesh>
      {/* mitten-ish hand */}
      <group position={[0, -0.19, 0]}>
        <mesh scale={[0.05, 0.058, 0.045]}>
          <sphereGeometry args={[1, 20, 16]} />
          <Mat c={SKIN} r={0.55} />
        </mesh>
        <mesh position={[side * -0.035, 0.012, 0.02]} rotation={[0, 0, side * 0.6]} scale={[0.018, 0.03, 0.018]}>
          <sphereGeometry args={[1, 12, 10]} />
          <Mat c={SKIN} r={0.55} />
        </mesh>
        {children}
      </group>
    </group>
  </group>
);

export const Lantern: React.FC<{ glow: number; scale?: number }> = ({ glow, scale = 1 }) => (
  <group scale={scale}>
    {/* bail handle */}
    <mesh position={[0, 0.02, 0]}>
      <torusGeometry args={[0.035, 0.005, 6, 20, Math.PI]} />
      <meshStandardMaterial color="#2e2a26" metalness={0.7} roughness={0.4} />
    </mesh>
    <group position={[0, -0.09, 0]}>
      <mesh position={[0, 0.07, 0]}>
        <coneGeometry args={[0.055, 0.04, 16]} />
        <meshStandardMaterial color="#3a2f28" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 20]} />
        <meshPhysicalMaterial color="#ffe0a0" emissive="#ffb347" emissiveIntensity={0.6 + glow * 2.5} transparent opacity={0.85} roughness={0.1} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.042, 0, Math.sin((i * Math.PI) / 2) * 0.042]}>
          <cylinderGeometry args={[0.004, 0.004, 0.11, 6]} />
          <meshStandardMaterial color="#2e2a26" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, -0.058, 0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.02, 20]} />
        <meshStandardMaterial color="#3a2f28" metalness={0.6} roughness={0.45} />
      </mesh>
      <Glow color="#ffbe62" size={0.55 * (0.6 + glow)} opacity={0.75 * glow} />
      <pointLight color="#ffb45a" intensity={2.2 * glow} distance={6} decay={1.6} />
    </group>
  </group>
);

export const Mira: React.FC<{ pose?: MiraPose; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; children?: React.ReactNode }> = ({
  pose = {},
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  children,
}) => {
  const {
    crouch = 0,
    walk = 0,
    walkAmt = 0,
    headYaw = 0,
    headPitch = 0,
    headRoll = 0,
    look = [0, 0],
    blink = 0,
    smile = 0.4,
    mouthOpen = 0,
    armL = [0, 0, 0],
    armR = [0, 0, 0],
    elbowL = 0.25,
    elbowR = 0.25,
    lantern = 1,
    showLantern = true,
    scarfSway = 0,
    breathe = 0,
    bodyLean = 0,
    bodyTwist = 0,
  } = pose;
  const COAT = "#2f7488";
  const HAIR = "#4b2a1e";
  const coat = useLathe([
    [0.0, 0.25],
    [0.2, 0.25],
    [0.205, 0.28],
    [0.18, 0.4],
    [0.15, 0.52],
    [0.135, 0.6],
    [0.11, 0.64],
    [0.0, 0.66],
  ]);
  const hairCap = useMemo(() => new THREE.SphereGeometry(1, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.6), []);

  const bob = Math.abs(Math.sin(walk)) * 0.03 * walkAmt;
  const legSwing = Math.sin(walk) * 0.55 * walkAmt;
  const br = Math.sin(breathe) * 0.012;
  const drop = crouch * 0.2;
  const kneeBend = crouch * 1.9;

  // smile mouth: torus arc. positive smile -> U shape
  const mouthCurve = Math.max(0.15, Math.abs(smile));
  const mouthFlip = smile >= 0 ? 0 : Math.PI;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* legs */}
      {[-1, 1].map((s) => {
        const swing = s * legSwing;
        return (
          <group key={s} position={[s * 0.075, 0.27 - drop * 0.3 + bob, 0]} rotation={[swing - kneeBend * 0.55, 0, 0]}>
            <mesh position={[0, -0.06, 0]}>
              <capsuleGeometry args={[0.048, 0.07, 8, 14]} />
              <Mat c="#3c3556" r={0.8} />
            </mesh>
            <group position={[0, -0.12, 0]} rotation={[kneeBend, 0, 0]}>
              <mesh position={[0, -0.04, 0]}>
                <capsuleGeometry args={[0.045, 0.06, 8, 14]} />
                <Mat c="#3c3556" r={0.8} />
              </mesh>
              {/* boot */}
              <group position={[0, -0.1, 0.02]} rotation={[-kneeBend * 0.45, 0, 0]}>
                <mesh scale={[0.062, 0.05, 0.095]}>
                  <sphereGeometry args={[1, 20, 14]} />
                  <Mat c="#7a4a2b" r={0.45} cc={0.4} />
                </mesh>
                <mesh position={[0, 0.03, -0.01]}>
                  <cylinderGeometry args={[0.055, 0.058, 0.06, 18]} />
                  <Mat c="#7a4a2b" r={0.45} cc={0.4} />
                </mesh>
              </group>
            </group>
          </group>
        );
      })}

      {/* upper body */}
      <group position={[0, -drop + bob, 0]} rotation={[bodyLean + crouch * 0.18, bodyTwist, 0]}>
        <group scale={[1 + br, 1 + br * 0.5, 1 + br]}>
          <mesh geometry={coat}>
            <Mat c={COAT} r={0.72} />
          </mesh>
          {/* coat buttons */}
          {[0.36, 0.45, 0.54].map((y, i) => (
            <mesh key={i} position={[0, y, 0.19 - (y - 0.36) * 0.28]}>
              <sphereGeometry args={[0.014, 10, 8]} />
              <Mat c="#e7c37a" r={0.3} m={0.4} />
            </mesh>
          ))}
          {/* pockets */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.1, 0.33, 0.165]} rotation={[-0.15, s * 0.45, 0]} scale={[0.05, 0.035, 0.012]}>
              <sphereGeometry args={[1, 12, 8]} />
              <Mat c="#2a6577" r={0.8} />
            </mesh>
          ))}
        </group>

        {/* knitted scarf: stacked ribbed rings + hanging tail */}
        <group position={[0, 0.655, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, i * 0.03 - 0.02, 0]} rotation={[Math.PI / 2 + 0.1, 0, 0]}>
              <torusGeometry args={[0.105 - i * 0.006, 0.035, 14, 30]} />
              <Mat c={i % 2 ? "#f1d9a8" : "#d9573f"} r={0.98} />
            </mesh>
          ))}
          <group position={[0.07, 0.0, 0.1]} rotation={[0.2 + scarfSway * 0.25, 0, 0.18 + scarfSway * 0.35]}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[0, -0.04 - i * 0.045, 0]} scale={[0.05, 0.026, 0.018]}>
                <sphereGeometry args={[1, 14, 10]} />
                <Mat c={i % 2 ? "#f1d9a8" : "#d9573f"} r={0.98} />
              </mesh>
            ))}
            {/* fringe */}
            {[-2, -1, 0, 1, 2].map((i) => (
              <mesh key={i} position={[i * 0.016, -0.26, 0]}>
                <cylinderGeometry args={[0.005, 0.003, 0.04, 5]} />
                <Mat c="#d9573f" r={1} />
              </mesh>
            ))}
          </group>
        </group>

        {/* arms */}
        <Arm side={-1} rot={armL} elbow={elbowL} coat={COAT} />
        <Arm side={1} rot={armR} elbow={elbowR} coat={COAT}>
          {showLantern && (
            <group position={[0, -0.03, 0.0]} rotation={[-armR[0] + elbowR, 0, -(0.18 + armR[2])]}>
              <Lantern glow={lantern} />
            </group>
          )}
        </Arm>

        {/* head */}
        <group position={[0, 0.7, 0]} rotation={[-headPitch, headYaw, headRoll]}>
          <group position={[0, 0.22, 0]}>
            {/* face */}
            <mesh scale={[0.255, 0.24, 0.235]}>
              <sphereGeometry args={[1, 48, 36]} />
              <Mat c={SKIN} r={0.5} />
            </mesh>
            {/* ears */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.245, -0.01, 0]} scale={[0.03, 0.05, 0.035]}>
                <sphereGeometry args={[1, 14, 10]} />
                <Mat c={SKIN} r={0.5} />
              </mesh>
            ))}
            {/* cheeks */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.135, -0.07, 0.175]} scale={[0.05, 0.03, 0.02]}>
                <sphereGeometry args={[1, 14, 10]} />
                <meshStandardMaterial color="#ef8f86" transparent opacity={0.55} roughness={0.8} />
              </mesh>
            ))}
            {/* nose */}
            <mesh position={[0, -0.035, 0.232]} scale={[0.026, 0.021, 0.022]}>
              <sphereGeometry args={[1, 14, 10]} />
              <Mat c="#eeb090" r={0.5} />
            </mesh>
            {/* eyes */}
            <Eye position={[-0.085, 0.02, 0.19]} size={0.062} iris="#3f7a5a" look={look} blink={blink} lidColor={SKIN} side={-1} lid={smile < 0 ? -smile * 0.6 : 0} />
            <Eye position={[0.085, 0.02, 0.19]} size={0.062} iris="#3f7a5a" look={look} blink={blink} lidColor={SKIN} side={1} lid={smile < 0 ? -smile * 0.6 : 0} />
            {/* brows */}
            {[-1, 1].map((s) => (
              <mesh
                key={s}
                position={[s * 0.088, 0.105 + Math.max(0, smile) * 0.008, 0.215]}
                rotation={[0, 0, Math.PI / 2 + s * (0.12 - (smile < 0 ? 0.25 : 0))]}
              >
                <capsuleGeometry args={[0.009, 0.045, 4, 8]} />
                <Mat c={HAIR} r={0.8} />
              </mesh>
            ))}
            {/* mouth */}
            <group position={[0, -0.11, 0.212]} rotation={[0.25, 0, mouthFlip]}>
              <mesh rotation={[0, 0, Math.PI + (Math.PI - Math.PI * 0.55) / 2]}>
                <torusGeometry args={[0.035 + mouthCurve * 0.012, 0.0075, 8, 20, Math.PI * 0.55]} />
                <meshStandardMaterial color="#8b3a3a" roughness={0.5} />
              </mesh>
              {mouthOpen > 0.02 && (
                <mesh position={[0, -0.03, -0.004]} scale={[0.028, 0.02 * mouthOpen, 0.01]}>
                  <sphereGeometry args={[1, 14, 10]} />
                  <meshStandardMaterial color="#5a1f24" roughness={0.6} />
                </mesh>
              )}
            </group>

            {/* hair cap */}
            <mesh geometry={hairCap} position={[0, 0.015, -0.015]} rotation={[-0.55, 0, 0]} scale={[0.272, 0.27, 0.262]}>
              <Mat c={HAIR} r={0.55} cc={0.3} />
            </mesh>
            {/* bangs */}
            {[-0.13, -0.05, 0.035, 0.11].map((x, i) => (
              <mesh key={i} position={[x, 0.175 - Math.abs(x) * 0.3, 0.155 - Math.abs(x) * 0.25]} rotation={[1.05, 0, x * 2.4]} scale={[0.07, 0.035, 0.085]}>
                <sphereGeometry args={[1, 16, 12]} />
                <Mat c={HAIR} r={0.55} cc={0.3} />
              </mesh>
            ))}
            {/* two pigtails with red ties */}
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.24, -0.02, -0.07]} rotation={[0.1, 0, s * 0.35 + scarfSway * 0.12]}>
                <mesh position={[s * 0.02, 0.03, 0]} rotation={[0, 0, s * Math.PI / 2]}>
                  <torusGeometry args={[0.03, 0.012, 8, 16]} />
                  <Mat c="#d9573f" r={0.9} />
                </mesh>
                <mesh position={[s * 0.06, -0.06, 0]} scale={[0.06, 0.11, 0.06]}>
                  <sphereGeometry args={[1, 18, 14]} />
                  <Mat c={HAIR} r={0.55} cc={0.3} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
        {children}
      </group>
    </group>
  );
};

/* ================================================================== */
/* PYH – fluffy round spirit                                            */
/* ================================================================== */
export type PyhPose = {
  glow?: number; // 0 dim smoky .. 1 bright gold
  sad?: number; // 0..1 droop
  look?: [number, number];
  blink?: number;
  pointL?: number; // 0..1 raise left paw (points)
  pointDir?: [number, number, number]; // rotation of left paw group
  hide?: number; // 0..1 squash/hide face
  tremble?: number;
  squash?: number; // -1..1 (stretch vs squash)
  frame: number;
  smile?: number;
  light?: boolean;
};

export const Pyh: React.FC<{ pose: PyhPose; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({
  pose,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const {
    glow = 0,
    sad = 0,
    look = [0, 0],
    blink = 0,
    pointL = 0,
    pointDir = [0, 0, 0],
    hide = 0,
    tremble = 0,
    squash = 0,
    frame,
    smile = 0,
    light = true,
  } = pose;

  const fluff = useMemo(() => {
    const r = rng(42);
    const pts: { p: [number, number, number]; s: number }[] = [];
    const N = 110;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      pts.push({ p: [Math.cos(th) * rad, y, Math.sin(th) * rad], s: 0.26 + r() * 0.12 });
    }
    return pts;
  }, []);
  const tufts = useMemo(() => {
    const r = rng(11);
    return new Array(5).fill(0).map((_, i) => ({ a: -0.6 + i * 0.3 + (r() - 0.5) * 0.1, h: 0.25 + r() * 0.15 }));
  }, []);

  const body = mixColor("#9aa6bd", "#ffc860", glow);
  const bodyDark = mixColor("#7d889e", "#f39b3a", glow);
  const emis = mixColor("#4a5878", "#ffb648", glow);
  const ei = 0.35 + glow * 1.6;
  const R = 0.12;
  const tr = tremble * Math.sin(frame * 2.7) * 0.006;
  const sq = 1 - squash * 0.15;
  const breathe = 1 + Math.sin(frame * 0.12) * 0.025;

  return (
    <group position={[position[0] + tr, position[1], position[2]]} rotation={rotation} scale={scale}>
      <group scale={[breathe / Math.sqrt(sq), breathe * sq, breathe / Math.sqrt(sq)]} rotation={[hide * 0.5, 0, 0]}>
        {/* core */}
        <mesh scale={R}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color={body} emissive={emis} emissiveIntensity={ei} roughness={0.95} />
        </mesh>
        {/* fluffy surface */}
        {fluff.map((f, i) => (
          <mesh key={i} position={[f.p[0] * R * 0.92, f.p[1] * R * 0.92, f.p[2] * R * 0.92]} scale={R * f.s}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? bodyDark : body}
              emissive={emis}
              emissiveIntensity={ei * (i % 3 === 0 ? 0.7 : 1)}
              roughness={1}
            />
          </mesh>
        ))}
        {/* hair tufts on top */}
        {tufts.map((t, i) => (
          <mesh key={i} position={[t.a * R * 0.6, R * 1.05, 0]} rotation={[0, 0, -t.a * 1.2 + Math.sin(frame * 0.1 + i) * 0.12]} scale={[R * 0.12, R * t.h * 2.2, R * 0.12]}>
            <coneGeometry args={[1, 1, 8]} />
            <meshStandardMaterial color={body} emissive={emis} emissiveIntensity={ei} roughness={1} />
          </mesh>
        ))}

        {/* face */}
        <group position={[0, -0.005 - sad * 0.012, R * 1.02]} rotation={[sad * 0.25, 0, 0]}>
          {[-1, 1].map((s) => {
            const lx = look[0] * 0.006;
            const ly = look[1] * 0.006;
            const close = Math.min(1, Math.max(blink, sad * 0.4, hide * 0.9));
            return (
              <group key={s} position={[s * 0.042, 0.012, 0]}>
                <mesh scale={[0.022, 0.026 * (1 - close * 0.85), 0.014]} position={[lx, ly, 0]}>
                  <sphereGeometry args={[1, 18, 14]} />
                  <meshPhysicalMaterial color="#141218" roughness={0.05} clearcoat={1} />
                </mesh>
                {close < 0.7 && (
                  <mesh position={[lx + 0.006, ly + 0.009, 0.012]}>
                    <sphereGeometry args={[0.0055, 8, 6]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                )}
                {/* sad brow */}
                {sad > 0.05 && (
                  <mesh position={[0, 0.035, 0.005]} rotation={[0, 0, s * (0.35 * sad)]} scale={[1, 1, 1]}>
                    <capsuleGeometry args={[0.004, 0.02, 4, 6]} />
                    <meshStandardMaterial color={bodyDark} />
                  </mesh>
                )}
              </group>
            );
          })}
          {/* little mouth */}
          <mesh position={[0, -0.03, 0.004]} rotation={[0, 0, smile >= 0 ? Math.PI * 1.2 : Math.PI * 0.2]}>
            <torusGeometry args={[0.012, 0.003, 6, 12, Math.PI * 0.6]} />
            <meshStandardMaterial color="#3a2a2a" />
          </mesh>
          {/* blush */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.07, -0.02, -0.01]} scale={[0.018, 0.01, 0.008]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#ff9a8a" transparent opacity={0.3 + glow * 0.4} />
            </mesh>
          ))}
        </group>

        {/* paws */}
        <mesh position={[0.06, -R * 0.95, 0.05]} scale={[0.03, 0.022, 0.035]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={bodyDark} emissive={emis} emissiveIntensity={ei * 0.6} roughness={1} />
        </mesh>
        <mesh position={[-0.06, -R * 0.95, 0.05]} scale={[0.03, 0.022, 0.035]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={bodyDark} emissive={emis} emissiveIntensity={ei * 0.6} roughness={1} />
        </mesh>
        {/* side arms (left can point) */}
        <group position={[-R * 0.95, -0.02, 0.02]} rotation={[pointDir[0] * pointL, pointDir[1] * pointL, -0.6 + pointL * (pointDir[2] || -1.6)]}>
          <mesh position={[0, -0.045, 0]} scale={[0.024, 0.055, 0.024]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={body} emissive={emis} emissiveIntensity={ei} roughness={1} />
          </mesh>
        </group>
        <group position={[R * 0.95, -0.02, 0.02]} rotation={[0, 0, 0.6 - hide * 0.9]}>
          <mesh position={[0, -0.03, 0]} scale={[0.02, 0.04, 0.02]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={body} emissive={emis} emissiveIntensity={ei} roughness={1} />
          </mesh>
        </group>
      </group>

      {/* smoky wisps when dim */}
      {glow < 0.6 &&
        [0, 1, 2, 3, 4].map((i) => {
          const t = ((frame * 0.008 + i / 5) % 1 + 1) % 1;
          const op = (1 - glow / 0.6) * Math.sin(t * Math.PI) * 0.28;
          return (
            <mesh
              key={i}
              position={[Math.sin(i * 2.1 + frame * 0.03) * 0.04, R * 0.9 + t * 0.32, Math.cos(i * 1.7) * 0.03]}
              scale={0.03 + t * 0.06}
            >
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color="#8d97ab" transparent opacity={op} depthWrite={false} roughness={1} />
            </mesh>
          );
        })}

      {/* glow */}
      <Glow color={mixColor("#8fa3c8", "#ffc45e", glow)} size={0.45 + glow * 1.1} opacity={0.18 + glow * 0.85} />
      {light && <pointLight castShadow={false} color={mixColor("#8fa6d0", "#ffbd59", glow)} intensity={0.15 + glow * 4} distance={4 + glow * 4} decay={1.5} />}
    </group>
  );
};

/* ================================================================== */
/* KEEPER – kind old lighthouse keeper                                  */
/* ================================================================== */
export type KeeperPose = {
  armsOpen?: number;
  headYaw?: number;
  headPitch?: number;
  smile?: number;
  blink?: number;
  breathe?: number;
  look?: [number, number];
  lean?: number;
};

export const Keeper: React.FC<{ pose?: KeeperPose; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({
  pose = {},
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const { armsOpen = 0, headYaw = 0, headPitch = 0, smile = 0.7, blink = 0, breathe = 0, look = [0, 0], lean = 0 } = pose;
  const COAT = "#e7b230";
  const coat = useLathe([
    [0, 0.12],
    [0.33, 0.12],
    [0.32, 0.2],
    [0.28, 0.6],
    [0.25, 0.9],
    [0.2, 1.02],
    [0, 1.06],
  ]);
  const beard = useMemo(() => {
    const r = rng(3);
    return new Array(26).fill(0).map(() => {
      const a = (r() - 0.5) * 2.4;
      const d = r();
      return { p: [Math.sin(a) * 0.15, -0.08 - d * 0.2, Math.cos(a) * 0.17 - 0.02] as [number, number, number], s: 0.06 + r() * 0.04 };
    });
  }, []);
  const br = Math.sin(breathe) * 0.01;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* boots */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.12, 0.06, 0.04]} scale={[0.1, 0.07, 0.15]}>
          <sphereGeometry args={[1, 16, 12]} />
          <Mat c="#2d3436" r={0.4} cc={0.5} />
        </mesh>
      ))}
      <group rotation={[lean, 0, 0]}>
        <group scale={[1 + br, 1, 1 + br]}>
          <mesh geometry={coat}>
            <Mat c={COAT} r={0.35} cc={0.8} />
          </mesh>
          {/* coat clasps */}
          {[0.45, 0.6, 0.75].map((y, i) => (
            <mesh key={i} position={[0.02, y, 0.29 - (y - 0.45) * 0.12]} scale={[0.04, 0.012, 0.012]}>
              <boxGeometry />
              <Mat c="#3b3b3b" r={0.4} m={0.6} />
            </mesh>
          ))}
        </group>
        {/* arms */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.25, 0.92, 0]} rotation={[-armsOpen * 0.6, 0, s * (0.25 + armsOpen * 0.9)]}>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.08, 0.3, 8, 16]} />
              <Mat c={COAT} r={0.35} cc={0.8} />
            </mesh>
            <mesh position={[0, -0.43, 0.01]} scale={[0.065, 0.075, 0.06]}>
              <sphereGeometry args={[1, 16, 12]} />
              <Mat c={SKIN_OLD} r={0.6} />
            </mesh>
          </group>
        ))}
        {/* head */}
        <group position={[0, 1.08, 0]} rotation={[-headPitch, headYaw, 0]}>
          <group position={[0, 0.2, 0]}>
            <mesh scale={[0.22, 0.23, 0.21]}>
              <sphereGeometry args={[1, 40, 30]} />
              <Mat c={SKIN_OLD} r={0.6} />
            </mesh>
            {/* big round nose */}
            <mesh position={[0, -0.01, 0.22]} scale={[0.06, 0.055, 0.055]}>
              <sphereGeometry args={[1, 20, 14]} />
              <Mat c="#e09a82" r={0.5} />
            </mesh>
            {/* cheeks */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.12, -0.03, 0.16]} scale={[0.055, 0.04, 0.03]}>
                <sphereGeometry args={[1, 14, 10]} />
                <meshStandardMaterial color="#e88a78" transparent opacity={0.5} />
              </mesh>
            ))}
            {/* kind eyes */}
            <Eye position={[-0.075, 0.05, 0.175]} size={0.032} iris="#4a6a8a" look={look} blink={Math.max(blink, smile * 0.35)} lidColor={SKIN_OLD} side={-1} />
            <Eye position={[0.075, 0.05, 0.175]} size={0.032} iris="#4a6a8a" look={look} blink={Math.max(blink, smile * 0.35)} lidColor={SKIN_OLD} side={1} />
            {/* bushy brows */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.078, 0.1, 0.18]} rotation={[0, 0, s * -0.2]} scale={[0.05, 0.02, 0.025]}>
                <sphereGeometry args={[1, 14, 10]} />
                <Mat c="#eceff1" r={1} />
              </mesh>
            ))}
            {/* beard */}
            {beard.map((b, i) => (
              <mesh key={i} position={b.p} scale={b.s}>
                <sphereGeometry args={[1, 14, 10]} />
                <Mat c={i % 4 === 0 ? "#d9dde0" : "#f2f4f5"} r={1} />
              </mesh>
            ))}
            {/* mustache */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.06, -0.065, 0.2]} rotation={[0, 0, s * (0.35 + smile * 0.25)]} scale={[0.07, 0.03, 0.035]}>
                <sphereGeometry args={[1, 16, 10]} />
                <Mat c="#f4f6f7" r={1} />
              </mesh>
            ))}
            {/* sou'wester hat */}
            <group position={[0, 0.1, -0.01]} rotation={[-0.15, 0, 0]}>
              <mesh scale={[0.235, 0.2, 0.235]}>
                <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <Mat c={COAT} r={0.35} cc={0.8} />
              </mesh>
              <mesh position={[0, 0.0, -0.02]} rotation={[0.12, 0, 0]}>
                <cylinderGeometry args={[0.36, 0.36, 0.015, 40]} />
                <Mat c={COAT} r={0.35} cc={0.8} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
