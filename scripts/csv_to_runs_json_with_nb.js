// scripts/csv_to_runs_json_with_nb.js
import fs from "fs";
import path from "path";
import Papa from "papaparse";

const DIR = "src/simulated_runs";

const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".csv") && f.includes("_with_nb"));

for (const file of files) {
  const csvPath = path.join(DIR, file);
  const outPath = csvPath.replace(".csv", ".json");

  const raw = fs.readFileSync(csvPath, "utf8");

  // PapaParse will respect quotes, so commas inside generatedText are fine
  const parsed = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    console.error(`⚠️ Errors while parsing ${file}`, parsed.errors[0]);
  }

  const rows = parsed.data.map((row) => {
    // Headers should match these exactly; adjust here if needed.
    return {
      nbProbWholesome: Number(row.nbProbWholesome ?? 0),
      nbProbKindaOdd: Number(row.nbProbKindaOdd ?? 0),
      nbProbTotallyUnhinged: Number(row.nbProbTotallyUnhinged ?? 0),
      wrongChoices: Number(row.wrongChoices ?? 0),
      nbLabel: row.nbLabel,
    };
  });

  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`✓ ${file} → ${rows.length} runs → ${outPath}`);
}
