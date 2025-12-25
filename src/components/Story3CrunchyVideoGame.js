// Story3CrunchyVideoGame.jsx
export const Story3CrunchyVideoGame = {
  id: "story3_crunchy_video_game",
  title: "Crunchy Video Game",
  speed: 40,
  // images: IMAGES,

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
          "an old, overstuffed chair whose cushions had memorized my shape over the years. I sank into it with a sigh, feeling the tension drain from my shoulders. ",
          "it was positioned just right to catch the glow of the lamp. I tucked my feet beneath me and let the steady drumming of rain fade into the background. ",
          "it creaked softly as I settled in. The familiar weight of it made my apartment feel warmer and exactly where I wanted to be. ",
        ],
        videogame: [
          "a first-person zombie shooter. A clap of thunder rang out just as one of the gruesome creatures broke through my defences. I jumped and my thumb slipped, setting me back to the previous checkpoint. ",
          "a competitive online puzzle game that was much louder than necessary. Probably because the storm outside synced up perfectly with the in-game explosions, which seemed unnecessary. ",
          "a handheld rhythm game balanced awkwardly on my knee. Every flash of lightning threw off my timing, and the game punished me mercilessly for it. ",
          "a strategy game paused mid-battle while I debated whether the thunder counted as an immersive sound effect or a personal warning. I shrugged, unpaused, and promptly died. ",
        ],
        cookie: [
          "a fat, baked disc as big as large beanbag. The chocolate got into the nooks and crannies and would be hard to wash out later, but I refused to let that bother me. ",
          "a chocolate chip cookie so large, the floor bowed slightly under the baked good's weight. I moved ever so slightly and immediately regretted the crumbs raining onto the floor. ",
          "a warm cookie that stuck stubbornly to the floor, bending instead of breaking when I tried to move it. The smell was comforting, but the situation was not. ",
          "a massive cookie raining crumbs everywhere. The chocolate softened as it absorbed my body heat. I questioned my interior design sense. ",
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
          "a cozy city-building game where nothing bad ever happens. I lost track of time rearranging digital park benches while the storm raged on unnoticed. ",
          "a low-stakes exploration game that rewarded curiosity over speed. I leaned forward, fully absorbed, as my character wandered across softly glowing terrain. ",
          "a charming puzzle adventure with cheerful sound effects that harmonized pleasantly with the rumbling thunder outside. I smiled despite myself and kept playing. ",
        ],
        cookie: [
          "which, unlike my old chocolate chip cookie, was not cold and sprinkled with dust-bunnies. ",
          "which sparkled invitingly under the warm light of my lamp. I hardly dared to take a bite out of such a perfect thing. ",
          "which was a bit too soft and hot. It folded like a taco before breaking in half. ",
          "which had already cooled into a slab of chocolate-studded regret. Still yummy though.",
        ],
        armchair: [
          "my pride and joy. It may have cost me a whole month's salary but money didn't matter when an armchair looked this good. ",
          "my prized possession. I rotated it carefully into better lighting instead of doing literally anything productive. Like sitting in it. ",
          "an object I had once described as an investment. Sitting in it again, I felt reassured that one day I'll finish paying off the monthly installments. ",
          "a rare find that to this day fills me with wonder. The fabric and wood was the height of millenial grey, which was clearly the best trend of all time. ",
        ],
      },

      after: "Feeling peckish, I reached for a plate of ",
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
      afterChoicePrefix: "s with a free hand. ",

      branches: {
        cookie: [
          "I hummed happily as the warm disc melted in my mouth, and the sweet chips followed like drops of dopamine straight to my brain. ",
          "I closed my eyes as the soft cookie gave way, the chocolate warming instantly and making the storm outside feel very far away. ",
          "The cookie crumbled just right, sweet and comforting, and filled with ooey-gooey nostalgia. ",
          "I chewed contentedly, letting the sugar and warmth settle in my tired bones. ",
        ],
        armchair: [
          "The miniature furniture pieces had no taste, but plenty of wood fiber as I tried my best to munch through them. I guess they could be counted as a healthy snack? ",
          "The tiny wooden pieces resisted my molars bravely, tasting mostly of regret. I decided chewing was still better than admitting my mistake. ",
          "The texture was unconvincing, but I powered through with determination, reasoning that fiber was fiber in some abstract sense. ",
          "It offered very little flavor and far too much resistance, but I nodded to myself anyway, pretending this was a bold nutritional choice. ",
        ],
        videogame: [
          "Absentmindedly, I threw a few bits of metal and plastic into my mouth, feeling unsatisfied by both the taste, texture, and lack of melting. ",
          "I bit down on something distinctly clicky and immediately reconsidered, setting the rest of the controller aside. ",
          "The crunch was sharp and unsatisfying, more noise than reward, and I quietly resolved to keep snacks and electronics separate in the future. ",
          "It made a sound that felt more appropriate for a button press than a bite, and I paused to reflect on my life choices so far. ",
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
    weirdWords: [
      "zombie",
      "gruesome",
      "explosions",
      "mercilessly",
      "nooks and crannies",
      "bowed slightly",
      "stuck stubbornly",
      "crumbs raining",
      "dust-bunnies",
      "slab of chocolate-studded regret",
      "asteroid field",
      "space slugs",
      "wood fiber",
      "metal and plastic",
      "distinctly clicky",
    ],

    cozyWords: [
      "plush",
      "overstuffed",
      "sank into it",
      "with a sigh",
      "glow of the lamp",
      "warmer",
      "delightful",
      "ooey-gooey nostalgia",
      "nothing bad ever happens",
      "low-stakes",
      "cheerful sound effects",
      "smiled despite myself",
      "hummed happily",
      "warm disc",
      "sweet and comforting",
    ],

    selfAwareWords: [
      "refused to let that bother me",
      "immediately regretted",
      "questioned my interior design sense",
      "debated whether",
      "personal warning",
      "i shrugged",
      "promptly died",
      "cost me a whole month's salary",
      "literally anything productive",
      "described as an investment",
      "monthly installments",
      "best trend of all time",
      "still yummy though",
      "admitting my mistake",
      "life choices so far",
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
