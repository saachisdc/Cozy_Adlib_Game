// Game.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import Typewriter from "./Typewriter";
import UnhingedVizPanel from "./UnhingedVizPanel";
import NBVizPanel from "./NBVizPanel";

import Story1BakedMittens from "./Story1BakedMittens";
import Story2MagicalCampfire from "./Story2MagicalCampfire";
import Story3CrunchyVideoGame from "./Story3CrunchyVideoGame";

import runsStory1 from "../simulated_runs/runs_story1_baked_mittens.json";
import runsStory2 from "../simulated_runs/runs_story2_magical_campfire.json";
import runsStory3 from "../simulated_runs/runs_story3_crunchy_video_game.json";
import runsStory3WithNB from "../simulated_runs/runs_story3_crunchy_video_game_with_nb.json";

import { computeUnhingedScore } from "./UnhingedScore";
import nbModel from "../models/nb_model.json";
import { predictVibe, topContributingTokens } from "../ml/nb";

import "/styles/modern-normalize.css";
import "/styles/global.css";
import "/styles/components/storylayout.css";
import "/styles/utility.css";

const PLACEHOLDER = "...choose a button below...";

function replaceLast(haystack, needle, replacement) {
  const idx = haystack.lastIndexOf(needle);
  if (idx === -1) return haystack;
  return (
    haystack.slice(0, idx) + replacement + haystack.slice(idx + needle.length)
  );
}

function pickRandom(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    const idx = Math.floor(Math.random() * value.length);
    return value[idx];
  }
  return value ?? "";
}

// NB baseline meaning helper

function nbBaselineMeaning(label) {
  if (label === "wholesome") return "cozy/wholesome baseline";
  if (label === "totally unhinged") return "chaotic baseline";
  return "neutral quirky baseline";
}

function compareCommentary(heuristicLabel, nbLabel) {
  if (!heuristicLabel || !nbLabel) return "";

  if (heuristicLabel === nbLabel) {
    return "Agreement: the baseline ML and heuristic landed in the same vibe bucket.";
  }

  // The whole point of Option C:
  if (nbLabel === "kinda odd" && heuristicLabel !== "kinda odd") {
    return "Mismatch: NB treated this as neutral quirky narration, but the heuristic flagged stronger vibes (likely from specific trigger words or wrong choices).";
  }

  return "Mismatch: NB and the heuristic disagree — this is expected on unseen story text.";
}

// Optional: easy list for random selection later
const STORIES = [
  Story1BakedMittens,
  Story2MagicalCampfire,
  Story3CrunchyVideoGame,
];

const HISTORICAL_RUNS = {
  story1_baked_mittens: runsStory1,
  story2_magical_campfire: runsStory2,
  story3_crunchy_video_game: runsStory3,
};

const NB_HISTORICAL_RUNS = {
  story3_crunchy_video_game: runsStory3WithNB,
};

