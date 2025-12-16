import Story1BakedMittens from "./Story1BakedMittens";
import { computeUnhingedScore } from "./UnhingedScore";

export function runUnhingedScoreTest() {
  // Example 1: wholesome-ish text
  const wholesomeText =
    "rewarded with a sound that drew several concerned glances" +
    "with immediate regret as my teeth met something that should not be bitten." +
    "and let the sweet glaze mingle with the bitter caffeine already coating my stomach. ";

  const r1 = computeUnhingedScore({
    storyText: wholesomeText,
    correctCount: 3,
    totalSteps: 3,
    modelConfig: Story1BakedMittens.unhingedModel,
  });

  console.log("TEST 1 (wholesome):", r1);

  // Example 2: unhinged-ish text
  const unhingedText =
    "The damp wool pressed its scent into my fingers, soft and uncomfortably close " +
    "My defrosting fingers smelled lightly of yeast and glaze, but that made me right at home in this little shop." +
    "trying not to think too hard about the fibers. ";

  const r2 = computeUnhingedScore({
    storyText: unhingedText,
    correctCount: 0,
    totalSteps: 3,
    modelConfig: Story1BakedMittens.unhingedModel,
  });

  console.log("TEST 2 (unhinged):", r2);
}
