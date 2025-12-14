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
      id: "drink",
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
};

export default Story1BakedMittens;
