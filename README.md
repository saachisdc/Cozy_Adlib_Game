# Cozy Madlab Game

A small, experimental web game built with **React** that lets users build a short story by choosing icons at key moments.
The project is intentionally simple and designed as a learning exercise in interactive storytelling, state management, and lightweight scoring logic.

ChatGPT 5.2 was used during ideation, coding the JS and CSS components, providing some text content for the randomized branch inserts, and to understand how to implement machine learning at a small-scale. Feel free to copy and use the code

Generative AI was NOT used for the images; these were modelled and rendered in Blender and Nomad, and post-processed in Procreate. Do not download or copy the images

---

## Project Goals

- Create a small, contained game using ReactJS and native Javascript
- Experiment with interactive, branching narrative
- Keep the app **static and easily shareable** (no backend required, no saved data, no 3D models)
- Explore beginner-friendly approaches to heuristic scoring and machine learning logic in JavaScript
- Create enough training data from Stories 1 and 2 for ML - Naive Bayes model to also show ML score based on offline training for Story 3

---

## How the Game Works (High Level)

1. A story is typed out using a typewriter effect.
2. At certain points, the text pauses and shows a placeholder (`...choose a button below...`).
3. The user selects one of three icon-based choices.
4. The placeholder is replaced with the chosen word, and the story continues based on that word using randomized branch inserts.
5. For each word selected, an image shows up on the left or right of the screen near the chosen word.
6. For each story, there are 1,728 slightly different stories that can be generated.
7. At the end, the story’s final line can change based on how many “correct” choices were made.
8. The game tracks which choices the user made, and a model checks if the branches created included "wholesome", "kinda odd", or "totally unhinged" words.
9. For Story 1 and 2, the user receives a heuristic score based on the story generated, as well as a "wholesome", "kinda odd", and "totally unhinged" label
10. For Story 3, in addition to the heuristic score and label, the user also gets a Naive Bayes score and commentary on whether the heuristic and NB score matched

---

## Tech Stack

- **React** (frontend)
- **JavaScript (ES6+)**
- No backend / no database
- No server-side rendering
- No external ML dependencies (by design)

---

## Project Structure

```text
scripts/
└── simulate_story_runs_with_nb.js
└── simulate_story_runs.js
└── train_nb.js
simulated_runs/
└── runs_story1_baked_mittens.csv
└── runs_story2_magical_campfire_with_nb.csv
└── runs_story2_magical_campfire.csv
└── runs_story3_crunchy_video_game_with_nb.csv
└── runs_story3_crunchy_video_game.csv
src/
├── components/
│   └── Game.jsx
│   └── Typewriter.jsx
│   └── Story1BakedMittens.js
│   └── Story2MagicalCampfire.js
│   └── Story3CrunchyVideoGame.js
│   └── tmptestunhingedscore.js
│   └── UnhingedScore.js
├── ml/
│   └── nb.js
├── models/
│   └── nb_model.json
├── styles/
│   └── components/
│       └── storylayout.css
│   └── global.css
│   └── modern-normalize.css
│   └── utility.css
└── App.jsx
└── index.jsx
└── index.html
```

---

## Game and Heuristic Component Overview

### `App.jsx`

**Purpose:**
Top-level application wrapper.

**Notes:**

- Mounts the game
- Handles global layout and styling
- May later be extended to switch between multiple stories

### `Game.jsx`

**Purpose:**
Core game logic and state management.

**Responsibilities:**

- Tracks the user’s choices (open/close menu, word and story selection, restart)
- Controls when the typewriter pauses and resumes
- Tracks which step of the story the user is on
- Replaces placeholders with selected choices (word and images)
- Selects the final story ending based on score
- Updates scores and labels and, if applicable, if heuristic and ml model scores matched

### `Typewriter.jsx`

**Purpose:**
Animates text so it appears one character at a time.

**Responsibilities:**

- Gradually reveals a target string
- Supports pausing and resuming
- Calls a callback when typing reaches the end of the current text
- Notes where images will be added (left or right alternating)

### `Story1BakedMittens.jsx`

**Purpose:**
Example of one of the stories. Holds the content for a specific story.

**Includes:**

- Story title and intro text
- Images pathway to public folder
- Ordered story steps
- Choice options for each step
- Branch text for each choice
- Definition of which choices are “correct”
- Possible ending variations
- Unhinged heuristic model, with weight and clamping

**Design goal:**
This file should be easy to duplicate to create additional stories.

### `UnhingedScore.js`

**Purpose:**
Calculates the heuristic Unhinged Score and buckets the lables

**Heuristic Scoring Logic:**

- Each story step has one “correct” choice, which earns the user 1 point per correct choice (total of 3)
- Each story has an unhinged model that includes a list of cozy words (-1), weird words (+2), and self-aware words (+1) that appear in the specific story
- model tracks user choices and signal words in resulting text
- model adds up the number of wrong word choices, cozy words, weird words, and self-aware words and gives a clamped score from 0 to 10 to Game.jsx
- model provides a label to Game.jsx to surface, based on score: 0-3 (wholesome), 4-6 (kinda odd), 7-10 (totally unhinged)

---

## Naive Bayes ML Component Overview

Tiny model to score generated text and predict a vibe. Because this is based on vocabulary and not semantics, the output for Story 3 does not trigger the more extreme vibes that were signal words in the heuristic model. Therefore, the output of the model is always "kinda odd", as exemplified by "(simulated_runs/runs_story2_magical_campfire_with_nb.csv)", with high probability due to "kinda odd" just being the most neutral

### `simulate_story_runs.js`

**Purpose:**
Simulate x number of simulations of specific story specified in code

**Responsibilities:**

- for each run of a specified story, generate storyId, generatedText, number of wrong choices, number of signal words and what they were (and categorized cozy, weird, selfAware), unhinged score, and label
- generate csv
- ex run "scripts/simulate_story_runs.js 500" in terminal to get csv with 500 results
- resulting runs are used in train_nb.js to confirm CSV parsing + story import style and output the tokens

### `train_nb.js`

**Purpose:**

- create nb_model based on training data

**Responsibilities:**

- analyze 500 runs from Story 1 and 500 runs from Story 2
- trains NB on generatedText → label
- output nb_model.json

### `nb_model.json`

**Purpose:**

- json model that works as offline dictionary to help predict vibe of text

**Responsibilities:**

- provide labels, label docCounts, and tokenCount frequencies
- docCounts and tokenCounts go into the nb.js probability model

### `nb.js`

**Purpose:**

- vibe predictor: is given text "wholesome", "kinda odd" or "totally unhinged"

**Responsibilities:**

- Naive Bayes model that looks at a generated text (after some potential cleanup and spelling conversions) and predicts a vibe based on the offline json dictionary
- tokenizes text (same as during training)
- For each token: Look up how often it appeared in this label during training, then apply Laplace smoothing, and add its log probability to the score
- pick the best label based on the log scores
- calculate probability from the log score
- give both the lable and probability to Game.jsx to surface to user generating Story 3 text

---

## Running the Project

```bash
npm install
npm run dev
```

(Exact commands may vary depending on setup.)

---

## Notes

This project is intentionally small and experimental.
The focus is on learning, clarity, and iteration rather than production-scale architecture.
