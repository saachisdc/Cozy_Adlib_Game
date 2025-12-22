// src/ml/nb.js

const DEFAULT_LABELS = ["wholesome", "kinda odd", "totally unhinged"];

// Optional tiny spelling normalization (keep it tiny)
// You can expand this later, or delete it if you decide you don't care.
const AMERICAN_TO_CANADIAN = {
  color: "colour",
  favorite: "favourite",
  center: "centre",
  neighbor: "neighbour",
  neighbors: "neighbours",
  meter: "metre",
};

function normalizeSpellingToken(token) {
  return AMERICAN_TO_CANADIAN[token] ?? token;
}

export function tokenize(text) {
  const lower = String(text ?? "").toLowerCase();

  // Keep letters/numbers/apostrophes, turn everything else into spaces.
  const cleaned = lower.replace(/[^a-z0-9']/g, " ");

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);

  // Tiny filters: drop 1-char tokens, normalize spelling variants
  return rawTokens.filter((t) => t.length >= 2).map(normalizeSpellingToken);
}

function softmaxFromLogScores(logScoresByLabel) {
  const labels = Object.keys(logScoresByLabel);
  let max = -Infinity;
  for (const l of labels) max = Math.max(max, logScoresByLabel[l]);

  let sum = 0;
  const exps = {};
  for (const l of labels) {
    const v = Math.exp(logScoresByLabel[l] - max);
    exps[l] = v;
    sum += v;
  }

  const probs = {};
  for (const l of labels) probs[l] = exps[l] / (sum || 1);
  return probs;
}

export function predictVibe(text, model) {
  const labels = model.labels ?? DEFAULT_LABELS;
  const alpha = model.alpha ?? 1;

  const vocabSize = model.vocabSize ?? Object.keys(model.vocab ?? {}).length;
  const totalDocs =
    labels.reduce((acc, l) => acc + (model.docCount?.[l] ?? 0), 0) || 1;

  const tokens = tokenize(text);

  const logScores = {};

  for (const label of labels) {
    const docC = model.docCount?.[label] ?? 0;
    const tokenC = model.tokenCount?.[label] ?? 0;

    // Prior with tiny smoothing to avoid log(0)
    const prior = (docC + 1) / (totalDocs + labels.length);
    let score = Math.log(prior);

    const denom = tokenC + alpha * vocabSize;

    const tf = model.tokenFreq?.[label] ?? {};

    for (const tok of tokens) {
      const countInClass = tf[tok] ?? 0;
      const probTok = (countInClass + alpha) / (denom || 1);
      score += Math.log(probTok);
    }

    logScores[label] = score;
  }

  // Pick best label
  let bestLabel = labels[0];
  for (const l of labels) {
    if (logScores[l] > logScores[bestLabel]) bestLabel = l;
  }

  const probs = softmaxFromLogScores(logScores);

  return {
    label: bestLabel,
    probs,
  };
}
// --- Optional: explain "why" with top contributing tokens ---
export function topContributingTokens(text, model, topK = 8) {
  const labels = model.labels ?? DEFAULT_LABELS;
  const alpha = model.alpha ?? 1;
  const vocabSize = model.vocabSize ?? Object.keys(model.vocab ?? {}).length;

  const tokens = tokenize(text);

  // Compute log-scores to find best and runner-up
  const totalDocs =
    labels.reduce((acc, l) => acc + (model.docCount?.[l] ?? 0), 0) || 1;

  const logScores = {};
  for (const label of labels) {
    const docC = model.docCount?.[label] ?? 0;
    const tokenC = model.tokenCount?.[label] ?? 0;

    const prior = (docC + 1) / (totalDocs + labels.length);
    let score = Math.log(prior);

    const denom = tokenC + alpha * vocabSize;
    const tf = model.tokenFreq?.[label] ?? {};

    for (const tok of tokens) {
      const c = tf[tok] ?? 0;
      score += Math.log((c + alpha) / (denom || 1));
    }
    logScores[label] = score;
  }

  const sorted = [...labels].sort((a, b) => logScores[b] - logScores[a]);
  const best = sorted[0];
  const runnerUp = sorted[1] ?? sorted[0];

  const tokenCBest = model.tokenCount?.[best] ?? 0;
  const tokenCRunner = model.tokenCount?.[runnerUp] ?? 0;

  const denomBest = tokenCBest + alpha * vocabSize;
  const denomRunner = tokenCRunner + alpha * vocabSize;

  const tfBest = model.tokenFreq?.[best] ?? {};
  const tfRunner = model.tokenFreq?.[runnerUp] ?? {};

  // Contribution = log P(tok|best) - log P(tok|runnerUp)
  const contribs = new Map();

  for (const tok of tokens) {
    const pBest = ((tfBest[tok] ?? 0) + alpha) / (denomBest || 1);
    const pRunner = ((tfRunner[tok] ?? 0) + alpha) / (denomRunner || 1);
    const diff = Math.log(pBest) - Math.log(pRunner);
    contribs.set(tok, (contribs.get(tok) ?? 0) + diff);
  }

  return [...contribs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([token, contrib]) => ({
      token,
      contrib: Number(contrib.toFixed(3)),
    }));
}
