// Story3CrunchyVideoGame.jsx
export const Story3CrunchyVideoGame = {
  id: "story3_crunchy_video_game",
  title: "Crunchy Video Game",
  speed: 40,

  intro:
    "A storm beat furious rain and lightening against my tall windows, but from inside my safe, dry apartment, I paid it no mind. I had just settled my sore limbs into my favourite ",

  // Each step:
  // - before: text typed BEFORE the choice is inserted
  // - choices: array of buttons
  // - afterChoicePrefix: optional glue text after the chosen label
  // - branches: what extra text appears depending on choice
  // - after: text typed AFTER the branch insert (until the next step)
  steps: [
    {
      id: "armchair",
      // correct choice for step 0
      correct: "armchair",
      before: "",

      choices: [
        { id: "armchair", label: "armchair" },
        { id: "videogame", label: "video game" },
        { id: "cookie", label: "chocolate chip cookie" },
      ],

      afterChoicePrefix: "; ",

      branches: {
        armchair: [
          "a plush piece that took up too much space. But its tall back and rounded arms cradled me just right and so I loved it regardless. ",
        ],
        videogame: [
          "a first-person zombie shooter. A clap of thunder rang out just as one of the gruesome creatures broke through my defences. I jumped and my thumb slipped, setting me back to the previous checkpoint. ",
        ],
        cookie: [
          "a fat, baked disc as big as large beanbag. The chocolate got into the nooks and crannies and would be hard to wash out later, but I refused to let that bother me. ",
        ],
      },

      after:
        "It was the perfect place to spend many hours engrossed in my newest ",
    },

    {
      id: "videogame",
      // correct choice for step 1
      correct: "videogame",
      before: "",

      choices: [
        { id: "armchair", label: "armchair" },
        { id: "videogame", label: "video game" },
        { id: "cookie", label: "chocolate chip cookie" },
      ],
      afterChoicePrefix: ", ",

      branches: {
        videogame: [
          "a delightful farming simulation that takes place in some far away asteroid field. As I attempted to protect my lettuce from giant space slugs with one hand clutching my console, ",
        ],
        cookie: [
          "which, unlike my old chocolate chip cookie, was not cold and sprinkled with dust-bunnies. ",
        ],
        armchair: [
          "My pride and joy. It may have cost me a whole month's salary but money didn't matter when an armchair looked this good. ",
        ],
      },

      after: "I reached down in real life to a plate of ",
    },

    {
      id: "cookie",
      // correct choice for step 2
      correct: "cookie",
      before: "",

      choices: [
        { id: "armchair", label: "armchair" },
        { id: "videogame", label: "video game" },
        { id: "cookie", label: "chocolate chip cookie" },
      ],
      afterChoicePrefix: "s with my other hand. ",

      branches: {
        cookie: [
          "I hummed happily as the warm disc melted in my mouth, and the sweet chips followed like drops of dopamine straight to my brain. ",
        ],
        armchair: [
          "The miniature furniture pieces had no taste, but plenty of wood fiber as I tried my best to munch through them. I guess they could be counted as a healthy snack? ",
        ],
        videogame: [
          "Absentmindedly, I threw a few bits of metal and plastic into my mouth, feeling unsatisfied by both the taste, texture, and lack of melting. ",
        ],
      },

      // Score-based endings: map from correct-count -> ending text
      after:
        "And just like that, I spent a slow, restful evening, as I am lucky to so often do.",
    },
  ],

  endings: {
    0: "And just like that, I threw up my hands and gave up on my rather strange evening. As if in agreement, lightening struck at the same time as a particularly loud clap of thunder, and the lights went out. Sigh.",
    1: "And just like that, I spent a rather odd evening, feeling unsure about everything and having a mild existential crisis. I'm sure I'll feel better in the morning.",
    2: "And just like that, I spent another evening, wrapped up in my own little world of mild confusion.",
    // 3 will default to the normal final 'after' text below if not provided.
  },

  unhingedModel: {
    // These are your "feature lists" (words you want to detect)
    weirdWords: ["zombie", "dust-bunnies", "wood fiber", "nooks and crannies"],

    cozyWords: ["plush", "loved", "delightful", "happily", "dopamine"],

    selfAwareWords: [
      "no taste",
      "gruesome",
      "old",
      "tried my best",
      "unsatisfied",
      "cost me",
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

export default Story3CrunchyVideoGame;
