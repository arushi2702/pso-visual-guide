# Particle Swarm Optimization: Interactive Visual Guide
### Soft Computing Assignment · Swarm Intelligence & Metaheuristics

---

## 📋 Submission Details

| Field | Details |
| :--- | :--- |
| **Course** | **Soft Computing** |
| **Assignment** | **Visualizing Particle Swarm Optimization (PSO)** |
| **Submitted By** | **Arushi Waddepalli** (`LIT2024009`)<br>**Sanjana Chennupati** (`LIT2024016`) |
| **Tech Stack** | Vanilla **HTML5, CSS3, JavaScript (Canvas 2D, 3D Mesh Projection, SVG)**<br>*Zero external libraries, frameworks, or build tools* |
| **Deliverables** | 1. Interactive Web Application (`index.html`)<br>2. Demonstration Video<br>3. Technical Documentation (`README.md`) |
| **Video Link** | *[Insert 3-Minute Demo Video Link Here]* |

---

## 🎯 Abstract & Project Motivation

As a foundational pillar of **Soft Computing** alongside Neural Networks and Fuzzy Systems, **Particle Swarm Optimization (PSO)** (Kennedy & Eberhart, 1995) is a population-based, stochastic, gradient-free metaheuristic inspired by the emergent collective intelligence of bird flocks and fish schools. 

Traditional numerical optimization methods (such as Gradient Descent) struggle on high-dimensional, multimodal, non-differentiable, or "black-box" fitness landscapes where local minima traps and gradient unavailability render analytical solutions infeasible.

This project implements an **animated, interactive educational platform** engineered from first principles using pure vanilla web technologies. It decomposes the PSO algorithm into transparent, interactive mental models:
1. **The Problem Landscape**: Comparing blind random search, classical gradient descent traps, and multi-agent swarm exploration on 1-D multimodal curves.
2. **Biological Intuition**: Translating natural flocking behaviors and pheromone/scent tracking into mathematical parameters.
3. **The Velocity Vector Engine**: Interactive vector addition of Inertia ($\vec{v}$), Cognitive pull ($p_{best}$), and Social pull ($g_{best}$).
4. **Step-Phase Algorithmic Execution**: Stepping through individual discrete phases (Velocity update $\rightarrow$ Position update $\rightarrow$ Fitness evaluation $\rightarrow$ $p_{best}$ update $\rightarrow$ $g_{best}$ update) in synchrony with highlighted pseudocode.
5. **Real-time 2D/3D Benchmark Simulator**: 8 classic benchmark functions (Rastrigin, Ackley, Rosenbrock, Schwefel, etc.), 8 behavior presets, live convergence (log error) and diversity metrics, and single-particle force vector inspection.
6. **Exploration vs. Exploitation Dynamics**: Side-by-side multi-swarm races under controlled random seeds, paired with 40-run empirical Monte Carlo success rates demonstrating the Clerc-Kennedy constriction factor ($\chi \approx 0.7298$).
7. **Social Topology Topographies**: Simulating information propagation latencies in Global/Star ($g_{best}$) vs Ring ($l_{best}$) graphs.
8. **Comparative Synthesis & Evaluation**: Comparative matrix against Genetic Algorithms (GA) and Gradient Descent (GD), real-world engineering applications, and an interactive 10-question evaluation quiz with instant explanatory feedback.

---

## 📑 Contents

