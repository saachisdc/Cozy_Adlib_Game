// Game.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Typewriter from "./Typewriter";

import Story1BakedMittens from "./Story1BakedMittens";
import Story2MagicalCampfire from "./Story2MagicalCampfire";
import Story3CrunchyVideoGame from "./Story3CrunchyVideoGame";

import { computeUnhingedScore } from "./UnhingedScore";

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

export default function Game({ story = Story3CrunchyVideoGame }) {
  const speed = story.speed ?? 40;

  // Full story string that the Typewriter reveals
  const [storyText, setStoryText] = useState(story.intro);

  // How many correct choices the user has made so far
  const [score, setScore] = useState(0);

  // Which choice-step we’re on
  const [stepIndex, setStepIndex] = useState(0);

  // When true: buttons are enabled + typewriter pauses
  const [waitingForChoice, setWaitingForChoice] = useState(false);

  const [unhingedResult, setUnhingedResult] = useState(null);
  const [showUnhinged, setShowUnhinged] = useState(false);
  // unhingedResult will become { score, label, breakdown } at the end

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

  const restart = useCallback(() => {
    setStoryText(story.intro);
    setStepIndex(0);
    setWaitingForChoice(false);
    setScore(0);
    setResetSignal((s) => s + 1);
    setUnhingedResult(null);
    setShowUnhinged(false);
  }, [story]);

  // Buttons should always be visible:
  // If the story is over, we can show the last step’s choices or disable all.
  const buttons = useMemo(() => {
    if (step?.choices?.length) return step.choices;
    // fallback: if finished, show the first step’s choices but disabled
    return story.steps?.[0]?.choices ?? [];
  }, [step, story]);

  const buttonsEnabled = waitingForChoice && !!step;

  return (
    <div className="container">
      <h1>{story.title}</h1>

      <Typewriter
        className="story"
        text={storyText}
        speed={speed}
        paused={waitingForChoice}
        onDone={onTypeDone}
        resetSignal={resetSignal}
      />

      {showUnhinged && unhingedResult && (
        <div className="score_panel">
          <div>
            <strong>Unhinged score:</strong> {unhingedResult.score}/10 —{" "}
            {unhingedResult.label}
          </div>

          {/* Optional debug info while you’re tuning */}
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            wrongChoices: {unhingedResult.breakdown.wrongChoices} | weirdHits:{" "}
            {unhingedResult.breakdown.weirdHits} | cozyHits:{" "}
            {unhingedResult.breakdown.cozyHits} | selfAwareHits:{" "}
            {unhingedResult.breakdown.selfAwareHits}
          </div>
        </div>
      )}

      <div className="game_btn">
        {buttons.map((c) => (
          <button
            key={c.id}
            className="btn"
            disabled={!buttonsEnabled}
            onClick={() => handleChoice(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={restart}>
          restart
        </button>
      </div>
    </div>
  );
}
