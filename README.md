# Cozy Madlab Game

A small, experimental mobile-friendly web game built with **React** that lets users build a short story by choosing icons at key moments.
The project is intentionally simple and designed as a learning exercise in interactive storytelling, state management, and lightweight scoring logic.

---

## Project Goals

- Learn React through a small, contained game
- Experiment with interactive, branching narrative
- Keep the app **static and easily shareable** (no backend required)
- Explore beginner-friendly approaches to heuristic scoring and “ML-like” logic in JavaScript
- Create enough training data for ML - Naive Bayes model to also show ML score

---

## How the Game Works (High Level)

1. A story is typed out using a typewriter effect.
2. At certain points, the text pauses and shows a placeholder (`...choose a button below...`).
3. The user selects one of three icon-based choices.
4. The placeholder is replaced with the chosen word, and the story continues based on that word using randomized branch inserts. For each story, there are 1,728 slightly different stories that can be generated.
5. The game tracks which choices the user made.
6. At the end, the story’s final line can change based on how many “correct” choices were made.
7. For Story 1 and 2, the user receives a heuristic score based on the story generated, as well as a "wholesome", "kinda odd", and "totally unhinged" label
8. For Story 3, in addition to the heuristic score and label, the user also gets a Naive Bayes score and commentary on whether the heuristic and NB score matched

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
│   └── StoryLayout.jsx
│   └── tmptestunhingedscore.js
│   └── Typewriter.jsx
│   └── UnhingedScore.js
├── ml/
│   └── nb.js
├── models/
│   └── nb_model.json
├── styles/
│   └── components/
│       └── sectionfooter.css
│       └── storylayout.css
│   └── global.css
│   └── modern-normalize.css
│   └── utility.css
└── App.jsx
└── index.jsx
└── index.html
```

---

## Component Overview

### `App.jsx`

**Purpose:**
Top-level application wrapper.

**Notes:**

- Mounts the game
- Handles global layout and styling
- May later be extended to switch between multiple stories

---

### `Game.jsx`

**Purpose:**
Core game logic and state management.

**Responsibilities:**

- Tracks which step of the story the user is on
- Tracks the user’s choices
- Controls when the typewriter pauses and resumes
- Replaces placeholders with selected choices
- Computes simple scoring logic (e.g. number of correct choices)
- Selects the final story ending based on score

---

### `Typewriter.jsx`

**Purpose:**
Animates text so it appears one character at a time.

**Responsibilities:**

- Gradually reveals a target string
- Supports pausing and resuming
- Calls a callback when typing reaches the end of the current text
- Does **not** contain story or game logic

---

### `Story1BakedMittens.jsx`

**Purpose:**
Example of one of the stories. Holds the content for a specific story.

**Includes:**

- Story title and intro text
- Ordered story steps
- Choice options for each step
- Branch text for each choice
- Definition of which choices are “correct”
- Possible ending variations

**Design goal:**
This file should be easy to duplicate to create additional stories.

---

### `StoryLayout.jsx`

**Purpose:**
Determines the layout of the story section of the app

**Includes:**

- Story title, story selection, actual story, footer

**Design goal:**
This file should be easy to duplicate to create additional stories.

---

## Scoring Logic (Current)

- Each story step has one “correct” choice
- The user earns 1 point per correct choice
- Total score ranges from 0–3
- The final line of the story changes based on the score

This logic is currently implemented in **plain JavaScript**.

---

## Future Ideas (Optional)

- Add more stories using the same structure
- Introduce a playful “unhinged score” based on text features
- Experiment with lightweight ML-style scoring in JavaScript
- Improve mobile UI and accessibility

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