1. [Quick Start & How to Run](#1-quick-start--how-to-run)
2. [Feature Guide, Section by Section](#2-feature-guide-section-by-section)
3. [The Visual Language (Colors and Symbols)](#3-the-visual-language-colours-and-symbols)
4. [How It Works Under the Hood (Engine Architecture)](#4-how-it-works-under-the-hood)
5. [Reference Tables (Benchmark Functions & Behavior Presets)](#5-reference-tables)
6. [Troubleshooting](#6-troubleshooting)
7. [Project File Structure](#7-project-structure)
8. [Academic References](#8-references)

---

## 1. Quick Start & How to Run

Because the project is built with **pure vanilla HTML, CSS, and JavaScript**, there is **no installation, no `npm install`, and no build pipeline**.

### Option A: Direct Browser Launch (Recommended)
- **macOS**: In the terminal, run:
  ```bash
  open index.html
  ```
  *(Or double-click `index.html` in Finder).*
- **Windows**: In Command Prompt / PowerShell, run:
  ```cmd
  start index.html
  ```
- **Linux**: In the terminal, run:
  ```bash
  xdg-open index.html
  ```

### Option B: Local HTTP Server
If your browser restricts local file access (e.g. strict CORS policies on local fonts), launch a lightweight server:
```bash
python3 -m http.server 8000
```
Then navigate to: **`http://localhost:8000`** in Chrome, Edge, or Safari.

> [!TIP]
> **Recommended Display**: Open in Chrome or Edge and press **`F11`** (or **`Cmd + Shift + F`** on Mac) for a borderless fullscreen experience at 1080p.

---

## 2. Feature Guide, Section by Section

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

## 3. The Visual Language (Colours and Symbols)

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

## 4. How It Works Under the Hood (Engine Architecture)

### 4.1 The PSO engine (`js/pso.js`)

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

### 4.2 Rendering

- **Heat-maps** are computed once per function (560 × 560 samples) with **hill-shading**: surface normals from the gradient, lit from the top-left.
  **Contour lines** come from a gradient-normalised band test, so lines stay about 1 px thick on steep and flat areas alike. The results are cached.
- **3-D surface:** a 52 × 52 mesh, rotated and projected with perspective, sorted back-to-front (painter's algorithm), and shaded with a fixed light.
- **Glows** are pre-rendered radial-gradient sprites, much faster than canvas `shadowBlur`, so 150 glowing particles stay smooth.
- **Smooth motion:** the engine moves in discrete iterations, but particles are drawn by easing between their previous and current positions.
- **Sharp on any screen:** every canvas resizes with its container and accounts for the screen's pixel density.
- **Performance:** animation loops run only while their section is on screen and the tab is visible.

### 4.3 Success-rate statistics (section 06)

When a comparison is opened, the app silently runs 40 complete PSO runs for each of the three settings (seeds 7000–7039), outside the animation,
and counts how many reach the success threshold. That is 120 runs in total, which takes a fraction of a second.

---

## 5. Reference Tables (Benchmark Functions & Behavior Presets)

### 5.1 Benchmark functions

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

### 5.2 Behaviour presets

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

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| Fonts look plain | No internet; the system fonts are used instead. Everything else works |
| A section isn't animating | Animations pause when a section is off-screen or the tab is hidden; scroll it into view |
| Animations stutter | Close other tabs, use Chrome or Edge, lower the swarm size N, or reduce the animation speed |
| Keyboard shortcuts don't work | Scroll so the playground is in the middle of the screen, and click on the page (not on a slider) first |
| Page looks too big on a projector | Zoom out with `Ctrl` + `-` |
| Nothing works when opened from a file | Serve the folder with `python -m http.server 8765` and open `http://localhost:8765` |

---

## 7. Project Structure

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

## 8. References

1. Kennedy, J. & Eberhart, R. (1995). *Particle swarm optimization.* Proc. IEEE International Conference on Neural Networks, vol. 4, pp. 1942–1948.
2. Shi, Y. & Eberhart, R. (1998). *A modified particle swarm optimizer.* Proc. IEEE International Conference on Evolutionary Computation, pp. 69–73.
3. Clerc, M. & Kennedy, J. (2002). *The particle swarm: explosion, stability, and convergence in a multidimensional complex space.* IEEE Transactions on Evolutionary Computation, 6(1), 58–73.
4. Poli, R., Kennedy, J. & Blackwell, T. (2007). *Particle swarm optimization: an overview.* Swarm Intelligence, 1(1), 33–57.
5. Kennedy, J. & Eberhart, R. (1997). *A discrete binary version of the particle swarm algorithm.* Proc. IEEE International Conference on Systems, Man, and Cybernetics, pp. 4104–4108.

1. Kennedy, J. & Eberhart, R. (1995). *Particle swarm optimization.* Proc. IEEE International Conference on Neural Networks, vol. 4, pp. 1942–1948.
2. Shi, Y. & Eberhart, R. (1998). *A modified particle swarm optimizer.* Proc. IEEE International Conference on Evolutionary Computation, pp. 69–73.
3. Clerc, M. & Kennedy, J. (2002). *The particle swarm: explosion, stability, and convergence in a multidimensional complex space.* IEEE Transactions on Evolutionary Computation, 6(1), 58–73.
4. Poli, R., Kennedy, J. & Blackwell, T. (2007). *Particle swarm optimization: an overview.* Swarm Intelligence, 1(1), 33–57.
5. Kennedy, J. & Eberhart, R. (1997). *A discrete binary version of the particle swarm algorithm.* Proc. IEEE International Conference on Systems, Man, and Cybernetics, pp. 4104–4108.
