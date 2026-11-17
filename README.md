# Particle Swarm Optimization: Interactive Visual Guide

An animated, interactive web application that teaches **Particle Swarm Optimization (PSO)** from first principles.
A student should be able to understand the algorithm just by watching and playing with the visuals:
what problem it solves, where the idea comes from, the equation, the loop, how the parameters change behaviour,
and how particles share information.

It is built with plain **HTML, CSS and JavaScript (Canvas 2D + SVG)**. There are no frameworks, no libraries and no build step.
Every animation, chart, heat-map and the 3-D landscape is drawn from scratch.

---

## Contents

1. [How to run](#1-how-to-run)
2. [Presentation script (12 minutes)](#2-presentation-script-12-minutes)
3. [Short version (5 minutes)](#3-short-version-5-minutes)
4. [Feature guide, section by section](#4-feature-guide-section-by-section)
5. [The visual language (colours and symbols)](#5-the-visual-language-colours-and-symbols)
6. [How it works under the hood](#6-how-it-works-under-the-hood)
7. [Reference tables (functions and presets)](#7-reference-tables)
8. [Likely questions from the professor, with answers](#8-likely-questions-from-the-professor-with-answers)
9. [Troubleshooting](#9-troubleshooting)
10. [Project structure](#10-project-structure)
11. [References](#11-references)

---

## 1. How to run

**Easiest:** double-click `index.html`. It opens in your default browser.
Chrome or Edge are recommended, and the page works in any modern browser.

**If your browser blocks local files** (rare), serve the folder and open `http://localhost:8765`:

```
python -m http.server 8765
```

**Internet:** only the fonts (Inter, Space Grotesk, JetBrains Mono) come from Google Fonts.
Offline, the page falls back to system fonts and everything else still works.

**Best viewing:** a laptop or monitor at full screen (1366 px wide or more) shows the playground's three-column layout.
The page also adapts to tablets and phones.

---

## 2. Presentation script (12 minutes)

### Before you start (checklist)

- [ ] Open `index.html` in Chrome or Edge and press **F11** for full screen.
- [ ] Close other heavy tabs so the animations stay smooth.
- [ ] Scroll through the whole page once. Animations only run while a section is on screen, so this "warms up" every section.
- [ ] Scroll back to the top before the professor arrives.
- [ ] If presenting on a projector, zoom the browser to 90 % (`Ctrl` + `-`) if things look cramped.

Each step below has **Do** (what to click) and **Say** (what to explain). The wording is only a guide; speak naturally.

---

### Part 1: Opening (≈ 45 s)

**Do:** Start at the top. Slowly move your mouse around the screen, then click once anywhere in the hero area.

**Say:**
> "This is Particle Swarm Optimization, proposed by Kennedy and Eberhart in 1995.
> What you see is already a real PSO running live: 85 particles searching for a target, which is my mouse cursor.
> None of them knows where the target is. Each one only knows how far *it* is, remembers its own best spot,
> and follows the best spot found by the group. When I click, I scatter them, and they find it again within seconds.
> In this project I explain the whole algorithm visually, step by step."

**Point out:** the live counters at the bottom right (particles, updates, the swarm's best distance to the target).

---

### Part 2: The problem (≈ 1 min 30 s), section 01

**Do:** Click "Start the visual tour" or "01 Problem" in the top menu.

1. On **① Probe blindly**, click 4–5 points on the dark canvas.

   **Say:** "Optimization means finding the input that minimises a function, here a cost curve.
   In real problems we can't see the curve. We can only probe one point at a time and get a number back.
   That's what the fog represents. Even after several probes I can't be sure there isn't a deeper valley in between."

2. Click **② Roll downhill (gradient descent)**.

   **Say:** "The classic approach is gradient descent: feel the slope, the dashed tangent line, and always step downhill.
   Watch: the ball gets stuck. This is a **local minimum**. The true **global minimum** is the green marker.
   Gradient descent always ends in whichever valley it starts in, and it needs derivatives."

   *(Optional: click near x ≈ 6 to show the ball reaching the global minimum by luck.)*

3. Click **③ Release a swarm**.

   **Say:** "Now 10 particles start at random places. The amber diamonds are each particle's personal best,
   and the star is the swarm's best. They share information and converge on the global minimum, with no derivatives at all.
   Notice the fog lifting wherever they probe."

---

### Part 3: The intuition (≈ 1 min), section 02

**Do:** Scroll to **02 Intuition**. Let the birds fly for a few seconds. Then turn on **"Show what the birds smell"**. Then click somewhere in the field to move the food.

**Say:**
> "PSO was inspired by bird flocks. The food is hidden. Each bird only smells how strong the scent is where it is.
> The small crumbs are decoys, our local optima.
> Each bird follows three rules: keep flying (**inertia**), go back toward the best place *you* found (**cognitive**),
> and go toward the best place *anyone* found (**social**). The highlighted bird is the current leader.
> If I move the food, the flock re-discovers it."

**Point out:** the eight-box "Translating birds into mathematics" table below: bird → particle, smell → fitness, and so on.

---

### Part 4: The equation (≈ 2 min), section 03

**Do:** Scroll to **03 Equation**. Hover over each coloured term in the big equation. Then click **"Build it step by step"** and wait for the four stages.

**Say:**
> "Those three rules become this one velocity equation.
> Cyan is inertia, the old velocity scaled by *w*.
> Amber is the cognitive pull toward the particle's personal best.
> Rose is the social pull toward the global best.
> They are added tip-to-tail and the green arrow is the new velocity. Then the position update is just x plus v."

**Do:** Click **"Take the step"**. Then drag the **gbest** star to a new place, and move the **c₂** slider up and down.

**Say:**
> "The particle moves along the green arrow, and its new velocity becomes the inertia of the next step.
> If I move gbest, the social arrow follows. If I raise c₂, the social pull gets stronger.
> On the right the exact numbers are calculated live, so you can verify it by hand.
> r₁ and r₂ are random numbers that change every step. That randomness keeps the swarm exploring."

*(Click **"Re-roll r₁, r₂"** to show the arrows change length.)*

---

### Part 5: The algorithm loop (≈ 1 min), section 04

**Do:** Scroll to **04 Algorithm**. Let the glowing token travel through one loop.

**Say:**
> "Here is the complete algorithm as a flowchart. Initialise random positions and velocities, evaluate fitness,
> update personal bests, update the global best, check the stopping criterion, and if not done, update velocity and position and loop again.
> As the token moves, the matching pseudocode lines light up on the right.
> The four common stopping criteria are listed underneath."

*(Optional: click any box, for example "Update velocity", to jump straight to its explanation.)*

---

### Part 6: The playground (≈ 3 min), section 05 (the main demo)

**Do:** Scroll to **05 Playground**. Make sure **Rastrigin** is selected (it is the default).

1. **Explain the map.**
   **Say:** "This is the Rastrigin function, a classic benchmark with about 100 local minima.
   Darker means a lower, better value. The small cyan cross marks the true global minimum at the centre."

2. **Walk through one iteration.** Click **"Step phase"** five times, slowly.
   **Say, phase by phase:**
   - *Phase 1, velocity:* "Every particle's three force arrows are drawn: inertia, cognitive, social."
   - *Phase 2, move:* "They all jump along their new velocity."
   - *Phase 3, evaluate:* "The function is measured. A green ring means better than that particle's memory."
   - *Phase 4, pbest:* "Those particles update their personal best. You can see the amber sparkles."
   - *Phase 5, gbest:* "The best of all becomes the new global best, shared with everyone."

   **Point out:** the coloured banner under the map and the highlighted line in **"What the code is doing"**.

3. **Run it.** Click **Play**.
   **Say:** "Watch the right side. The convergence chart shows the error dropping on a log scale.
   The diversity chart shows the swarm contracting: exploration first, then exploitation.
   The live commentary explains events in words, for example 'Global minimum found!'."

4. **Inspect a particle.** Click any particle on the map.
   **Say:** "The inspector shows its exact position, velocity, and the size of each force,
   and says what it is mostly doing right now, for example 'following the swarm'."

5. **Show a failure.** Click the preset **Greedy**, then Play.
   **Say:** "Low inertia and a strong social pull: the swarm collapses too early. This is **premature convergence**,
   and the commentary detects it." *(If this run happens to succeed, press **New swarm** and Play again.)*

6. **Show instability.** Click **Unstable (w > 1)**, then Play.
   **Say:** "With inertia above 1, the velocity grows every step and the swarm never settles."

7. **Show 3-D.** Click **Standard**, then **3D landscape**, then Play. Drag to rotate.
   **Say:** "The same swarm on the real 3-D surface. The particles are searching for the lowest valley, and the beam marks gbest."

8. *(Optional)* Click **Himmelblau** and press **New swarm** a few times.
   **Say:** "This function has four equal global minima. The random start decides which one the swarm picks."

---

### Part 7: Parameters (≈ 1 min 30 s), section 06

**Do:** Scroll to **06 Parameters**. Let one race finish. Then click **Cognitive vs social**.

**Say:**
> "The key trade-off in any optimizer is **exploration versus exploitation**.
> Here three swarms start from exactly the same positions; only *w* differs.
> One race can be luck, so under each panel I show the success rate over 40 hidden runs:
> w = 0.95 succeeds only 10 % of the time because it never settles,
> w = 0.73 succeeds 98 %, and w = 0.2 drops to 85 % because it sometimes converges too early."

*(Then on **Cognitive vs social**:)*
> "With no social term, particles never share discoveries: 3 % success. With no memory, they stampede after the leader: 63 %.
> Balanced, 98 %."

**Point out:** the cheat-sheet cards (what happens when each parameter is too high or too low), the decreasing-inertia chart,
and the constriction factor box (w = 0.7298, c₁ = c₂ = 1.49618, from Clerc and Kennedy, 2002).

---

### Part 8: Topologies (≈ 45 s), section 07

**Do:** Scroll to **07 Topology**. Click **"Trigger a new discovery"**.

**Say:**
> "Who listens to whom matters. In the global or star topology everyone is connected, so a discovery reaches the whole swarm in one step: fast, but risky.
> In a ring each particle only talks to two neighbours, so news travels hop by hop. That's slower, but different groups explore different regions longer.
> On the deceptive Schwefel function in the previous section, the ring succeeds 57 % of the time versus 40 % for global."

---

### Part 9: Wrap-up and quiz (≈ 1 min), sections 08 and 09

**Do:** Scroll through **08 Summary** briefly, then answer one quiz question in **09 Quiz**.

**Say:**
> "To summarise: PSO is population-based, gradient-free, simple, with few parameters, and works on black-box problems.
> Its weaknesses are premature convergence, parameter sensitivity, and no guarantee of the global optimum.
> Here it's compared with Genetic Algorithms and gradient descent, with real applications like
> neural network training and fuzzy controller tuning.
> Finally, a ten-question quiz with explanations lets a student check their understanding.
> Thank you. I'm happy to take questions, and I can change any parameter live."

---

## 3. Short version (5 minutes)

If time is short, do only these:

| Time | Section | Action |
|------|---------|--------|
| 0:00 | Hero | Move the mouse; one sentence about the 1995 origin |
| 0:30 | 01 Problem | Show **Roll downhill** (stuck) then **Release a swarm** (found) |
| 1:30 | 03 Equation | **Build it step by step**, then **Take the step** |
| 2:30 | 05 Playground | **Step phase** ×5 with a sentence each, then **Play**, then the **Greedy** preset |
| 4:00 | 06 Parameters | Point at the success-rate bars of the inertia race |
| 4:40 | 09 Quiz | Answer one question, then close |

---

## 4. Feature guide, section by section

### Navigation and page-wide features

- **Fixed top menu** with numbered links to all nine sections. The section you're currently reading is highlighted.
- **Scroll progress bar**: a thin gradient line at the very top that fills as you scroll.
- **"Sections" button**: on screens narrower than 1180 px the menu collapses into a drop-down.
- **Reveal animations**: panels fade and slide in as they scroll into view.
- **Smart animation**: every canvas animates only while it's visible and the browser tab is active, so the page stays smooth.
- **Responsive layout**: three columns on large screens, two on laptops, one on phones.
- **Accessibility**: honours the operating system's "reduce motion" setting.

---

### Hero: the live swarm

| Feature | Details |
|---|---|
| Live PSO | 85 particles (45 on small screens) run PSO continuously. The objective is the distance to a moving target |
| Follows the cursor | Move the mouse and the target follows it. After 2.6 s of no movement the target drifts along a smooth looping (Lissajous) path |
| Click to scatter | Clicking kicks every particle in a random direction; watch them re-converge |
| Dynamic optimisation | Because the target moves, each particle's memory (pbest) is re-evaluated every frame and slowly fades. This is how PSO is adapted to changing problems |
| Visual details | Fading motion trails, "constellation" lines between nearby particles, a pulsing target with ripples, and a star on the current gbest |
| Live counters | Number of particles, number of updates, and the swarm's best distance to the target in pixels |

---

### 01 · The Problem: a 1-D landscape hidden in fog

**Concepts taught:** what optimization is; black-box functions; local vs global minimum; why gradient descent fails on multimodal functions; why a population helps.

The canvas shows a curve on x ∈ [0, 10] with several valleys. It is defined by
f(x) = 0.055(x − 6.6)² + 0.9 sin(1.75x) + 0.35 sin(4.2x + 1.1).

| Tab | What happens | Interaction |
|---|---|---|
| **① Probe blindly** | The curve is hidden by "fog". Each click reveals the curve around that point and labels its value. The best probe so far is green, with a dashed horizontal line. After 4 probes the caption explains the curse of dimensionality (10³⁰ probes for 30 variables) | Click anywhere to probe; hover to see the x position |
| **② Roll downhill** | A ball performs gradient descent (learning rate 0.09). A dashed amber tangent line shows the only information it uses: the local slope. It stops when the slope is ≈ 0 and reports "stuck" or "reached the global minimum" | Click anywhere to drop the ball at a new start |
| **③ Release a swarm** | 10 particles run a 1-D PSO (w = 0.62, c₁ = c₂ = 1.5). Amber diamonds are personal bests, the star is gbest, and lines connect each particle to gbest. The fog lifts wherever particles probe. The run ends when the swarm has converged | Press **Restart** or click to run again |

**Other controls:** a **Reveal landscape** switch (show or hide the fog in any mode) and a **Restart** button.
The **HUD** in the top-left shows the probe count, gradient step and slope, or the PSO iteration and gbest value.
The **caption** under the canvas changes to explain exactly what just happened.

Three **concept cards** below define *local minimum*, *global minimum* and *why a swarm?*.

---

### 02 · Intuition: birds searching for food

**Concepts taught:** the biological inspiration; the three rules; fitness as "smell"; local optima as decoys; the mapping from story to maths.

| Feature | Details |
|---|---|
| The field | A 16 × 10 m field. The food gives off a strong scent plus a weak long-range scent. Three crumb piles are decoys, i.e. local optima |
| The flock | 18 birds with flapping wings that turn smoothly toward their direction of travel. They run PSO with w = 0.68, c₁ = 1.4, c₂ = 1.5 |
| The leader | The bird that currently owns gbest is larger and glows rose |
| Toggle: **Show what the birds smell** | Overlays the fitness landscape as a heat-map with contour lines, which the birds themselves cannot see |
| Toggle: **Personal memory (pbest)** | Amber diamonds at each bird's best spot, with dashed lines from the bird to its memory |
| Toggle: **Flock's best (gbest)** | A rose star at the best spot found by any bird, with lines from every bird to it |
| Click to move the food | Memories are re-checked against the new scent, so the flock has to search again |
| Auto-loop | When the flock finds the food, a green celebration ring plays for 4 s and new food appears at least 6 m away. If the flock is fooled by crumbs for 70 moves, the birds take off again from random spots |
| HUD | Move count and how far the best bird is from the food |

Beside the canvas, three **rule cards** (Inertia, Cognitive, Social) explain each rule and its symbol.
Below it, the **"Translating birds into mathematics"** grid maps eight story elements to PSO terms:
bird → particle, flock → swarm, field → search space, location → xᵢ, smell → f(xᵢ), speed → vᵢ, best spot → pbestᵢ, flock's best → gbest.

---

### 03 · The Equation: an interactive vector diagram

**Concepts taught:** the velocity and position update equations; vector addition; the meaning of w, c₁, c₂, r₁, r₂.

**The equation display.** The velocity equation is shown large, with each term in its own colour box labelled
*inertia*, *cognitive* or *social*, plus the position update. **Hovering a term** highlights its arrow in the diagram (the others dim)
and its row in the calculation.

**The diagram** (a grid in world units):

| Element | Meaning |
|---|---|
| White glowing dot | The particle's current position x (draggable) |
| Amber diamond | pbest, its personal best (draggable) |
| Rose star | gbest, the swarm's best (draggable) |
| Dashed cyan arrow and handle | The old velocity v (drag the tip to change it) |
| Faint dashed amber and rose arrows | The full vectors (pbest − x) and (gbest − x) before scaling |
| Solid cyan → amber → rose chain | w·v, then c₁r₁(pbest − x), then c₂r₂(gbest − x), added tip-to-tail |
| Thick green arrow | The resulting new velocity v(t+1) |
| Dashed green ring | Where the particle will land |
| Fading white dots | Previous positions after taking steps |

**Buttons:**

- **Build it step by step**: animates the four stages one by one (inertia, cognitive, social, resultant). The caption explains each stage, and the matching equation term and calculation row light up.
- **Take the step**: animates the particle moving along the green arrow. Its new velocity becomes next step's inertia, and r₁, r₂ are re-rolled automatically. Press it repeatedly to watch a trajectory.
- **Re-roll r₁, r₂**: picks new random numbers with a smooth animation, so you can see the arrows stretch and shrink.
- **Reset**: restores the default positions and coefficients.

**Sliders:** w (0–1.2), c₁ (0–3), c₂ (0–3), r₁ (0–1), r₂ (0–1). All changes update the arrows instantly.

**Live calculation panel.** It shows every term with real numbers, for example `w·v = 0.70 × (1.40, 1.10) = (0.98, 0.77)`,
then v(t+1) with its magnitude, and x(t+1). A note explains that real implementations draw r₁, r₂ per dimension.

**Five term cards** summarise Inertia, Cognitive, Social, Randomness and The move.

---

### 04 · The Algorithm: animated flowchart

**Concepts taught:** the complete PSO loop; the order of operations; stopping criteria.

| Feature | Details |
|---|---|
| Flowchart | 9 boxes: Start → Initialize swarm → Evaluate fitness → Update personal bests → Update global best → Stop? → (No) Update velocity → Update position → back to Evaluate; (Yes) → Return gbest |
| Travelling token | A glowing dot moves along the arrows and pauses at each box, which lights up in its own colour. It loops 3 times, then takes the "Yes" branch to Return gbest, and starts over |
| Iteration counter | Shown in the panel header |
| Description panel | Explains what happens in the active box and why. At the decision box it says "No, continue" or "Yes, criterion met" |
| Linked pseudocode | 12 lines of pseudocode; the lines for the active box are highlighted |
| Pause / Play | Freezes the animation |
| Click any box | Pauses and jumps to that box's explanation |
| Stopping criteria cards | Iteration budget, good enough (threshold), stagnation, collapse (diversity ≈ 0) |

---

### 05 · Playground: the full simulator

**Concepts taught:** everything working together on real benchmark problems; convergence; diversity; premature convergence; the effect of each parameter, live.

#### Left column: controls

**Objective function.** Eight clickable thumbnails (see [table 7.1](#71-benchmark-functions)).
The info card below shows the formula, a difficulty tag, a plain-English description, the domain and the optimal value f*.

**Behaviour presets.** Eight one-click configurations (see [table 7.2](#72-behaviour-presets)), each with a description of what to expect.
Presets restart from the **same initial swarm**, so comparisons between presets are fair.

**Parameters** (all apply **live** to the running swarm, except N):

| Control | Range | Effect |
|---|---|---|
| w, inertia | 0 – 1.2 | Momentum. High = exploration, low = exploitation, > 1 = unstable |
| c₁, cognitive | 0 – 3 | Pull toward the particle's own best |
| c₂, social | 0 – 3 | Pull toward gbest (or the ring neighbourhood best) |
| v_max, speed limit | 2 % – 50 % of the domain | Maximum step per dimension |
| N, swarm size | 3 – 150 | Number of particles (restarts the swarm) |
| T, max iterations | 20 – 500 | The run stops automatically at T |
| Animation speed | 0.5 – 40 iterations/s | How fast the simulation plays |
| Inertia schedule | Constant w, or Decay 0.9 → 0.4 | Linearly decreasing inertia (Shi & Eberhart, 1998) |
| Topology | Global (gbest) or Ring (lbest) | Who each particle follows |

**Show on map** (toggles): motion trails, velocity arrows, personal bests with memory links, social links to gbest, and the true global minimum marker.

#### Centre column: the stage

**Transport buttons:**

- **Play / Pause** (`Space`)
- **Step iteration** (`S`): one complete iteration
- **Step phase** (`P`): one of the five phases at a time
- **Reset** (`R`): restart from the same initial positions
- **New swarm**: a new random start

Keyboard shortcuts work whenever the playground is on screen.

**View switch:** **2D map** or **3D landscape**.

**2D map:**

- A hill-shaded heat-map with contour lines (dark = good, pink = bad).
- Particles drawn as glowing dots that glide smoothly between iterations.
- pbest shown as amber diamonds, gbest as a spinning rose star labelled with its value, and the true minimum as a cyan crosshair.
- When gbest improves, a ripple appears; when a pbest improves, amber sparkles appear.
- **Hover** shows a tooltip with a particle's position, fitness and pbest, or the coordinates and f value of empty space.
- **Click a particle** to select it: its three force arrows and memory link are drawn live, and the inspector fills in.
- **Click empty space** to drop a new particle there. The commentary tells you if it became the new gbest.

**3D landscape:**

- The same function as a shaded 3-D mesh (52 × 52 grid) with the same live swarm on its surface.
- A light beam marks gbest, and dashed vertical lines mark the true minima.
- It spins slowly by itself. **Drag** to rotate, **scroll** to zoom, **double-click** to stop or start the spin.

**HUD overlays:** the top-left shows the function, iteration, N and current w. The top-right chip shows the current phase,
"running", "paused" or "finished". A legend sits in the bottom-left.

**Phase banner and phase-specific visuals** (shown during **Step phase**):

| Phase | Banner | What the map shows |
|---|---|---|
| 1 · Update velocity | Explains the three components | Tip-to-tail inertia, cognitive and social arrows for **every** particle, plus the final clamped velocity (dashed green) |
| 2 · Move | x ← x + v | A slow 0.9 s glide of all particles |
| 3 · Evaluate | f(x) measured | Green rings = better than its pbest; grey = not better. Values are printed when N ≤ 40 |
| 4 · Update pbest | "k of N particles improved" | Improved diamonds enlarge and glow, with sparkles |
| 5 · Update gbest | Reports old → new gbest, or "no improvement" | Social links light up and the gbest glow grows |

**Live commentary.** A scrolling log that explains events in plain English:
new global bests (with % improvement), the exploration phase, the swarm contracting,
**"Global minimum found!"** (with the number of function evaluations), **premature convergence** (with suggested remedies),
**stagnation** (30 iterations without improvement), inertia decay updates, preset and topology changes,
particles you dropped, and a final answer summary.

**"What the code is doing".** Six lines of pseudocode. During Step phase the current phase's line is highlighted in its colour;
while playing, the highlight sweeps through all five lines every iteration.

#### Right column: insights

- **Swarm status** (9 live values): iteration / T, best f(gbest), error to the optimum f*, distance to the true optimum, current w, diversity (%), how many pbests improved, total function evaluations, and gbest position. The best value flashes when gbest improves.
- **Convergence chart:** error of gbest on a **log scale** against iteration. Straight drops mean fast improvement; flat stretches mean stagnation.
- **Diversity chart:** the average distance of particles from the swarm's centre, as a % of the domain. High = exploring, low = exploiting or converged.
- **Particle inspector:** shows the selected particle's ID, age, position, fitness, velocity and speed, pbest value, and r₁, r₂.
  Three bars compare the size of its **inertia**, **cognitive** and **social** forces, with a verdict such as
  "Mostly following the swarm", "Mostly coasting on momentum", "Almost stationary, it has converged", or "It currently owns gbest, the leader!".

---

### 06 · Parameters: exploration vs exploitation

**Concepts taught:** the exploration/exploitation trade-off; the effect of w, c₁/c₂, N and topology; why single runs can mislead (statistics).

**The race.** Three swarms run side by side from **exactly the same starting positions** (a shared random seed).
Only one setting differs between them. Four comparisons are available:

| Comparison | Function | Panel A | Panel B | Panel C |
|---|---|---|---|---|
| **Inertia weight w** | Rastrigin | w = 0.95 (too much momentum) | w = 0.73 (balanced) | w = 0.20 (too little) |
| **Cognitive vs social** | Rastrigin | c₁ = 2.5, c₂ = 0 (loners) | c₁ = c₂ = 1.49 (team) | c₁ = 0, c₂ = 2.5 (herd) |
| **Swarm size** | Rastrigin | N = 5 | N = 20 | N = 60 |
| **Topology** | Schwefel | Global (gbest) | Ring (lbest) | No communication |

Each panel shows:

- a mini heat-map with the live swarm
- a sparkline of the error
- the best value found
- a status badge: *exploring* or *converging* during the race; *best result*, *found optimum*, *trapped* or *unsettled* at the end

The winning panel glows green. A new race starts automatically 5 s after the last one finishes, or press **New race**.

**Success rate over 40 hidden runs.** A single race can be luck, so each panel also shows how often that setting succeeds
over 40 hidden runs from different random starts. Success means the error ends below 0.01, or below 1 on Schwefel.
These values are fixed, so you can quote them:

| Comparison | Panel A | Panel B | Panel C |
|---|---|---|---|
| Inertia weight | 10 % | **98 %** | 85 % |
| Cognitive vs social | 3 % | **98 %** | 63 % |
| Swarm size | 33 % | 95 % | **100 %** |
| Topology (Schwefel) | 40 % | **57 %** | 5 % |

An explanation box under the race tells you what to notice for each comparison.

**Parameter cheat-sheet.** Six cards (w, c₁, c₂, v_max, N, r₁/r₂), each with its typical range and what happens if it's too high or too low.

**Linearly decreasing inertia chart.** An animated dot slides along w(t) = 0.9 → 0.4, across a background that shades from *explore* to *exploit*.

**Constriction factor box.** w = 0.7298 with c₁ = c₂ = 1.49618 (Clerc & Kennedy, 2002) guarantees stable convergence.
This is why the playground's "Standard" preset uses these values.

**Rule of thumb box.** Keep c₁ ≈ c₂, keep w < 1, and use a ring topology or a bigger swarm for many local minima.

---

### 07 · Topology: how news spreads

**Concepts taught:** gbest vs lbest neighbourhoods; speed of information spread; robustness.

Two animated networks of 12 particles run side by side. One particle (gold) "finds a better spot", and glowing pulses carry the news along the network's connections.
Informed particles turn rose and pop.

| Network | Connections | Spread | Counters |
|---|---|---|---|
| **Global / Star (gbest)** | Everyone to everyone | Whole swarm informed in **1 step** | informed x/12, steps |
| **Ring (lbest, k = 2)** | Two neighbours each | Travels **hop by hop**: 6 steps to reach everyone | informed x/12, steps |

A new random discovery starts automatically, or press **Trigger a new discovery**.
Each network has **Strength** and **Weakness** cards, and a note mentions other topologies (Von Neumann, random, fully-informed PSO).

---

### 08 · Summary: the big picture

- **Strengths** (5 points) and **Limitations** (5 points).
- **Comparison table:** PSO vs Genetic Algorithm vs Gradient Descent across 8 properties: inspiration, need for a gradient, population, operators, memory, information sharing, escaping local minima, and parameters.
- **Eight real-world applications:** neural network training, fuzzy system tuning, power systems, feature selection, robotics and UAVs, antenna and circuit design, image processing, scheduling and logistics.
- **Six key takeaways**, numbered.
- **Four academic references.**

---

### 09 · Quiz: test yourself

- 10 multiple-choice questions covering: pbest, the inertia term, c₂ = 0, w > 1, why r₁ and r₂ are random, ring vs global topology, gradient-free, decreasing inertia, v_max, and premature convergence.
- Instant feedback: the correct answer pops green, and a wrong choice shakes red.
- Every answer comes with an explanation.
- A progress bar and a running score.
- **Back / Next** navigation; your answers are remembered.
- A final result screen with an animated score ring, a message based on the score, and **Retake the quiz**.

---

## 5. The visual language (colours and symbols)

The same colours mean the same thing on **every** visual of the page:

| Colour | Meaning | Used for |
|---|---|---|
| **Cyan** `#22d3ee` | Inertia / velocity | w·v arrows, particle glow, trails, "explore" |
| **Amber** `#fbbf24` | Cognitive / personal best | pbest diamonds, memory links, c₁ term, pbest sparkles |
| **Rose** `#fb7185` | Social / global best | gbest star, social links, c₂ term, ripples, "exploit" |
| **Green** `#34d399` | Resulting move / success | v(t+1) arrow, "found", winner panel |
| **Teal** `#5eead4` | True optimum / evaluation | true-minimum crosshair, evaluate phase |
| **Violet** `#8b7cff` | General UI accent | buttons, highlights, headings |

| Symbol | Meaning |
|---|---|
| Glowing white dot | A particle |
| ◆ Amber diamond | That particle's personal best (pbest) |
| ✦ Rose four-point star | The global best (gbest) |
| ⌖ Cyan crosshair | The true global minimum (known for benchmarks) |
| Expanding rose ring | gbest just improved |
| Amber sparkles | A pbest just improved |
| Heat-map colour | Dark navy = low (good) → pink = high (bad) |

---

## 6. How it works under the hood

### 6.1 The PSO engine (`js/pso.js`)

The engine is written to be readable: **each phase of an iteration is its own method**, which is what makes Step phase possible.

```
v_i(t+1) = w·v_i(t) + c1·r1·(pbest_i − x_i(t)) + c2·r2·(gbest − x_i(t))
x_i(t+1) = x_i(t) + v_i(t+1)
```

| Step | Method | What it does |
|---|---|---|
| Init | `reset()` | Uniform random positions over the domain; random velocities in ±½·v_max; evaluate; pbest = x; gbest = best pbest |
| 1 | `phaseVelocity()` | Draws r₁, r₂ **per dimension**, computes the three components (stored for drawing), and clamps each component of v to ±v_max |
| 2 | `phasePosition()` | x ← x + v. Walls **reflect**: a particle that would leave the box bounces back and its velocity is reversed and halved |
| 3 | `phaseEvaluate()` | fᵢ = f(xᵢ) for all particles (counts function evaluations) |
| 4 | `phasePbest()` | If fᵢ < f(pbestᵢ) then pbestᵢ ← xᵢ |
| 5 | `phaseGbest()` | gbest ← best of all pbest; records an improvement event (used for ripples and commentary) |

- **Update style:** synchronous. All velocities are computed, then all particles move, then all are evaluated.
- **Inertia schedule:** constant w, or linear: w(t) = 0.9 − 0.5·t/T.
- **Ring topology:** each particle's social target is the best pbest among itself and its two index-neighbours (i − 1, i + 1).
- **Diversity:** the mean distance of particles from the swarm centroid, each axis normalised by the domain size.
- **Seeded random numbers:** a small seeded generator (mulberry32) makes runs reproducible. Reset and the presets reuse the same seed for fair comparisons.

### 6.2 Rendering

- **Heat-maps** are computed once per function (560 × 560 samples) with **hill-shading**: surface normals from the gradient, lit from the top-left.
  **Contour lines** come from a gradient-normalised band test, so lines stay about 1 px thick on steep and flat areas alike. The results are cached.
- **3-D surface:** a 52 × 52 mesh, rotated and projected with perspective, sorted back-to-front (painter's algorithm), and shaded with a fixed light.
- **Glows** are pre-rendered radial-gradient sprites, much faster than canvas `shadowBlur`, so 150 glowing particles stay smooth.
- **Smooth motion:** the engine moves in discrete iterations, but particles are drawn by easing between their previous and current positions.
- **Sharp on any screen:** every canvas resizes with its container and accounts for the screen's pixel density.
- **Performance:** animation loops run only while their section is on screen and the tab is visible.

### 6.3 Success-rate statistics (section 06)

When a comparison is opened, the app silently runs 40 complete PSO runs for each of the three settings (seeds 7000–7039), outside the animation,
and counts how many reach the success threshold. That is 120 runs in total, which takes a fraction of a second.

---

## 7. Reference tables

### 7.1 Benchmark functions

| Function | Domain | Global minimum | Character |
|---|---|---|---|
| **Sphere** | [−5.12, 5.12]² | f(0, 0) = 0 | Smooth bowl, unimodal, easy |
| **Rastrigin** | [−5.12, 5.12]² | f(0, 0) = 0 | Grid of ~100 local minima |
| **Ackley** | [−5, 5]² | f(0, 0) = 0 | Flat rippled plateau with a deep central hole |
| **Rosenbrock** | x ∈ [−2, 2], y ∈ [−1, 3] | f(1, 1) = 0 | Narrow curved "banana" valley |
| **Himmelblau** | [−5, 5]² | 0 at four points, e.g. (3, 2) | Four equal global minima |
| **Griewank** | [−12, 12]² | f(0, 0) = 0 | Many near-equal shallow minima |
| **Schwefel** | [−500, 500]² | f(420.97, 420.97) ≈ 0 | Deceptive: best region is far from the second-best |
| **Eggholder** | [−512, 512]² | f(512, 404.23) = −959.64 | Rugged; minimum at the edge of the domain |

### 7.2 Behaviour presets

| Preset | w | c₁ | c₂ | Other | What it demonstrates |
|---|---|---|---|---|---|
| **Standard** | 0.729 | 1.494 | 1.494 | v_max 20 % | Constriction-derived defaults; balanced |
| **Explorer** | 0.95 | 2.0 | 0.9 | v_max 30 % | Wide roaming, slow convergence |
| **Greedy** | 0.3 | 0.6 | 2.2 | | Fast collapse, premature convergence |
| **Loners (c₂ = 0)** | 0.6 | 2.0 | 0 | | No information sharing |
| **Herd (c₁ = 0)** | 0.6 | 0 | 2.0 | | No memory; diversity lost at once |
| **Unstable (w > 1)** | 1.1 | 1.5 | 1.5 | v_max 30 % | Velocity explosion; never settles |
| **Linear decay** | 0.9 → 0.4 | 2.0 | 2.0 | | Explore first, exploit later |
| **Ring topology** | 0.729 | 1.494 | 1.494 | Ring (lbest) | Slower, more robust search |

---

## 8. Likely questions from the professor, with answers

**Q: Why is the inertia weight usually less than 1?**
With w < 1 the old velocity shrinks every step, so the swarm gradually slows down and converges.
With w > 1 the velocity is amplified each step and the swarm "explodes". Demonstrate with the **Unstable** preset.

**Q: What is the constriction factor?**
Clerc and Kennedy (2002) analysed PSO's stability mathematically. They multiply the whole velocity update by
χ = 2 / |2 − φ − √(φ² − 4φ)|, with φ = c₁ + c₂ = 4.1. This gives χ ≈ 0.7298, which is equivalent to w = 0.7298 and c₁ = c₂ = 1.49618.
These values guarantee convergence without needing v_max.

**Q: Why are r₁ and r₂ random, and why per dimension?**
They add stochastic variation so particles explore around their targets instead of moving in fixed straight lines.
Drawing them per dimension also lets the pull's direction vary slightly. Section 03 uses one value per term only to keep the arrows readable,
and the playground engine draws them per dimension.

**Q: How is PSO different from a Genetic Algorithm?**
Both are population-based and gradient-free. A GA creates new individuals with selection, crossover and mutation, and old individuals are replaced.
In PSO the same particles persist, move through the space with a velocity, and keep a **memory** (pbest). Information is shared by broadcasting gbest, not by recombination.
See the table in section 08.

**Q: Is PSO guaranteed to find the global optimum?**
No. It is a heuristic. It is very effective in practice, but it can converge prematurely. The success-rate bars in section 06 show this directly:
even the best setting is not 100 % on every problem.

**Q: What is the computational cost?**
Each iteration costs N function evaluations plus O(N·D) arithmetic, where D is the number of dimensions.
In real problems the function evaluations usually dominate. The playground counts them under "Evaluations".

**Q: How are boundaries handled?**
Here particles **reflect** off the walls, and their velocity is reversed and halved.
Other common options are clamping to the boundary, absorbing (velocity set to 0), or giving infeasible positions a penalty or infinite fitness.

**Q: What is the difference between synchronous and asynchronous PSO?**
Synchronous (used here): all particles move, then gbest is updated once per iteration.
Asynchronous: gbest is updated immediately after each particle is evaluated, so information spreads a little faster.

**Q: How does PSO handle constraints or discrete problems?**
Constraints are usually handled with penalty functions or repair. Discrete and binary problems use variants such as **Binary PSO**,
where velocity becomes the probability of a bit being 1 through a sigmoid (Kennedy & Eberhart, 1997).

**Q: Why use the ring topology if it is slower?**
Slower information spread keeps several sub-swarms exploring different regions, which reduces premature convergence on multimodal or deceptive functions.
In section 06's topology race on Schwefel, ring succeeds 57 % of the time vs 40 % for global.

**Q: How does PSO relate to soft computing?**
PSO is a swarm-intelligence / evolutionary-computation technique, one of the pillars of soft computing alongside fuzzy logic and neural networks.
It is often used in hybrids, for example tuning fuzzy membership functions or training neural network weights.

---

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| Fonts look plain | No internet; the system fonts are used instead. Everything else works |
| A section isn't animating | Animations pause when a section is off-screen or the tab is hidden; scroll it into view |
| Animations stutter | Close other tabs, use Chrome or Edge, lower the swarm size N, or reduce the animation speed |
| Keyboard shortcuts don't work | Scroll so the playground is in the middle of the screen, and click on the page (not on a slider) first |
| Page looks too big on a projector | Zoom out with `Ctrl` + `-` |
| Nothing works when opened from a file | Serve the folder with `python -m http.server 8765` and open `http://localhost:8765` |

---

## 10. Project structure

```
index.html          Page structure and all explanatory text (9 sections)
README.md           This document
css/style.css       Design system (colours, typography), layout, animations, responsive rules
js/utils.js         Canvas sizing (HiDPI), visibility-aware animation loop, arrows, glows, seeded RNG
js/functions.js     8 benchmark functions, colour map, hill-shaded contour heat-map renderer
js/pso.js           The PSO engine: one method per phase, ring topology, inertia schedule, diversity
js/hero.js          Hero: dynamic PSO chasing the cursor
js/problem.js       01: 1-D fog landscape, gradient descent ball, 1-D swarm
js/analogy.js       02: bird flock with smell field, decoys, memory and leader overlays
js/vector.js        03: draggable vector diagram, build animation, live calculation
js/flow.js          04: SVG flowchart with travelling token and linked pseudocode
js/surface3d.js     3-D surface renderer used by the playground
js/playground.js    05: the simulator (controls, phases, charts, commentary, inspector)
js/compare.js       06: parameter races, success-rate statistics, inertia schedule chart
js/topology.js      07: information-spread animation for star vs ring
js/quiz.js          09: quiz engine with explanations and score ring
js/main.js          Navigation, scroll progress, section highlighting, reveal animations, start-up
```

---

## 11. References

1. Kennedy, J. & Eberhart, R. (1995). *Particle swarm optimization.* Proc. IEEE International Conference on Neural Networks, vol. 4, pp. 1942–1948.
2. Shi, Y. & Eberhart, R. (1998). *A modified particle swarm optimizer.* Proc. IEEE International Conference on Evolutionary Computation, pp. 69–73.
3. Clerc, M. & Kennedy, J. (2002). *The particle swarm: explosion, stability, and convergence in a multidimensional complex space.* IEEE Transactions on Evolutionary Computation, 6(1), 58–73.
4. Poli, R., Kennedy, J. & Blackwell, T. (2007). *Particle swarm optimization: an overview.* Swarm Intelligence, 1(1), 33–57.
5. Kennedy, J. & Eberhart, R. (1997). *A discrete binary version of the particle swarm algorithm.* Proc. IEEE International Conference on Systems, Man, and Cybernetics, pp. 4104–4108.
