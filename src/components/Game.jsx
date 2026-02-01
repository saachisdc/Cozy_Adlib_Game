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

import Story1BakedMittens from "./Story1BakedMittens";
import Story2MagicalCampfire from "./Story2MagicalCampfire";
import Story3CrunchyVideoGame from "./Story3CrunchyVideoGame";

import { computeUnhingedScore } from "./UnhingedScore";
import nbModel from "../models/nb_model.json";
import { predictVibe } from "../ml/nb";

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

      // Decide where the image should go for THIS choice
      // (alternate left/right by step index — simple + stable)
      const align = stepIndex % 2 === 0 ? "left" : "right";

      // Only insert an image token if this choice has an image
      const imgInsert = choice?.image ? imgToken(choiceId, align) : "";

      const prefix = step.afterChoicePrefix ?? "";
      const branchInsert = pickRandom(step.branches?.[choiceId]);
      const after = step.after ?? "";

      const wasCorrect = !!step.correct && step.correct === choiceId;
      const newScore = score + (wasCorrect ? 1 : 0);

      const totalSteps = story.steps?.length ?? 0;
      const isLast = stepIndex === totalSteps - 1;
      const stepsSoFar = stepIndex + 1; // after this click

      setStoryText((prev) => {
        const replaced = replaceLast(prev, PLACEHOLDER, label);

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
            totalSteps, // full story used for final score
            modelConfig: story.unhingedModel,
          });

          // 👇 NEW: At the end, stepsSoFar === totalSteps, so this matches breakdown.wrongChoices
          const wrongChoicesSoFar = totalSteps - newScore;

          // 👇 NEW: store breakdown for the viz
          setHeuristicSnapshot({
            cozyHits: result.breakdown.cozyHits,
            weirdHits: result.breakdown.weirdHits,
            selfAwareHits: result.breakdown.selfAwareHits,
            wrongChoices: result.breakdown.wrongChoices,
            totalSteps, // full denominator for display
          });

          setShowUnhinged(false);
          setUnhingedResult(result);

          const nb =
            story.id === "story3_crunchy_video_game"
              ? predictVibe(finalText, nbModel)
              : null;

          setNbResult(nb);

          return (
            finalText +
            ` \n\nYou got ${newScore}/${totalSteps} choices correct.`
          );
        }

        // 👇 NON-LAST branch: partial score
        const nextText = replaced + prefix + imgInsert + branchInsert + after;

        // Score based only on steps we've actually taken so far
        const partialResult = computeUnhingedScore({
          storyText: nextText,
          correctCount: newScore,
          totalSteps: stepsSoFar, // 👈 only the answered steps
          modelConfig: story.unhingedModel,
        });
        const wrongChoicesSoFar = stepsSoFar - newScore;

        setHeuristicSnapshot({
          cozyHits: partialResult.breakdown.cozyHits,
          weirdHits: partialResult.breakdown.weirdHits,
          selfAwareHits: partialResult.breakdown.selfAwareHits,
          wrongChoices: wrongChoicesSoFar, // 👈 this is what you show
          totalSteps, // 👈 still show /3 for Story 1
        });

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

        {/* 👇 NEW: desktop-only heuristic viz placeholder */}
        <UnhingedVizPanel
          snapshot={heuristicSnapshot}
          typingPaused={waitingForChoice}
        />

        <div className="menu_section">
          <p>Story Select</p>
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
              wrongChoices: {unhingedResult.breakdown.wrongChoices} | weirdHits:{" "}
              {unhingedResult.breakdown.weirdHits} | cozyHits:{" "}
              {unhingedResult.breakdown.cozyHits} | selfAwareHits:{" "}
              {unhingedResult.breakdown.selfAwareHits}
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
        <p>Word Select</p>
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
          <button className="btn game_btn" onClick={restart}>
            restart
          </button>
        </div>
      </div>
    </div>
  );
}