export default function Game({ initialStory = Story3CrunchyVideoGame }) {
  // 👇 Current active story
  const [story, setStory] = useState(initialStory);

  const speed = story.speed ?? 40;
  const storyScrollRef = useRef(null);

  // ...your existing state
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  // Full story string that the Typewriter reveals
  const [storyText, setStoryText] = useState(story.intro);

  // For displaying choice images in text when buttons are chosen
  //const [choiceImages, setChoiceImages] = useState([]);

  // How many correct choices the user has made so far
  const [score, setScore] = useState(0);

  // Which choice-step we’re on
  const [stepIndex, setStepIndex] = useState(0);

  // When true: buttons are enabled + typewriter pauses
  const [waitingForChoice, setWaitingForChoice] = useState(false);

  const [unhingedResult, setUnhingedResult] = useState(null);
  const [showUnhinged, setShowUnhinged] = useState(false);
  // unhingedResult will become { score, label, breakdown } at the end
  const [nbResult, setNbResult] = useState(null);

  // For restarting Typewriter internal state cleanly
  const [resetSignal, setResetSignal] = useState(0);

  // 👇 NEW: snapshot of heuristic breakdown for the viz
  const [heuristicSnapshot, setHeuristicSnapshot] = useState(null);

  // 👇 NEW: snapshot of NB breakdown for the viz for Story 3 only
  const [NBSnapshot, setNBSnapshot] = useState(null);

  // 👇 which viz to show for Story 3: "heuristic" | "nb"
  const [vizMode, setVizMode] = useState("heuristic");

  const step = story.steps[stepIndex] ?? null;

  // Reset when story changes
  useEffect(() => {
    setStoryText(story.intro);
    setStepIndex(0);
    setWaitingForChoice(false);
    setScore(0);
    setResetSignal((s) => s + 1);
    setUnhingedResult(null);
    setShowUnhinged(false);
    setNbResult(null);
    setHeuristicSnapshot(null); // 👈 NEW
    setNBSnapshot(null); // 👈 NEW
    setVizMode("heuristic"); // 👈 reset toggle
    // setChoiceImages([]);
  }, [story]);

  // Kick off first placeholder after intro finishes typing:
  // We'll do it via onDone.
  const onTypeDone = useCallback(() => {
    // ✅ If story is finished and we already computed a score, reveal it now.
    // When the story is finished, stepIndex will be past the last step, so `step` is null.
    if (!step && unhingedResult) {
      setShowUnhinged(true);
      return;
    }

    if (!step) return;

    if (!storyText.endsWith(PLACEHOLDER)) {
      setStoryText((prev) => prev + (step.before ?? "") + PLACEHOLDER);
      return;
    }

    setWaitingForChoice(true);
  }, [step, storyText, unhingedResult]);

  const handleChoice = useCallback(
    (choiceId) => {
      if (!step) return;

      const choice = step.choices.find((c) => c.id === choiceId);
      const label = choice?.label ?? choiceId;

      function imgToken(id, align) {
        return `\n\n[[IMG:${id}:${align}]]\n\n`;
      }

      const align = stepIndex % 2 === 0 ? "left" : "right";
      const imgInsert = choice?.image ? imgToken(choiceId, align) : "";

      const prefix = step.afterChoicePrefix ?? "";
      const branchInsert = pickRandom(step.branches?.[choiceId]);
      const after = step.after ?? "";

      const wasCorrect = !!step.correct && step.correct === choiceId;
      const newScore = score + (wasCorrect ? 1 : 0);

      const totalSteps = story.steps?.length ?? 0;
      const isLast = stepIndex === totalSteps - 1;
      const stepsSoFar = stepIndex + 1;

      setStoryText((prev) => {
        const replaced = replaceLast(prev, PLACEHOLDER, label);

        // 👉 LAST STEP
        if (isLast) {
          const chosenEnding =
            story.endings?.[newScore] ??
            step.after ??
            story.defaultEnding ??
            "The night settled around me, and I let myself breathe it in.";

          const finalText =
            replaced + prefix + imgInsert + branchInsert + " " + chosenEnding;

          const result = computeUnhingedScore({
            storyText: finalText,
            correctCount: newScore,
            totalSteps,
            modelConfig: story.unhingedModel,
          });

          setHeuristicSnapshot({
            cozyHits: result.breakdown.cozyHits,
            weirdHits: result.breakdown.weirdHits,
            selfAwareHits: result.breakdown.selfAwareHits,
            wrongChoices: result.breakdown.wrongChoices,
            totalSteps,
          });

          if (story.id === "story3_crunchy_video_game") {
            const nb = predictVibe(finalText, nbModel);
            setNbResult(nb);

            // 👉 explainability: top contributing tokens
            const top = topContributingTokens(finalText, nbModel, 8);
            const tokenList = top.map((t) => t.token); // just the words

            setNBSnapshot({
              nbProbWholesome: nb.probs.wholesome,
              nbProbKindaOdd: nb.probs["kinda odd"],
              nbProbTotallyUnhinged: nb.probs["totally unhinged"],
              wrongChoices: result.breakdown.wrongChoices,
              nbTopTokens: tokenList,
            });
          } else {
            setNbResult(null);
            setNBSnapshot(null);
          }

          setShowUnhinged(false);
          setUnhingedResult(result);

          return (
            finalText +
            ` \n\nYou got ${newScore}/${totalSteps} choices correct.`
          );
        }

        // 👉 NON-LAST STEP – partial heuristic + optional partial NB
        const nextText = replaced + prefix + imgInsert + branchInsert + after;

        const partialResult = computeUnhingedScore({
          storyText: nextText,
          correctCount: newScore,
          totalSteps: stepsSoFar,
          modelConfig: story.unhingedModel,
        });

        const wrongChoicesSoFar = stepsSoFar - newScore;

        setHeuristicSnapshot({
          cozyHits: partialResult.breakdown.cozyHits,
          weirdHits: partialResult.breakdown.weirdHits,
          selfAwareHits: partialResult.breakdown.selfAwareHits,
          wrongChoices: wrongChoicesSoFar,
          totalSteps,
        });

        // 👇 NEW: live NB viz for Story 3
        if (story.id === "story3_crunchy_video_game") {
          const nbPartial = predictVibe(nextText, nbModel);
          setNbResult(nbPartial);

          const topPartial = topContributingTokens(nextText, nbModel, 8);
          const tokenListPartial = topPartial.map((t) => t.token);

          setNBSnapshot({
            nbProbWholesome: nbPartial.probs.wholesome,
            nbProbKindaOdd: nbPartial.probs["kinda odd"],
            nbProbTotallyUnhinged: nbPartial.probs["totally unhinged"],
            wrongChoices: wrongChoicesSoFar,
            nbTopTokens: tokenListPartial,
          });
        } else {
          setNBSnapshot(null);
        }

        return nextText;
      });

      setWaitingForChoice(false);
      setStepIndex((i) => i + 1);
      setScore(newScore);
    },
    [step, score, stepIndex, story],
  );

  useEffect(() => {
    const container = storyScrollRef.current;
    if (!container) return;

    // Only auto-scroll while text is actively typing:
    // - not waiting for a choice
    // - score panel not yet shown
    const shouldAutoScroll = !waitingForChoice && !showUnhinged;
    if (!shouldAutoScroll) return;

    const intervalId = setInterval(() => {
      const caret = container.querySelector(".caret");
      if (!caret) return;

      const caretTop = caret.offsetTop;
      const viewportHeight = container.clientHeight;
      const desiredTop = caretTop - viewportHeight * 0.35;
      const currentTop = container.scrollTop;
      const diff = desiredTop - currentTop;

      if (Math.abs(diff) > 4) {
        container.scrollTop = currentTop + diff * 0.2;
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [waitingForChoice, showUnhinged]);

  useEffect(() => {
    if (!showUnhinged) return;

    const container = storyScrollRef.current;
    if (!container) return;

    // When the score panel appears, jump to the bottom once
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [showUnhinged]);

  const restart = useCallback(() => {
    setStoryText(story.intro);
    setStepIndex(0);
    setWaitingForChoice(false);
    setScore(0);
    setResetSignal((s) => s + 1);
    setUnhingedResult(null);
    setShowUnhinged(false);
    setNbResult(null);
    setHeuristicSnapshot(null); // 👈 NEW
    setNBSnapshot(null); // 👈 clear NB viz state too
    setVizMode("heuristic"); // 👈 reset toggle
    //setChoiceImages([]);
  }, [story]);

  // Story selection helpers and close menu when switching stories on mobile
  const selectStory1 = () => {
    setStory(Story1BakedMittens);
    closeMenu();
  };
  const selectStory2 = () => {
    setStory(Story2MagicalCampfire);
    closeMenu();
  };
  const selectStory3 = () => {
    setStory(Story3CrunchyVideoGame);
    closeMenu();
  };
  const selectRandomStory = () => {
    const idx = Math.floor(Math.random() * STORIES.length);
    setStory(STORIES[idx]);
    closeMenu();
  };

  // Buttons should always be visible:
  // If the story is over, we can show the last step’s choices or disable all.
  const buttons = useMemo(() => {
    if (step?.choices?.length) return step.choices;
    // fallback: if finished, show the first step’s choices but disabled
    return story.steps?.[0]?.choices ?? [];
  }, [step, story]);

  const buttonsEnabled = waitingForChoice && !!step;

  return (
    <div className="game_container">
      {/* Top bar */}
      <header className="top_bar">
        <h1 className="title">Cozy Madlib Game</h1>

        <button
          className="btn menu_btn"
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          ☰
        </button>
      </header>

      {/* Drawer overlay */}
      <div
        className={`menu_overlay ${menuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
      />

      {/* Drawer */}
      <aside className={`menu_drawer ${menuOpen ? "is-open" : ""}`}>
        <div className="menu_header">
          <strong>Menu</strong>
          <button
            className="btn menu_close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* 👇 Viz wrapper with toggle (Story 3 only shows button) */}
        <section className="viz_switch_wrapper">
          {story.id === "story3_crunchy_video_game" && (
            <button
              type="button"
              className="viz_switch_btn"
              onClick={() =>
                setVizMode((prev) =>
                  prev === "heuristic" ? "nb" : "heuristic",
                )
              }
            >
              {vizMode === "heuristic"
                ? "Naive Bayes model"
                : "Heuristic model"}
            </button>
          )}

          {story.id === "story3_crunchy_video_game" && vizMode === "nb" ? (
            <NBVizPanel
              snapshot={NBSnapshot}
              typingPaused={waitingForChoice}
              currentStoryId={story.id}
              historicalRuns={NB_HISTORICAL_RUNS[story.id] || []}
              totalSteps={story.steps?.length ?? 0}
            />
          ) : (
            <UnhingedVizPanel
              snapshot={heuristicSnapshot}
              typingPaused={waitingForChoice}
              currentStoryId={story.id}
              historicalRuns={HISTORICAL_RUNS[story.id] || []}
              totalSteps={story.steps?.length ?? 0}
            />
          )}
        </section>

        <div className="menu_section">
          <p className="btn_select_title">Story Select</p>
          <div className="story_select_btns">
            <button className="btn game_btn" onClick={selectStory1}>
              Story 1
            </button>
            <button className="btn game_btn" onClick={selectStory2}>
              Story 2
            </button>
            <button className="btn game_btn" onClick={selectStory3}>
              Story 3 🤖
            </button>
            <button className="btn game_btn" onClick={selectRandomStory}>
              Random story 🎲
            </button>
          </div>
        </div>

        <div className="footer  menu_section__spaced">
          <p>Copyright © 2025 Saachi Sadcha - All Rights Reserved.</p>
          <p>
            All images and content are original and created by Saachi Sadcha. Do
            not copy, download or sell.
          </p>
        </div>
      </aside>

      {/* Middle: the only scrollable area */}
      <main className="story_scroll" ref={storyScrollRef}>
        <h1>{story.title}</h1>
        <div className="story_with_icons">
          <Typewriter
            text={storyText}
            speed={speed}
            paused={waitingForChoice}
            onDone={onTypeDone}
            resetSignal={resetSignal}
            // 👇 inject the circles before the text
            imageMap={story.images}
          />
        </div>
        {/* story score */}
        {showUnhinged && unhingedResult && (
          <div className="score_panel">
            <div>
              <strong>Unhinged Heuristic Score:</strong>{" "}
              <div>
                {unhingedResult.score}
                /10 — {unhingedResult.label}
              </div>
            </div>

            {/* Optional debug info while you’re tuning */}
            <div className="score_panel_breakdown">
              cozyHits: {unhingedResult.breakdown.cozyHits} | weirdHits:{" "}
              {unhingedResult.breakdown.weirdHits} | selfAwareHits:{" "}
              {unhingedResult.breakdown.selfAwareHits} | wrongChoices:{" "}
              {unhingedResult.breakdown.wrongChoices}
            </div>

            {nbResult && (
              <div>
                <strong>ML Naive Bayes Score:</strong>{" "}
                <div>
                  {nbResult.label} (p=
                  {nbResult.probs[nbResult.label].toFixed(2)})
                </div>
                <div className="score_panel_breakdown">
                  NB is a baseline trained on Stories 1–2 (so Story 3 vocabulary
                  may look “neutral”).
                </div>
              </div>
            )}

            {nbResult && unhingedResult && (
              <div style={{ marginTop: 4 }}>
                {nbResult.label === unhingedResult.label
                  ? "Match ✅"
                  : "Mismatch ⚠️"}
              </div>
            )}
            {nbResult && unhingedResult && (
              <div className="score_panel_breakdown score_panel_breakdown--italic">
                {compareCommentary(unhingedResult.label, nbResult.label)}
              </div>
            )}
          </div>
        )}
      </main>
      {/* footer and word choice buttons */}
      <div className="bottom_bar">
        <p className="btn_select_title">Word Select</p>
        <div className="word_select_btns">
          {buttons.map((c) => (
            <button
              key={c.id}
              className="btn game_btn"
              disabled={!buttonsEnabled}
              onClick={() => handleChoice(c.id)}
            >
              {c.label}
            </button>
          ))}
          {/* story restart button */}
          <span className="word_select_or">or</span>
          <button className="btn game_btn" onClick={restart}>
            restart
          </button>
        </div>
        <div className="menu_section_desktop">
          <p className="btn_select_title">Story Select</p>
          <div className="story_select_btns">
            <button className="btn game_btn" onClick={selectStory1}>
              Story 1
            </button>
            <button className="btn game_btn" onClick={selectStory2}>
              Story 2
            </button>
            <button className="btn game_btn" onClick={selectStory3}>
              Story 3 🤖
            </button>
            <button className="btn game_btn" onClick={selectRandomStory}>
              Random story 🎲
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
