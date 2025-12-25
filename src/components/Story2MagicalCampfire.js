// Story2MagicalCampfire.jsx
const IMAGES = {
  book: {
    src: "./images/circle.webp",
    alt: "stack of books",
    width: 250,
    height: 250,
    loading: "lazy",
  },
  dog: {
    src: "./images/circle.webp",
    alt: "small dog",
    width: 250,
    height: 250,
    loading: "lazy",
  },
  campfire: {
    src: "./images/circle.webp",
    alt: "campfire",
    width: 250,
    height: 250,
    loading: "lazy",
  },
};

export const Story2MagicalCampfire = {
  id: "story2_magical_campfire",
  title: "Magical Campfire",
  speed: 40,
  images: IMAGES,

  intro:
    "My little camper van was settled into a snug little corner of the park. A comfortably warm draft of air was melting pockets of crisp snow. Sunlight sparkled off frost-tipped dead grass. From the back of the van, I grabbed a small  ",

  // Each step:
  // - before: text typed BEFORE the choice is inserted
  // - choices: array of buttons
  // - afterChoicePrefix: optional glue text after the chosen label
  // - branches: what extra text appears depending on choice
  // - after: text typed AFTER the branch insert (until the next step)
  steps: [
    {
      id: "book",
      // correct choice for step 0
      correct: "book",
      before: "",

      choices: [
        { id: "book", label: "stack of books" },
        { id: "dog", label: "dog" },
        { id: "campfire", label: "campfire" },
      ],

      afterChoicePrefix: "  from the shelf on top of my fold out bed",

      branches: {
        book: [
          " and crawled out the back doors of the van to sit on the pull-out porch seat. The titles gleamed and promised a night of hunting for pirate treasure, lyrical traipses through the Maritimes, and coffee shops run by cats where patrons spilled all their woes. ",
          " and took the books outside, perching on the porch seat as the van creaked softly behind me. The paper smelled faintly of dust and glue, grounding me in the simple pleasure of reading for no reason other than wanting to. ",
          " and carried the stack outside, setting it carefully on the porch seat before choosing one at random. The pages fluttered in the warm air, already inviting me to slow down. ",
          " and leaned back against the pudgy cushions with the books balanced on my knees, thumbing through their spines until one felt right. ",
        ],
        dog: [
          " and wondered how he managed to not fall off on the ride here. I shrugged and opened the van's back door to the outside world. ",
          " and asked him, out loud, how long he had been up there. He sneezed and then wagged his tail as if this explained everything. ",
          " and paused, trying to remember when I had last placed a dog on a shelf. He stretched lazily, unfazed, as though this was a perfectly reasonable storage solution. ",
          " and stared at him for a moment, impressed by his commitment to staying put. The little dog yawned, clearly confident that gravity was more of a suggestion than a rule. ",
        ],
        campfire: [
          ". I wondered if I should’ve used oven mitts first, as I managed to carry the jumping flames with my bare hands without setting my poor van on fire. ",
          ". I carried it carefully in both hands, the flames hopping and crackling like an excited animal, while I silently negotiated with it not to ignite the van or my jacket. ",
          ". The fire wriggled slightly as I lifted it, warm and cooperative, as though it understood the concept of personal space just well enough to be dangerous. ",
          ". The fire shifted its weight, settling more uncomfortably against my arms, and I realized with a jolt that I was instinctively rocking it like a restless infant. ",
        ],
      },

      after:
        "The van was just big enough for me and Sparky, my navigator and pet ",
    },

    {
      id: "dog",
      // correct choice for step 1
      correct: "dog",
      before: "",

      choices: [
        { id: "book", label: "stack of books" },
        { id: "dog", label: "dog" },
        { id: "campfire", label: "campfire" },
      ],
      afterChoicePrefix: ". ",

      branches: {
        dog: [
          "He sniffed at the open page of my chosen tale but decided to hop down and explore the leaf-litter nearby. ",
          "He sniffed the edge of the open page with polite curiosity before hopping down to nose at a delightful stick nearby, entirely satisfied with this reasonable arrangement. ",
          "He rested his chin briefly on my knee, then wandered off to investigate a particularly interesting puddle, radiating the calm confidence of a very normal dog. ",
          "He circled the porch once, settled at my feet, and let out a contented sigh that suggested everything was exactly as it should be. ",
        ],
        campfire: [
          "A curious spirit that gave blistering hugs that never failed to scorch my sweaters. ",
          "A curious presence that leaned in too close, radiating a dry, crackling warmth that singed my sleeves and made personal space feel like a negotiable concept. ",
          "An overly affectionate blaze that pulsed brighter whenever I shifted, its heat uncomfortably intense in a way that felt friendly but ill-advised. ",
          "A flickering companion that hummed softly and occasionally popped off a dangerous spark, scorching my sweater while it pretended not to notice. ",
        ],

        book: [
          "I mean if other people can have pet rocks, then surely a pet stack of books is completely and utterly normal. ",
          "A sentient stack of books that leaned subtly toward me, their spines creaking as if stretching, insisting through sheer presence that this was completely normal now. ",
          "A judgemental pile of books that had developed opinions, shifting their weight impatiently whenever I ignored them, which felt deeply wrong but oddly demanding. ",
          "An unsettling tower of paper and glue that rustled softly, radiating expectations and a quiet disapproval like an overbearing parent I could not escape. ",
        ],
      },

      after: "My eyes drifted over to a roaring ",
    },

    {
      id: "campfire",
      // correct choice for step 2
      correct: "campfire",
      before: "",

      choices: [
        { id: "book", label: "stack of books" },
        { id: "dog", label: "dog" },
        { id: "campfire", label: "campfire" },
      ],
      afterChoicePrefix: "",

      branches: {
        campfire: [
          ", safely surrounded  by a ring of rocks, that snapped and crackled pleasingly. ",
          ", contained within a ring of smooth stones, snapping and crackling in a steady, reassuring pulse. ",
          ", properly banked and glowing low, its warmth spreading evenly through the clearing while sparks lifted and vanished into the cooling air. ",
          ", neatly encircled by rocks and behaving itself, the fire settling into a calm, predictable burn that made the evening feel complete. ",
        ],
        book: [
          ", the likes of which I’d only seen in overly-commercialized young-adult fantasy films. I felt personally targeted by it. ",
          ", the binding and pages curling inward as if trying to finish a sentence it should never have started. ",
          ", impossibly tall and flickering with printed words that burned, rearranged themselves, and burned again, demanding to be read, no matter how boring. ",
          ", blazing far too brightly, its flames forming lines of text that I instinctively understood to be a rather trivial recipe for rice pudding. ",
        ],
        dog: [
          " outside my camper window. Except it was clearly a lion; I wisely kept my camper van doors shut.",
          " outside the camper window, frozen mid-zoomies and lit dramatically by the firelight. He looked just as startled as I felt. ",
          " pacing in tight circles near the van, his shadow stretched enormous and theatrical against the trees, as though he were auditioning for very serious nature documentary. ",
          " standing perfectly still in the glow of the firelight, watching me with an intensity that suggested he had a plan that involved me but likely not my consent.",
        ],
      },

      // Score-based endings: map from correct-count -> ending text
      after:
        "The cool, winter evening lulled me into a sort of peace that was punctuated with page flips and the occasional wave to other campers that happened to be ambling past. What a delightfully cozy day.",
    },
  ],

  endings: {
    0: "Try as I might, I couldn’t do much but apologize for the chaos I had wrought upon the other campers. Not the most peaceful holiday trip, unfortunately.",
    1: "I did my best to ignore the chaos around me and refused to even make eye contact with any curious campers that happened to amble past. So all in all, a rather ridiculous holiday trip.",
    2: "Once in a while another camper would amble past, undoubtedly to find the bathroom, but I was largely left alone to enjoy the rest of my slightly chaotic, but still cozy trip.",
    // 3 will default to the normal final 'after' text below if not provided.
  },

  unhingedModel: {
    // These are your "feature lists" (words you want to detect)
    weirdWords: [
      "jumping flames",
      "bare hands",
      "ignite",
      "wriggled",
      "restless infant",
      "blistering",
      "singed",
      "dangerous spark",
      "sentient",
      "judgemental",
      "unsettling",
      "deeply wrong",
      "impossibly",
      "burned",
      "lion",
    ],

    cozyWords: [
      "grounding",
      "simple pleasure",
      "warm air",
      "slow down",
      "pudgy cushions",
      "felt right",
      "polite curiosity",
      "delightful stick",
      "calm confidence",
      "contented sigh",
      "exactly as it should be",
      "safely",
      "steady",
      "reassuring",
      "glowing low",
    ],

    selfAwareWords: [
      "i shrugged",
      "out loud",
      "as if this explained",
      "perfectly reasonable",
      "storage solution",
      "gravity",
      "suggestion",
      "personally targeted",
      "no matter how boring",
      "trivial recipe",
      "wise",
      "plan",
      "consent",
      "negotiable concept",
      "ill-advised",
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

export default Story2MagicalCampfire;
