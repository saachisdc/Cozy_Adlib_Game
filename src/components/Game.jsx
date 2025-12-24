// Game.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import Typewriter from "./Typewriter";

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

  // Full story string that the Typewriter reveals
  const [storyText, setStoryText] = useState(story.intro);

  // For displaying choice images in text when buttons are chosen
  const [choiceImages, setChoiceImages] = useState([]);

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
    setChoiceImages([]);
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

      // 🔹 Add image instance if this choice has an image
      if (choice?.image) {
        setChoiceImages((prev) => {
          const index = prev.length;
          const align = index % 2 === 0 ? "left" : "right"; // alternate
          return [
            ...prev,
            {
              src: choice.image.src,
              alt: choice.image.alt,
              align,
            },
          ];
        });
      }

      const prefix = step.afterChoicePrefix ?? "";
      const branchInsert = pickRandom(step.branches?.[choiceId]);
      const after = step.after ?? "";

      // Determine correctness for this step
      const wasCorrect = !!step.correct && step.correct === choiceId;
      const newScore = score + (wasCorrect ? 1 : 0);

      // 1) Replace the last placeholder with the chosen label
      // 2) Append the branch text and the after-text (or per-story ending)
      const isLast = stepIndex === (story.steps?.length ?? 0) - 1;
      const total = story.steps?.length ?? 0;

      setStoryText((prev) => {
        const replaced = replaceLast(prev, PLACEHOLDER, label);

        if (isLast) {
          const chosenEnding =
            story.endings?.[newScore] ??
            step.after ??
            story.defaultEnding ??
            "The night settled around me, and I let myself breathe it in.";

          const finalText =
            replaced + prefix + branchInsert + " " + chosenEnding;

          // ✅ compute score ONLY here (last step only)
          const result = computeUnhingedScore({
            storyText: finalText,
            correctCount: newScore,
            totalSteps: total,
            modelConfig: story.unhingedModel,
          });
          setShowUnhinged(false);
          setUnhingedResult(result);

          // for Story 3 only: run NB vibe predictor
          const nb =
            story.id === "story3_crunchy_video_game"
              ? predictVibe(finalText, nbModel)
              : null;

          setNbResult(nb);

          return (
            finalText + ` \n\nYou got ${newScore}/${total} choices correct.`
          );
        }

        return replaced + prefix + branchInsert + after;
      });

      // Resume typing + advance to next step.
      setWaitingForChoice(false);
      setStepIndex((i) => i + 1);
      setScore(newScore);
    },
    [step, score, stepIndex, story]
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
    setChoiceImages([]);
  }, [story]);

  // Story selection helpers
  const selectStory1 = () => setStory(Story1BakedMittens);
  const selectStory2 = () => setStory(Story2MagicalCampfire);
  const selectStory3 = () => setStory(Story3CrunchyVideoGame);
  const selectRandomStory = () => {
    const idx = Math.floor(Math.random() * STORIES.length);
    setStory(STORIES[idx]);
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
      {/* Top bar / app title */}
      <h1 className="title">Cozy Madlib Game</h1>

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
            prefix={choiceImages.map((img, idx) => (
              <span
                key={idx}
                className={`choice-circle choice-circle--${img.align}`}
              >
                <img src={img.src} alt={img.alt} />
              </span>
            ))}
          />
        </div>
        {/* story score */}
        {showUnhinged && unhingedResult && (
          <div className="score_panel">
            <div>
              <strong>Unhinged Heuristic Score:</strong> {unhingedResult.score}
              /10 — {unhingedResult.label}
            </div>

            {/* Optional debug info while you’re tuning */}
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
              wrongChoices: {unhingedResult.breakdown.wrongChoices} | weirdHits:{" "}
              {unhingedResult.breakdown.weirdHits} | cozyHits:{" "}
              {unhingedResult.breakdown.cozyHits} | selfAwareHits:{" "}
              {unhingedResult.breakdown.selfAwareHits}
            </div>
            {nbResult && (
              <div style={{ marginTop: 8 }}>
                <div>
                  <strong>ML Naive Bayes Score:</strong> {nbResult.label} (p=
                  {nbResult.probs[nbResult.label].toFixed(2)})
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
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
              <div style={{ marginTop: 8, fontStyle: "italic", opacity: 0.9 }}>
                {compareCommentary(unhingedResult.label, nbResult.label)}
              </div>
            )}
          </div>
        )}
      </main>
      {/* footer and story select buttons */}
      <div className="bottom_bar section">
        <hr className="footer__hr" />
        {/* story choice buttons */}
        <div>
          <p> Word Select </p>
        </div>
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

        <div>
          <p> Story Select </p>
        </div>
        <div className="story_select_btns">
          <button className="btn game_btn " onClick={selectStory1}>
            Story 1
          </button>
          <button className="btn game_btn  " onClick={selectStory2}>
            Story 2
          </button>
          <button className="btn game_btn " onClick={selectStory3}>
            Story 3 🤖
          </button>
          <button className="btn game_btn " onClick={selectRandomStory}>
            Random story 🎲
          </button>
        </div>
        <section className="footer section">
          <hr className="footer__hr" />

          <p>Copyright © 2025 Saachi Sadcha - All Rights Reserved.</p>
          <p>
            All images, 3D models, and content are original and created by
            Saachi Sadcha. Do not copy, download or sell.
          </p>
        </section>
      </div>
    </div>
  );
}
