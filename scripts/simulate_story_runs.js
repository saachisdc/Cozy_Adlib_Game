import fs from "fs";
import Story1BakedMittens from "../src/components/Story1BakedMittens.js";
import Story2MagicalCampfire from "../src/components/Story2MagicalCampfire.js";
import Story3CrunchyVideoGame from "../src/components/Story3CrunchyVideoGame.js";

import { computeUnhingedScore } from "../src/components/UnhingedScore.js";

const N = Number(process.argv[2] ?? 50);
const OUT = process.argv[3] ?? `runs_${Story2MagicalCampfire.id}.csv`;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function hitWords(text, words = []) {
  const lower = (text || "").toLowerCase();
  return words.filter((w) => w && lower.includes(String(w).toLowerCase()));
}

function simulateOne(story) {
  let text = story.intro ?? "";
  let correct = 0;
  const total = story.steps.length;

  for (let i = 0; i < total; i++) {
    const step = story.steps[i];

    const choice = pick(step.choices);
    const choiceId = choice.id;
    const label = choice.label ?? choiceId;

    if (step.correct === choiceId) correct += 1;

    const prefix = step.afterChoicePrefix ?? "";
    const branchArr = step.branches?.[choiceId] ?? [""];
    const branch = pick(branchArr);
    const after = step.after ?? "";

    const isLast = i === total - 1;
    if (isLast) {
      const ending =
        story.endings?.[correct] ??
        story.endings?.[String(correct)] ??
        after ??
        story.defaultEnding ??
        "";
      text += `${label}${prefix}${branch} ${ending}`;
    } else {
      text += `${label}${prefix}${branch}${after}`;
    }
  }

  const result = computeUnhingedScore({
    storyText: text,
    correctCount: correct,
    totalSteps: total,
    modelConfig: story.unhingedModel,
  });

  const cfg = story.unhingedModel ?? {};
  const weirdHitWords = hitWords(text, cfg.weirdWords);
  const selfAwareHitWords = hitWords(text, cfg.selfAwareWords);
  const cozyHitWords = hitWords(text, cfg.cozyWords);

  return {
    storyId: story.id,
    generatedText: text,
    wrongChoices: result.breakdown.wrongChoices,
    weirdHitWords: weirdHitWords.join("; "),
    selfAwareHitWords: selfAwareHitWords.join("; "),
    cozyHitWords: cozyHitWords.join("; "),
    weirdHits: result.breakdown.weirdHits,
    selfAwareHits: result.breakdown.selfAwareHits,
    cozyHits: result.breakdown.cozyHits,
    rawScore: result.breakdown.raw,
    clampedScore: result.score,
    label: result.label,
  };
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const headers = [
  "storyId",
  "generatedText",
  "wrongChoices",
  "weirdHitWords",
  "selfAwareHitWords",
  "cozyHitWords",
  "weirdHits",
  "selfAwareHits",
  "cozyHits",
  "rawScore",
  "clampedScore",
  "label",
];

const rows = Array.from({ length: N }, () =>
  simulateOne(Story2MagicalCampfire)
);
const csv =
  headers.join(",") +
  "\n" +
  rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")).join("\n");

fs.writeFileSync(OUT, csv, "utf8");
console.log(`Wrote ${N} runs -> ${OUT}`);
