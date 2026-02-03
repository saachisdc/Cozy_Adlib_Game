// NBVizPanel.jsx
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";

import "/styles/components/unhingedviz.css";

/**
 * Map wrongChoices / totalSteps -> smooth gradient
 * 0   -> blue  (all correct)
 * 0.5 -> purple
 * 1   -> red   (all wrong)
 *
 * Works for both live snapshot and historical runs.
 */
function wrongRatioToColor(data, totalStepsOverride) {
  if (!data) {
    return "rgb(56, 189, 248)"; // default cyan-ish
  }

  const totalSteps =
    typeof totalStepsOverride === "number"
      ? totalStepsOverride
      : data.totalSteps;

  if (!totalSteps || totalSteps <= 0) {
    return "rgb(56, 189, 248)";
  }

  const ratio = Math.min(1, Math.max(0, data.wrongChoices / totalSteps));

  const blue = [56, 189, 248]; // sky-400
  const purple = [168, 85, 247]; // violet-500
  const red = [239, 68, 68]; // red-500

  const mix = (a, b, t) => a + (b - a) * t;

  let from, to, t;
  if (ratio <= 0.5) {
    from = blue;
    to = purple;
    t = ratio / 0.5;
  } else {
    from = purple;
    to = red;
    t = (ratio - 0.5) / 0.5;
  }

  const [r0, g0, b0] = from;
  const [r1, g1, b1] = to;

  const r = Math.round(mix(r0, r1, t));
  const g = Math.round(mix(g0, g1, t));
  const b = Math.round(mix(b0, b1, t));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * For NB, use "confidence" (max probability) to control sphere size.
 */
function probToSize(data) {
  if (!data) return 0.16;

  const pW = data.nbProbWholesome ?? 0;
  const pK = data.nbProbKindaOdd ?? 0;
  const pU = data.nbProbTotallyUnhinged ?? 0;

  const maxP = Math.max(pW, pK, pU); // 0..1

  // size range ~0.16 -> 0.38
  return 0.16 + maxP * 0.22;
}

/**
 * Map probabilities into a 3D position.
 * x = p(wholesome), y = p(kinda odd), z = p(totally unhinged)
 */
function snapshotToTargetPosition(data) {
  if (!data) return [0, 0, 0];

  const scale = 2.5; // tweakable world scaling, axes are length ~3
  const x = (data.nbProbWholesome ?? 0) * scale;
  const y = (data.nbProbKindaOdd ?? 0) * scale;
  const z = (data.nbProbTotallyUnhinged ?? 0) * scale;

  return [x, y, z];
}

/**
 * Faint background cloud of historical runs.
 */
function HistoricalCloud({ runs, totalSteps }) {
  const points = useMemo(
    () =>
      (runs || []).map((r, idx) => {
        const position = snapshotToTargetPosition(r);
        const color = wrongRatioToColor(r, totalSteps);
        const size = probToSize(r) * 0.4; // smaller than live point

        return { id: idx, position, color, size };
      }),
    [runs, totalSteps],
  );

  return (
    <group>
      {points.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[p.size, 10, 10]} />
          <meshStandardMaterial
            color={p.color}
            transparent
            opacity={0.05}
            roughness={0.7}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Bright animated point for the current run.
 */
function CurrentRunPoint({ snapshot, typingPaused, totalSteps }) {
  const meshRef = useRef();

  const target = useMemo(() => snapshotToTargetPosition(snapshot), [snapshot]);
  const color = useMemo(
    () => wrongRatioToColor(snapshot, totalSteps),
    [snapshot, totalSteps],
  );
  const size = useMemo(() => probToSize(snapshot), [snapshot]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const [tx, ty, tz] = target;
    const pos = meshRef.current.position;

    const speed = typingPaused ? 3 : 8;
    const alpha = 1 - Math.exp(-speed * delta);

    pos.x += (tx - pos.x) * alpha;
    pos.y += (ty - pos.y) * alpha;
    pos.z += (tz - pos.z) * alpha;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Full 3D scene: axes + labels + historical cloud + live point.
 */
function CurrentRunScene({
  snapshot,
  typingPaused,
  historicalRuns,
  totalSteps,
}) {
  const AXIS_LEN = 3;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} />

      {/* Axes + labels */}
      <group position={[0, -0.1, 0]}>
        {/* X axis — p(wholesome) */}
        <mesh position={[AXIS_LEN / 2, 0, 0]}>
          <boxGeometry args={[AXIS_LEN, 0.03, 0.03]} />
          <meshStandardMaterial color="#4ade80" transparent opacity={0.6} />
        </mesh>

        <Text
          position={[AXIS_LEN + 0.15, 0, 0]}
          fontSize={0.28}
          color="#4ade80"
          anchorX="left"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          p(wholesome)
        </Text>

        {/* Y axis — p(kinda odd) */}
        <mesh position={[0, AXIS_LEN / 2, 0]}>
          <boxGeometry args={[0.03, AXIS_LEN, 0.03]} />
          <meshStandardMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>

        <Text
          position={[0, AXIS_LEN + 0.2, 0]}
          fontSize={0.28}
          color="#a855f7"
          anchorX="center"
          anchorY="bottom"
          rotation={[0, Math.PI / 4, 0]}
        >
          p(kinda odd)
        </Text>

        {/* Z axis — p(totally unhinged) */}
        <mesh position={[0, 0, AXIS_LEN / 2]}>
          <boxGeometry args={[0.03, 0.03, AXIS_LEN]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>

        <Text
          position={[0, 0, AXIS_LEN + 0.2]}
          fontSize={0.28}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          p(totally unhinged)
        </Text>
      </group>

      {/* Historical runs as faint background cloud */}
      <HistoricalCloud runs={historicalRuns} totalSteps={totalSteps} />

      {/* Bright animated current run point */}
      <CurrentRunPoint
        snapshot={snapshot}
        typingPaused={typingPaused}
        totalSteps={totalSteps}
      />
    </>
  );
}

export default function NBVizPanel({
  snapshot,
  typingPaused,
  currentStoryId, // story3 only for now
  historicalRuns = [],
  totalSteps,
}) {
  const hasSnapshot = !!snapshot;

  // helper to format probs nicely
  const fmtProb = (p) =>
    p == null ? "—" : (Math.round(p * 100) / 100).toFixed(2);

  return (
    <section className="viz_container">
      <h2 className="viz_title"> Naive Bayes Explorer </h2>
      <p className="viz_subtitle">
        This panel shows a 3D point for Story 3 based on probabilities from the
        Naive Bayes model (trained on Stories 1–2). The color indicates how many
        wrong choices were made. The size indicates confidence (max
        probability).
      </p>
      {hasSnapshot ? (
        <div className="viz_stats">
          <div className="viz_stats_row">
            <span>p(wholesome)</span>
            <span>{fmtProb(snapshot.nbProbWholesome)}</span>
          </div>
          <div className="viz_stats_row">
            <span>p(kinda odd)</span>
            <span>{fmtProb(snapshot.nbProbKindaOdd)}</span>
          </div>
          <div className="viz_stats_row">
            <span>p(totally unhinged)</span>
            <span>{fmtProb(snapshot.nbProbTotallyUnhinged)}</span>
          </div>
          <div className="viz_stats_row">
            <span>Wrong choices</span>
            <span>
              {snapshot.wrongChoices}/{totalSteps}
            </span>
          </div>
        </div>
      ) : (
        <p className="viz_hint">
          Start Story 3 and make some choices to see NB model predictions here.
        </p>
      )}
      <div className="viz_canvas_wrapper">
        <Canvas camera={{ position: [5, 6, 5], fov: 45 }}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={0}
            rotateSpeed={0.7}
          />

          <CurrentRunScene
            snapshot={snapshot}
            typingPaused={typingPaused}
            historicalRuns={historicalRuns}
            totalSteps={totalSteps}
          />

          <Html
            fullscreen
            style={{
              pointerEvents: "none",
            }}
          >
            <div className="viz_hint_mouse">use mouse to rotate</div>
          </Html>
        </Canvas>
      </div>
      {snapshot?.nbTopTokens && snapshot.nbTopTokens.length > 0 && (
        <div className="viz_nb_tokens">
          <div className="viz_nb_tokens_label">NB signal words (baseline):</div>
          <div className="viz_nb_tokens_list">
            {Array.isArray(snapshot.nbTopTokens)
              ? snapshot.nbTopTokens.join(", ")
              : snapshot.nbTopTokens}
          </div>
        </div>
      )}{" "}
      <p className="viz_footer_note">
        Typing:{" "}
        <strong>
          {typingPaused ? "paused (waiting for choice)" : "playing"}
        </strong>
      </p>
    </section>
  );
}
