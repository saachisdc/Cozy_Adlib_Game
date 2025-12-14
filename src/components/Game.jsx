// Game.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Typewriter from "./Typewriter";
import Story1BakedMittens from "./Story1BakedMittens";

const PLACEHOLDER = "...choose an icon...";

function replaceLast(haystack, needle, replacement) {
  const idx = haystack.lastIndexOf(needle);
  if (idx === -1) return haystack;
  return (
    haystack.slice(0, idx) + replacement + haystack.slice(idx + needle.length)
  );
}

export default function Game({ story = Story1BakedMittens }) {
  const speed = story.speed ?? 40;

  // Full story string that the Typewriter reveals
  const [storyText, setStoryText] = useState(story.intro);

  // How many correct choices the user has made so far
  const [score, setScore] = useState(0);

  // Which choice-step we’re on
  const [stepIndex, setStepIndex] = useState(0);

  // When true: buttons are enabled + typewriter pauses
  const [waitingForChoice, setWaitingForChoice] = useState(false);

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
  }, [story]);

  // Kick off first placeholder after intro finishes typing:
  // We'll do it via onDone.
  const onTypeDone = useCallback(() => {
    if (!step) return;

    // Phase A: we just finished typing up to the current end of storyText.
    // If we haven't appended the placeholder for this step yet, append it now
    // (and DO NOT enable buttons yet).
    if (!storyText.endsWith(PLACEHOLDER)) {
      setStoryText((prev) => prev + (step.before ?? "") + PLACEHOLDER);
      return;
    }

    // Phase B: storyText ends with PLACEHOLDER, which means the placeholder
    // has now been fully typed to the screen. NOW we pause + enable buttons.
    setWaitingForChoice(true);
  }, [step, storyText]);

  const handleChoice = useCallback(
    (choiceId) => {
      if (!step) return;

      const choice = step.choices.find((c) => c.id === choiceId);
      const label = choice?.label ?? choiceId;

      const prefix = step.afterChoicePrefix ?? "";
      const branchInsert = step.branches?.[choiceId] ?? "";
      const after = step.after ?? "";

      // Determine correctness for this step
      const wasCorrect = !!step.correct && step.correct === choiceId;
      const newScore = score + (wasCorrect ? 1 : 0);

      // 1) Replace the last placeholder with the chosen label
      // 2) Append the branch text and the after-text
      setStoryText((prev) => {
        const replaced = replaceLast(prev, PLACEHOLDER, label);

        // If this was the final step, append the score to the last line.
        const isLast = stepIndex === (story.steps?.length ?? 0) - 1;
        if (isLast) {
          return (
            replaced +
            prefix +
            branchInsert +
            after +
            ` You got ${newScore}/${story.steps.length} choices correct.`
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
