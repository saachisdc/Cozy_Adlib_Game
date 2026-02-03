// UnhingedVizPanel.jsx
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
 * Map total “signal” hits to a sphere size in world units.
 * Works for snapshot + historical.
 */
function hitsToSize(data) {
  if (!data) return 0.12;

  const totalHits =
    (data.cozyHits ?? 0) + (data.weirdHits ?? 0) + (data.selfAwareHits ?? 0);

  const maxHits = 8; // soft cap, tweak later
  const norm = Math.min(1, totalHits / maxHits);

  // size range ~0.12 -> 0.4
  return 0.12 + norm * 0.28;
}

/**
 * Map cozy/weird/selfAware hits into a 3D position.
 * x = cozy, y = weird, z = selfAware, scaled down to a comfy world size.
 */
function snapshotToTargetPosition(data) {
  if (!data) return [0, 0, 0];

  const scale = 0.55; // tweakable world scaling
  const x = (data.cozyHits ?? 0) * scale;
  const y = (data.weirdHits ?? 0) * scale;
  const z = (data.selfAwareHits ?? 0) * scale;

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
        const size = hitsToSize(r) * 0.4; // smaller than live point

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
    () => wrongRatioToColor(snapshot, totalSteps || snapshot?.totalSteps),
    [snapshot, totalSteps],
  );
  const size = useMemo(() => hitsToSize(snapshot), [snapshot]);

  // Lerp the sphere towards the target position every frame
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const [tx, ty, tz] = target;
    const pos = meshRef.current.position;

    // Faster animation while text is typing, slower while paused.
    const speed = typingPaused ? 3 : 8;
    const alpha = 1 - Math.exp(-speed * delta); // smooth-ish

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
  const AXIS_LEN = 3; // tweak if you want bigger/smaller axes

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} />

      {/* Axes + labels */}
      <group position={[0, -0.1, 0]}>
        {/* X axis — cozy */}
        <mesh position={[AXIS_LEN / 2, 0, 0]}>
          <boxGeometry args={[AXIS_LEN, 0.03, 0.03]} />
          <meshStandardMaterial color="#4ade80" transparent opacity={0.6} />
        </mesh>

        <Text
          position={[AXIS_LEN + 0.15, 0, 0]}
          fontSize={0.3}
          color="#4ade80"
          anchorX="left"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          cozy hits
        </Text>

        {/* Y axis — weird */}
        <mesh position={[0, AXIS_LEN / 2, 0]}>
          <boxGeometry args={[0.03, AXIS_LEN, 0.03]} />
          <meshStandardMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>

        <Text
          position={[0, AXIS_LEN + 0.15, 0]}
          fontSize={0.3}
          color="#a855f7"
          anchorX="center"
          anchorY="bottom"
          rotation={[0, Math.PI / 4, 0]}
        >
          weird hits
        </Text>

        {/* Z axis — self-aware */}
        <mesh position={[0, 0, AXIS_LEN / 2]}>
          <boxGeometry args={[0.03, 0.03, AXIS_LEN]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>

        <Text
          position={[0, 0, AXIS_LEN + 0.15]}
          fontSize={0.3}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          self-aware hits
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

export default function UnhingedVizPanel({
  snapshot,
  typingPaused,
  currentStoryId, // not used yet, but handy to have
  historicalRuns = [],
  totalSteps,
}) {
  const hasSnapshot = !!snapshot;

  return (
    <section className="viz_container">
      <h2 className="viz_title">Heuristic Explorer</h2>
      <p className="viz_subtitle">
        This panel shows a 3D point for your current run based on cozy, weird
        and self-aware hits. The color indicates how many wrong choices were
        made. The size indicates total number of word hits.
      </p>

      {hasSnapshot ? (
        <div className="viz_stats">
          <div className="viz_stats_row">
            <span>Cozy word hits</span>
            <span>{snapshot.cozyHits}</span>
          </div>
          <div className="viz_stats_row">
            <span>Weird word hits</span>
            <span>{snapshot.weirdHits}</span>
          </div>
          <div className="viz_stats_row">
            <span>Self-aware word hits</span>
            <span>{snapshot.selfAwareHits}</span>
          </div>
          <div className="viz_stats_row">
            <span>Wrong choices</span>
            <span>
              {snapshot.wrongChoices}/{snapshot.totalSteps}
            </span>
          </div>
        </div>
      ) : (
        <p className="viz_hint">
          Play a story and make a choice to see the point move. At the end of
          the story, the point will show the final heuristic breakdown.
        </p>
      )}

      {/* 3D viz – only really interesting when we have some data */}
      <div className="viz_canvas_wrapper">
        <Canvas camera={{ position: [5, 6, 5], fov: 45 }}>
          {/* Orbit-only camera controls */}
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
            position={[0, 0, 0]} // position doesn’t matter in fullscreen mode
            fullscreen
            style={{
              pointerEvents: "none", // 👈 important: don't block orbit controls
            }}
          >
            <div className="viz_hint_mouse">use mouse to rotate</div>
          </Html>
        </Canvas>
      </div>
      {snapshot && (
        <div className="viz_heuristic_tokens">
          {snapshot.cozyHitWords?.length > 0 && (
            <div className="viz_tokens_group">
              <div className="viz_tokens_label">Cozy hits:</div>
              <div className="viz_tokens_list">
                {snapshot.cozyHitWords.join(", ")}
              </div>
            </div>
          )}

          {snapshot.weirdHitWords?.length > 0 && (
            <div className="viz_tokens_group">
              <div className="viz_tokens_label">Weird hits:</div>
              <div className="viz_tokens_list">
                {snapshot.weirdHitWords.join(", ")}
              </div>
            </div>
          )}

          {snapshot.selfAwareHitWords?.length > 0 && (
            <div className="viz_tokens_group">
              <div className="viz_tokens_label">Self-aware hits:</div>
              <div className="viz_tokens_list">
                {snapshot.selfAwareHitWords.join(", ")}
              </div>
            </div>
          )}
        </div>
      )}
      <p className="viz_footer_note">
        Typing:{" "}
        <strong>
          {typingPaused ? "paused (waiting for choice)" : "playing"}
        </strong>
      </p>
    </section>
  );
}
