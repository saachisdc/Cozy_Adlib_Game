// scripts/train_nb.js
import fs from "fs";
import path from "path";

const LABELS = ["wholesome", "kinda odd", "totally unhinged"];
const ALPHA = 1;

// --- CSV parser that supports commas/newlines inside quoted fields ---
// Your csvEscape() writer is compatible with this.
function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];

    if (inQuotes) {
      if (c === '"') {
        const next = csvText[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignore
    } else {
      field += c;
    }
  }

  // last field
  row.push(field);
  rows.push(row);

  return rows;
}

function rowsToObjects(rows) {
  const header = rows[0];
  const objs = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 1 && r[0] === "") continue;
    const o = {};
    for (let j = 0; j < header.length; j++) {
      o[header[j]] = r[j] ?? "";
    }
    objs.push(o);
  }
  return objs;
}

// Minimal tokenizer (match the one you’ll use at runtime)
// Keep it here to avoid importing from src in Node scripts.
const AMERICAN_TO_CANADIAN = {
  color: "colour",
  favorite: "favourite",
  center: "centre",
  neighbor: "neighbour",
  neighbors: "neighbours",
  meter: "metre",
};

function tokenize(text) {
  const lower = String(text ?? "").toLowerCase();
  const cleaned = lower.replace(/[^a-z0-9']/g, " ");
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => t.length >= 2)
    .map((t) => AMERICAN_TO_CANADIAN[t] ?? t);
}

function train(rows) {
  const model = {
    version: 1,
    labels: LABELS,
    alpha: ALPHA,
    docCount: Object.fromEntries(LABELS.map((l) => [l, 0])),
    tokenCount: Object.fromEntries(LABELS.map((l) => [l, 0])),
    tokenFreq: Object.fromEntries(LABELS.map((l) => [l, {}])),
    vocab: {}, // temporary set
    vocabSize: 0,
  };

  for (const r of rows) {
    const label = r.label;
    if (!LABELS.includes(label)) continue;

    const text = r.generatedText ?? "";
    const tokens = tokenize(text);

    model.docCount[label]++;

    const tf = model.tokenFreq[label];
    for (const tok of tokens) {
      tf[tok] = (tf[tok] ?? 0) + 1;
      model.tokenCount[label]++;
      model.vocab[tok] = 1;
    }
  }

  model.vocabSize = Object.keys(model.vocab).length;

  // Optional: shrink output by removing vocab set and keeping vocabSize only
  // (Keep vocab if you later want explanations/top tokens.)
  // For now, keep vocabSize and drop vocab to keep file small:
  delete model.vocab;

  return model;
}

function main() {
  const in1 = process.argv[2] ?? "simulated_runs/runs_story1_baked_mittens.csv"; // e.g. simulated_runs/runs_story1_baked_mittens.csv
  const in2 =
    process.argv[3] ?? "simulated_runs/runs_story2_magical_campfire.csv"; // e.g. simulated_runs/runs_story2_magical_campfire.csv
  const out = process.argv[4] ?? "src/models/nb_model.json";

  if (!in1 || !in2) {
    console.error(
      "Usage: node scripts/train_nb.js <story1.csv> <story2.csv> [out.json]"
    );
    process.exit(1);
  }

  const csv1 = fs.readFileSync(in1, "utf8");
  const csv2 = fs.readFileSync(in2, "utf8");

  const rows1 = rowsToObjects(parseCSV(csv1));
  const rows2 = rowsToObjects(parseCSV(csv2));

  const combined = [...rows1, ...rows2];
  const model = train(combined);

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(model, null, 2), "utf8");

  console.log(`Trained on ${combined.length} rows`);
  console.log(`docCount:`, model.docCount);
  console.log(`vocabSize:`, model.vocabSize);
  console.log(`Wrote model -> ${out}`);
}

main();
