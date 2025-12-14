// Story1BakedMittens.jsx
export const Story1BakedMittens = {
  id: "story1_baked_mittens",
  title: "Baked Mittens",
  speed: 40,

  intro:
    "White flakes swirled around in the landscape behind me, accumulating in the corners of the bakery window, as I ordered a hot ",

  // Each step:
  // - before: text typed BEFORE the choice is inserted
  // - choices: array of buttons
  // - afterChoicePrefix: optional glue text after the chosen label
  // - branches: what extra text appears depending on choice
  // - after: text typed AFTER the branch insert (until the next step)
  steps: [
    {
      id: "coffee",
      // correct choice for step 0
      correct: "coffee",
      before: "",

      choices: [
        { id: "coffee", label: "cup of coffee" },
        { id: "mittens", label: "mittens" },
        { id: "donut", label: "donut" },
      ],

      afterChoicePrefix: " with a sweet treat. ",

      branches: {
        coffee:
          "The latte swirl melted into the surface while a puff of steam curled on top. ",
        mittens:
          "The smell of warm yarn invaded my throat, making me feel disturbingly cozy inside. ",
        donut:
          "The redundancy was not lost on me, but I'm an adult and can get two treats if I want. ",
      },

      after: "I snagged a table by the window and shucked off my ",
    },

    {
      id: "mittens",
      // correct choice for step 1
      correct: "mittens",
      before: "",

      choices: [
        { id: "coffee", label: "cup of coffee" },
        { id: "mittens", label: "mittens" },
        { id: "donut", label: "donut" },
      ],

      afterChoicePrefix: " next to my plate. ",

      branches: {
        mittens:
          "My defrosting fingers smelled lightly of lanolin, which made my nose wrinkle. ",
        coffee:
          "My defrosting fingers smelled lightly of early mornings, late nights, and an overactive caffeine dependency. ",
        donut:
          "My defrosting fingers smelled lightly of yeast and glaze, but that made me right at home in this little shop. ",
      },

      after: "Sitting back, I contentedly took a big bite out of my ",
    },

    {
      id: "donut",
      // correct choice for step 2
      correct: "donut",
      before: "",

      choices: [
        { id: "coffee", label: "cup of coffee" },
        { id: "mittens", label: "mittens" },
        { id: "donut", label: "donut" },
      ],

      afterChoicePrefix: " ",

      branches: {
        donut:
          "and let the sweet glaze mingle with the bitter caffeine already coating my stomach. ",
        coffee: "quite literally. My tooth cracked the porcelain...loudly. ",
        mittens: "and chewed slowly. The warm yarn caught between my teeth. ",
      },

      after:
        "I absently watched the snowflakes dance outside while listening to the bustling hum of other patrons munching away. What a delightfully cozy day.",
    },
  ],
  // Score-based endings: map from correct-count -> ending text
  endings: {
    0: "Sweat gathered at my brow while I stared resolutely out the window, feeling the worried gazes of everyone else on the back of my neck. What a ridiculously unhinged day.",
    1: "I watched the snowflakes dance outside while I, and likely everyone now staring at me, wondered at my own actions. What an incredibly odd day.",
    2: "I absently watched the snowflakes dance outside while a few observable customers in the bakery watched me in confusion. But I see no reason to call this anything but a slightly off but cozy day.",
    // 3 will default to the normal final 'after' text below if not provided.
  },
};

export default Story1BakedMittens;
