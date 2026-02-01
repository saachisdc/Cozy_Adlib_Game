// scripts/csv_to_runs_json.js
import fs from "fs";
import path from "path";

const DIR = "./simulated_runs";

const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".csv") && !f.includes("_with_nb"));

for (const file of files) {
  const csvPath = path.join(DIR, file);
  const outPath = csvPath.replace(".csv", ".json");

  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");

  const idx = (name) => headers.indexOf(name);

  const rows = lines.slice(1).map((line) => {
    const cols = line.split(",");

    return {
      cozyHits: Number(cols[idx("cozyHits")]),
      weirdHits: Number(cols[idx("weirdHits")]),
      selfAwareHits: Number(cols[idx("selfAwareHits")]),
      wrongChoices: Number(cols[idx("wrongChoices")]),
      label: cols[idx("label")],
    };
  });

  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`✓ ${file} → ${rows.length} runs`);
}
