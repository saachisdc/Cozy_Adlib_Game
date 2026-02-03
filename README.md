# Cozy Madlab Game

A small, experimental web game built with **React** that lets users build a short story by choosing 1 of 3 words at key moments. The project is intentionally simple and designed as a learning exercise in interactive storytelling, state management, and lightweight scoring logic.

ChatGPT 5.2 was used during ideation, coding the JS and CSS components, providing some text content for the randomized branch inserts, and to understand how to implement machine learning at a small-scale. Feel free to copy and use the code

Generative AI was NOT used for the images; these were modelled and rendered by me in Blender and Nomad, and post-processed in Procreate. Do not download or copy the images

---

## Project Goals

- Create a small, contained game using ReactJS and native Javascript
- Experiment with interactive, branching narrative
- Keep the app **static and easily shareable** (no backend required, no downloading or saved data, no 3D models)
- Explore beginner-friendly approaches to heuristic scoring and machine learning logic in JavaScript
- Create enough training data from Stories 1 and 2 for a Naive Bayes ML model to predict Story 3's "vibe"
- JAN 2026 Update: added 3D data viz panel for both heuristic model (for all stories) and Naive Bayes ML model (for story 3 only) in desktop version

---

## How the Game Works (High Level)

1. A story is typed out using a typewriter effect.
2. At certain points, the text pauses and shows a placeholder (`...choose a button below...`).
3. The user selects one of three word choice buttons.
4. The placeholder is replaced with the chosen word, and the story continues based on that word using randomized branch inserts.
5. For each word selected, an image shows up on the left or right of the screen near the chosen word, and in desktop, the viz panel updates
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
public/images
└── various.webp
scripts/
└── csv_to_runs_json_with_nb.js
└── csv_to_runs_json.js
└── simulate_story_runs_with_nb.js
└── simulate_story_runs.js
└── train_nb.js
src/
├── components/
│   └── Game.jsx
│   └── Typewriter.jsx
│   └── Story1BakedMittens.js
│   └── Story2MagicalCampfire.js
│   └── Story3CrunchyVideoGame.js
│   └── tmptestunhingedscore.js
│   └── UnhingedScore.js
│   └── NBVizPanel.jsx
│   └── UnhingedVizPanel.jsx
├── ml/
│   └── nb.js
├── models/
│   └── nb_model.json
├──simulated_runs/
│   └── runs_story1_baked_mittens.csv
│   └── runs_story2_magical_campfire_with_nb.csv
│   └── runs_story2_magical_campfire.csv
│   └── runs_story3_crunchy_video_game_with_nb.csv
│   └── runs_story3_crunchy_video_game.csv
│   └── runs_story1_baked_mittens.json
│   └── runs_story2_magical_campfire_with_nb.json
│   └── runs_story2_magical_campfire.json
│   └── runs_story3_crunchy_video_game_with_nb.json
│   └── runs_story3_crunchy_video_game.json
├── styles/
│   └── components/
│       └── storylayout.css
│       └── unhingedviz.css
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

Tiny supervised model that uses Bag-of-Words (unigram) representation to assess the generated text and predict a vibe. Because this is based on vocabulary and not semantics, the output for Story 3 does not trigger the more extreme vibes that were noted by signal words and phrases in the heuristic model. Therefore, the output of the model will most likely be "kinda odd", as exemplified by "(simulated_runs/runs_story2_magical_campfire_with_nb.csv)".

### `simulate_story_runs.js`

**Purpose:**
Simulate x runs of a specified story and export results to CSV

**Responsibilities:**

- for each run of a specified story, generate storyId, generatedText, number of wrong choices, number of signal words and what they were (and categorized cozy, weird, selfAware), unhinged score, and label
- generate csv
- ex run "scripts/simulate_story_runs.js 500" in terminal to get csv with 500 results
- resulting runs are used in train_nb.js to confirm CSV parsing + story import style and output the tokens

### `train_nb.js`

**Purpose:**
Train a Naive Bayes model from simulated story runs

