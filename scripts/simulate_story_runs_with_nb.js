// scripts/simulate_story_runs_with_nb.js
import fs from "fs";

import Story1BakedMittens from "../src/components/Story1BakedMittens.js";
import Story2MagicalCampfire from "../src/components/Story2MagicalCampfire.js";
import Story3CrunchyVideoGame from "../src/components/Story3CrunchyVideoGame.js";

import { computeUnhingedScore } from "../src/components/UnhingedScore.js";

import nbModel from "../src/models/nb_model.json" assert { type: "json" };
import { predictVibe, topContributingTokens } from "../src/ml/nb.js";

const STORY_MAP = {
  story1: Story1BakedMittens,
  story2: Story2MagicalCampfire,
  story3: Story3CrunchyVideoGame,
};

const N = Number(process.argv[2] ?? 100);
const storyKey = (process.argv[3] ?? "story3").toLowerCase();
const OUT =
  process.argv[4] ??
  `simulated_runs/runs_${STORY_MAP[storyKey]?.id ?? "unknown"}_with_nb.csv`;

console.log("START simulate_story_runs_with_nb", {
  N,
  storyKey,
  OUT,
});

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

  // Heuristic score
  const heuristic = computeUnhingedScore({
    storyText: text,
    correctCount: correct,
    totalSteps: total,
    modelConfig: story.unhingedModel,
  });

  const cfg = story.unhingedModel ?? {};
  const weirdHitWords = hitWords(text, cfg.weirdWords);
  const selfAwareHitWords = hitWords(text, cfg.selfAwareWords);
  const cozyHitWords = hitWords(text, cfg.cozyWords);

  // NB prediction
  const nb = predictVibe(text, nbModel);
  const nbLabel = nb.label;
  const nbP = nb.probs?.[nbLabel] ?? 0;

  // Optional: explanation tokens
  const topTokens = topContributingTokens
    ? topContributingTokens(text, nbModel, 8)
    : [];

  return {
    storyId: story.id,
    generatedText: text,

    wrongChoices: heuristic.breakdown.wrongChoices,
    weirdHitWords: weirdHitWords.join("; "),
    selfAwareHitWords: selfAwareHitWords.join("; "),
    cozyHitWords: cozyHitWords.join("; "),
    weirdHits: heuristic.breakdown.weirdHits,
    selfAwareHits: heuristic.breakdown.selfAwareHits,
    cozyHits: heuristic.breakdown.cozyHits,
    rawScore: heuristic.breakdown.raw,
    clampedScore: heuristic.score,
    label: heuristic.label,

    // NB extras
    nbLabel,
    nbP: Number(nbP.toFixed(4)),
    nbProbWholesome: Number((nb.probs?.["wholesome"] ?? 0).toFixed(4)),
    nbProbKindaOdd: Number((nb.probs?.["kinda odd"] ?? 0).toFixed(4)),
    nbProbTotallyUnhinged: Number(
      (nb.probs?.["totally unhinged"] ?? 0).toFixed(4)
    ),
    nbTopTokens: topTokens.map((t) => t.token).join("; "),
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
  "nbLabel",
  "nbP",
  "nbProbWholesome",
  "nbProbKindaOdd",
  "nbProbTotallyUnhinged",
  "nbTopTokens",
];

const story = STORY_MAP[storyKey];
if (!story) {
  console.error(`Unknown story key "${storyKey}". Use story1|story2|story3.`);
  process.exit(1);
}

fs.mkdirSync("simulated_runs", { recursive: true });

const rows = Array.from({ length: N }, () => simulateOne(story));
const csv =
  headers.join(",") +
  "\n" +
  rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")).join("\n");

fs.writeFileSync(OUT, csv, "utf8");
console.log(`Wrote ${N} runs -> ${OUT}`);
