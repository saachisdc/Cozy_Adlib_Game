// src/unhingedScore.js

function countHits(text, words) {
  const lower = (text || "").toLowerCase();
  let hits = 0;

  for (const w of words) {
    if (!w) continue;
    if (lower.includes(String(w).toLowerCase())) hits += 1;
  }

  return hits;
}
// NEW: return the actual matched words
function hitWords(text, words) {
  const lower = (text || "").toLowerCase();
  const result = [];

  for (const w of words) {
    if (!w) continue;
    const needle = String(w).toLowerCase();
    if (lower.includes(needle)) {
      result.push(w); // keep original casing from the list
    }
  }

  return result;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * computeUnhingedScore
 *
 * Inputs:
 * - storyText: the final generated story text (or just the branch inserts)
 * - correctCount: how many correct choices the user made (0..totalSteps)
 * - totalSteps: number of choice steps (3 in your story)
 * - modelConfig: story.unhingedModel from the story file
 *
 * Output:
 * - { score: 0..10, label: string, breakdown: {...} }
 *
 * What this does (super plain):
 * Looks for your “signal words” inside storyText
 * Counts how many of those signals are present
 * Adds/subtracts using weights
 * Clamps to 0–10
 * Gives you a label + breakdown so you can debug
 */
export function computeUnhingedScore({
  storyText,
  correctCount,
  totalSteps,
  modelConfig,
}) {
  const cfg = modelConfig ?? {};
  const weirdWords = cfg.weirdWords ?? [];
  const cozyWords = cfg.cozyWords ?? [];
  const selfAwareWords = cfg.selfAwareWords ?? [];
  const w = cfg.weights ?? {};

  const wrongChoices = Math.max(0, (totalSteps ?? 0) - (correctCount ?? 0));

  // NEW: compute both lists and counts
  const weirdHitWords = hitWords(storyText, weirdWords);
  const cozyHitWords = hitWords(storyText, cozyWords);
  const selfAwareHitWords = hitWords(storyText, selfAwareWords);

  const weirdHits = weirdHitWords.length;
  const cozyHits = cozyHitWords.length;
  const selfAwareHits = selfAwareHitWords.length;

  const raw =
    (w.wrongChoice ?? 2) * wrongChoices +
    (w.weirdHit ?? 2) * weirdHits +
    (w.selfAwareHit ?? 1) * selfAwareHits +
    (w.cozyHit ?? -1) * cozyHits;

  const score = clamp(raw, cfg.clampMin ?? 0, cfg.clampMax ?? 10);

  let label = "wholesome";
  if (score >= 7) label = "totally unhinged";
  else if (score >= 4) label = "kinda odd";

  return {
    score,
    label,
    breakdown: {
      wrongChoices,
      weirdHits,
      cozyHits,
      selfAwareHits,
      raw,
      // NEW: expose the lists so the viz can show them
      weirdHitWords,
      cozyHitWords,
      selfAwareHitWords,
    },
  };
}