**Responsibilities:**

- analyze 500 runs from Story 1 and 500 runs from Story 2
- trains NB on generatedText → label
- output nb_model.json

### `nb_model.json`

**Purpose:**
Pre-trained model artifact used offline by nb.js for inference

**Responsibilities:**

- provide labels, label docCounts, and tokenCount frequencies
- docCounts and tokenCounts go into the nb.js probability model

### `nb.js`

**Purpose:** Tiny Bag-of-Words (unigram) Multinomial Naive Bayes classifier that predicts a story “vibe” label: wholesome, kinda odd, or totally unhinged.

**Responsibilities:**

- tokenizes input text (lowercase, strips punctuation except apostrophes, drops 1-character tokens)
- applies a small American → Canadian spelling normalization for a few common words (e.g., color → colour)
- scores each label using:
  - a smoothed class prior based on training document counts, and
  - smoothed token likelihoods based on per-label token frequencies (Laplace smoothing, alpha)
- chooses the label with the highest log-score
- converts label log-scores into a normalized probability distribution (softmax)
- label and the probability are picked up by Game.jsx to surface to user in the score panel

### `simulate_story_runs_with_nb.js`

**Purpose:**
Comparison script that generates simulation CSV to compare heuristic scoring vs Naive Bayes vibe prediction on the same generated text.

**Responsibilities:**

- Adds NB columns to the usual run output:
  - nbLabel, nbP, per-class probabilities
  - nbTopTokens (optional explainability)

---

## Data Visualization Panels

**Data Visualization Panels:** 

The game includes interactive 3D data visualization panels that are visible in desktop mode, providing real-time insights into the story's "vibe" based on user choices. These panels use WebGL via React Three Fiber to render dynamic 3D scenes, making the machine learning predictions tangible and engaging.

**Files:**

### `UnhingedVizPanel.jsx`
The heuristic visualization panel for Stories 1-3. Displays a 3D point cloud where each point represents a simulated or live story run. The position is determined by "cozy", "weird", and "self-aware" signal hits from the heuristic scoring system. Color indicates the ratio of wrong choices (blue for all correct, red for all wrong). Size reflects total signal hits. Historical runs appear as faint background spheres, while the current run animates as a bright point.

### `NBVizPanel.jsx`
The Naive Bayes visualization panel, active for Story 3. Similar 3D layout but positioned based on NB model probabilities for "wholesome", "kinda odd", and "totally unhinged" labels. Sphere size indicates model confidence (max probability). Includes stats display for probabilities and wrong choices, plus top signal tokens from the NB model.

**Technologies:**

- React Three Fiber (@react-three/fiber): Declarative React renderer for Three.js, enabling 3D scenes in React components.
- React Three Drei (@react-three/drei): Utility components like OrbitControls, Text, and Html for camera controls, 3D text, and overlays.
- Three.js: Underlying WebGL library for 3D graphics (implicitly used via R3F).

**Features:**

- Real-time Animation: Points smoothly interpolate to new positions as the user makes choices.
- Real-time signal update: signals (hit words and tokens) that impact the model are listed and updated as the user makes choices.
- Historical Context: Background clouds of simulated runs (from CSV data processed into JSON) provide comparison.
- Responsive Design: Panels are hidden on mobile to prioritize gameplay; only visible on desktop screens.
- Interactive Camera: Users can rotate the 3D view with mouse controls (zoom/pan disabled for simplicity).
- Color Coding: Gradient from blue (perfect score) to red (all wrong choices) for intuitive feedback.
- Data Sources: Historical runs loaded from src/simulated_runs/ JSON files, generated from CSV via scripts like scripts/csv_to_runs_json.js and scripts/csv_to_runs_json_with_nb.js.

These visualizations bridge the gap between abstract ML predictions and user experience, allowing players to see how their choices shape the story's trajectory in a visual, exploratory way. The panels update live during Story 3, showing both heuristic and NB perspectives side-by-side.

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
