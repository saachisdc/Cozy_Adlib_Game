// UnhingedVizPanel.jsx
import React from "react";
import "/styles/components/unhingedviz.css";

export default function UnhingedVizPanel({ snapshot, typingPaused }) {
  // For now, this is just a placeholder box.
  // Later, snapshot + typingPaused will drive the 3D viz.
  return (
    <section className="viz_container">
      <h2 className="viz_title">Heuristic Explorer (WIP)</h2>
      <p className="viz_subtitle">
        This panel will show a 3D cloud of runs and your current story’s path.
      </p>

      {snapshot ? (
        <div className="viz_stats">
          <div className="viz_stats_row">
            <span>Cozy hits</span>
            <span>{snapshot.cozyHits}</span>
          </div>
          <div className="viz_stats_row">
            <span>Weird hits</span>
            <span>{snapshot.weirdHits}</span>
          </div>
          <div className="viz_stats_row">
            <span>Self-aware hits</span>
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
          Play a story to the end to see the final heuristic breakdown here.
        </p>
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
