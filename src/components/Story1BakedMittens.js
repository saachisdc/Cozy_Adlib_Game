// Story1BakedMittens.jsx

const IMAGES = {
  coffee: {
    src: "./images/circle.webp",
    alt: "steaming mug",
    width: 250,
    height: 250,
    loading: "lazy",
  },
  mittens: {
    src: "./images/circle.webp",
    alt: "wool mittens",
    width: 250,
    height: 250,
    loading: "lazy",
  },
  donut: {
    src: "./images/circle.webp",
    alt: "glazed donut",
    width: 250,
    height: 250,
    loading: "lazy",
  },
};

export const Story1BakedMittens = {
  id: "story1_baked_mittens",
  title: "Baked Mittens",
  speed: 40,
  images: IMAGES,

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
        {
          id: "coffee",
          label: "cup of coffee",
          image: IMAGES.coffee,
        },
        {
          id: "mittens",
          label: "mittens",
          image: IMAGES.mittens,
        },
        {
          id: "donut",
          label: "donut",
          image: IMAGES.donut,
        },
      ],

      afterChoicePrefix: " with a sweet treat. ",

      branches: {
        coffee: [
          "The latte swirl melted into the surface while a puff of steam curled on top. ",
          "I wrapped my hands around the cup, letting the heat settle into my palms. ",
          "The surface of the coffee shivered faintly as I set it down, still too hot to sip. ",
          "Steam drifted upward in slow spirals, carrying the familiar bitterness with it. ",
        ],
        mittens: [
          "The smell of warm yarn invaded my throat, making me feel disturbingly itchy inside. ",
          "The damp wool pressed its scent into my fingers, soft and uncomfortably close. ",
          "Moist heat clung to the mittens, carrying a lanolin smell that made my stomach tighten. ",
          "The wool steamed as if fresh from the oven, and that just felt wrong. ",
        ],
        donut: [
          "The redundancy was not lost on me, but I'm an adult and can get two treats if I want. ",
          "I hesitated only long enough to acknowledge the excess before accepting it. ",
          "The decision felt unnecessary, but I made it anyway, without much resistance. ",
          "I accepted the extra sweetness with a quiet sense of defiance. ",
        ],
      },

      after: "I snagged a table by the window and shucked off my ",
    },

    {
      id: "mittens",
      // correct choice for step 1
      correct: "mittens",
      before: "",

      choices: [
        {
          id: "coffee",
          label: "cup of coffee",
          image: IMAGES.coffee,
        },
        {
          id: "mittens",
          label: "mittens",
          image: IMAGES.mittens,
        },
        {
          id: "donut",
          label: "donut",
          image: IMAGES.donut,
        },
      ],

      afterChoicePrefix: " next to my plate. ",

      branches: {
        mittens: [
          "I wiggled my newly freed, defrosting fingers in delight. ",
          "Warmth seeped back into my fingers, carrying a faint wooly scent with it. ",
          "The soft smell of naturally-dyed yarn lingered as my hands slowly came back to life. ",
          "My fingers thawed gradually, the quiet comfort of the bakery settling in. ",
        ],
        coffee: [
          "My defrosting fingers smelled lightly of early mornings, late nights, and an overactive caffeine dependency. ",
          "The roasted coffee ground scent clinging to my hands felt less like coffee and more like a lifestyle choice. ",
          "My fingers carried a bitter but robust sharpness that suggested I had gone too far already. ",
          "The roasted coffee ground smell rising sharply from my hands made me question all my life decisions up to this point. ",
        ],
        donut: [
          "My defrosting fingers smelled lightly of yeast and glaze, but that made me right at home in this little shop. ",
          "Sugar and dough clung to my hands, sweet enough that I barely questioned it. ",
          "The smell of glaze followed my fingers, pleasant and faintly ridiculous. ",
          "My hands picked up a sugary warmth that felt indulgent, but harmless. ",
        ],
      },

      after: " Sitting back, I contentedly took a big bite out of my ",
    },

    {
      id: "donut",
      // correct choice for step 2
      correct: "donut",
      before: "",

      choices: [
        {
          id: "coffee",
          label: "cup of coffee",
          image: IMAGES.coffee,
        },
        {
          id: "mittens",
          label: "mittens",
          image: IMAGES.mittens,
        },
        {
          id: "donut",
          label: "donut",
          image: IMAGES.donut,
        },
      ],

      afterChoicePrefix: " ",

      branches: {
        donut: [
          "and let the sweet glaze mingle with the bitter caffeine already coating my stomach. ",
          "and savored the soft sweetness as it settled comfortably alongside the coffee. ",
          "and welcomed the familiar mix of sugar and warmth spreading through me. ",
          "and felt the sweetness soften the sharp edge of the caffeine already there. ",
        ],
        coffee: [
          "quite literally. My tooth cracked the porcelain...loudly. ",
          "with immediate regret as my teeth met something that should not be bitten. ",
          "before a sharp, unmistakable crunch snapped me fully back to reality. ",
          "and was rewarded with a sound that drew several concerned glances. ",
        ],
        mittens: [
          "and chewed slowly. The warm yarn caught between my teeth. ",
          "and paused, registering the unmistakable resistance of wool. ",
          "and realized too late that the texture was deeply incorrect. ",
          "and kept chewing, trying not to think too hard about the fibers. ",
        ],
      },

      // Score-based endings: map from correct-count -> ending text
      after:
        "I absently watched the snowflakes dance outside while listening to the bustling hum of other patrons munching away. What a delightfully cozy day.",
    },
  ],

  endings: {
    0: "Sweat gathered at my brow while I stared resolutely out the window, feeling the worried gazes of everyone else on the back of my neck. What a ridiculously unhinged day.",
    1: "I watched the snowflakes dance outside while I, and likely everyone now staring at me, wondered at my own actions. What an incredibly odd day.",
    2: "I absently watched the snowflakes dance outside while a few observable customers in the bakery watched me in confusion. But I see no reason to call this anything but a slightly off but cozy day.",
    // 3 will default to the normal final 'after' text below if not provided.
  },

  unhingedModel: {
    // These are your "feature lists" (words you want to detect)
    weirdWords: [
      "lanolin",
      "cracked",
      "wrong",
      "tighten",
      "crunch",
      "regret",
      "fibers",
      "uncomfortably",
      "disturbingly",
      "question",
      "shivered",
      "itchy",
    ],

    cozyWords: [
      "warm",
      "familiar",
      "steam",
      "comfort",
      "settle",
      "settling",
      "soft",
      "cozy",
      "delight",
      "welcomed",
      "savored",
    ],

    selfAwareWords: [
      "redundancy",
      "defiance",
      "anyway",
      "unnecessary",
      "excess",
      "lifestyle",
      "decisions",
      "questioned",
      "regret",
      "loudly",
      "bitter",
      "incorrect",
    ],

    // These numbers control how much each feature matters.
    // Keep them simple integers at first.
    weights: {
      wrongChoice: 2, // wrong choices push score up a lot
      weirdHit: 2, // weird words push score up
      selfAwareHit: 1, // self-aware words push score up a little
      cozyHit: -1, // cozy words pull score down
    },

    clampMin: 0,
    clampMax: 10,
  },
};

export default Story1BakedMittens;
