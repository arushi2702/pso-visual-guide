/* Benchmark objective functions + colour map + heat-map rendering. */
(function (P) {
  'use strict';
  const U = P.util;
  const PI = Math.PI, TAU = Math.PI * 2;

  P.functions = {
    sphere: {
      name: 'Sphere', x: [-5.12, 5.12], y: [-5.12, 5.12], scale: 'sqrt',
      f: (x, y) => x * x + y * y,
      minima: [[0, 0]], fmin: 0,
      formula: 'f(x, y) = x² + y²',
      tag: 'Unimodal · easy',
      desc: 'A perfectly smooth bowl with one minimum at the origin. Every downhill direction leads to the answer — ideal for seeing pure convergence.',
    },
    rastrigin: {
      name: 'Rastrigin', x: [-5.12, 5.12], y: [-5.12, 5.12], scale: 'lin',
      f: (x, y) => 20 + x * x - 10 * Math.cos(TAU * x) + y * y - 10 * Math.cos(TAU * y),
      minima: [[0, 0]], fmin: 0,
      formula: 'f = 20 + Σ [xᵢ² − 10·cos(2πxᵢ)]',
      tag: 'Multimodal · ~100 local minima',
      desc: 'A bowl covered by a regular grid of bumps. A lone searcher gets trapped in the first dip; the swarm has to cooperate to hop between valleys to the centre.',
    },
    ackley: {
      name: 'Ackley', x: [-5, 5], y: [-5, 5], scale: 'lin',
      f: (x, y) => -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y))) - Math.exp(0.5 * (Math.cos(TAU * x) + Math.cos(TAU * y))) + Math.E + 20,
      minima: [[0, 0]], fmin: 0,
      formula: 'f = −20e^(−0.2√(½Σxᵢ²)) − e^(½Σcos 2πxᵢ) + e + 20',
      tag: 'Multimodal · flat & rippled',
      desc: 'A nearly flat outer plateau full of small ripples, with a deep narrow hole in the middle. Tests whether the swarm can escape a deceptive plateau.',
    },
    rosenbrock: {
      name: 'Rosenbrock', x: [-2, 2], y: [-1, 3], scale: 'log',
      f: (x, y) => (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x),
      minima: [[1, 1]], fmin: 0,
      formula: 'f = (1 − x)² + 100(y − x²)²',
      tag: 'Unimodal · narrow curved valley',
      desc: 'The "banana valley". Finding the curved valley is easy; crawling along its almost-flat floor to the minimum at (1, 1) is hard.',
    },
    himmelblau: {
      name: 'Himmelblau', x: [-5, 5], y: [-5, 5], scale: 'log',
      f: (x, y) => (x * x + y - 11) ** 2 + (x + y * y - 7) ** 2,
      minima: [[3, 2], [-2.805118, 3.131312], [-3.77931, -3.283186], [3.584428, -1.848126]], fmin: 0,
      formula: 'f = (x² + y − 11)² + (x + y² − 7)²',
      tag: 'Four equal global minima',
      desc: 'Four identical global minima. Which one will the swarm pick? Press "New swarm" a few times — the random start decides.',
    },
    griewank: {
      name: 'Griewank', x: [-12, 12], y: [-12, 12], scale: 'lin',
      f: (x, y) => 1 + (x * x + y * y) / 4000 - Math.cos(x) * Math.cos(y / Math.SQRT2),
      minima: [[0, 0]], fmin: 0,
      formula: 'f = 1 + Σxᵢ²/4000 − Π cos(xᵢ/√i)',
      tag: 'Multimodal · near-equal minima',
      desc: 'Gentle ripples on a very wide bowl. Many local minima are almost as good as the global one, so they are hard to tell apart.',
    },
    schwefel: {
      name: 'Schwefel', x: [-500, 500], y: [-500, 500], scale: 'lin',
      f: (x, y) => 418.9829 * 2 - x * Math.sin(Math.sqrt(Math.abs(x))) - y * Math.sin(Math.sqrt(Math.abs(y))),
      minima: [[420.9687, 420.9687]], fmin: 0,
      formula: 'f = 418.98·n − Σ xᵢ·sin(√|xᵢ|)',
      tag: 'Deceptive · best is far from 2nd best',
      desc: 'Highly deceptive: the best region sits in a far corner, while the second-best regions are far away from it. Greedy search is easily fooled.',
    },
    eggholder: {
      name: 'Eggholder', x: [-512, 512], y: [-512, 512], scale: 'lin',
      f: (x, y) => -(y + 47) * Math.sin(Math.sqrt(Math.abs(x / 2 + (y + 47)))) - x * Math.sin(Math.sqrt(Math.abs(x - (y + 47)))),
      minima: [[512, 404.2319]], fmin: -959.6407,
      formula: 'f = −(y+47)sin√|x/2+y+47| − x·sin√|x−(y+47)|',
      tag: 'Rugged · minimum at the edge',
      desc: 'A rugged, irregular landscape whose minimum is pressed against the edge of the domain. One of the hardest classic 2-D tests.',
    },
  };
  P.functionOrder = ['sphere', 'rastrigin', 'ackley', 'rosenbrock', 'himmelblau', 'griewank', 'schwefel', 'eggholder'];

  /* ---------- Colour map: low (good) = deep navy, high (bad) = warm pink ---------- */
  const stops = [
    [0.0, [3, 7, 22]], [0.1, [8, 22, 58]], [0.26, [18, 48, 108]], [0.44, [42, 76, 156]],
    [0.6, [86, 86, 178]], [0.75, [138, 92, 180]], [0.88, [196, 110, 172]], [1.0, [246, 168, 186]],
  ];
  const LUT = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [t0, c0] = stops[k], [t1, c1] = stops[k + 1];
    const u = U.clamp((t - t0) / (t1 - t0), 0, 1);
    for (let c = 0; c < 3; c++) LUT[i * 3 + c] = c0[c] + (c1[c] - c0[c]) * u;
  }
  P.palette = function (t) {
    const i = (U.clamp(t, 0, 1) * 255) | 0;
    return [LUT[i * 3], LUT[i * 3 + 1], LUT[i * 3 + 2]];
  };

  /** Sampled field of a function with a normalising transform t(v) ∈ [0,1]. */
  P.Field = class {
    constructor(fn, res) {
      this.fn = fn; this.res = res;
      const [x0, x1] = fn.x, [y0, y1] = fn.y;
      const vals = new Float32Array(res * res);
      let mn = Infinity, mx = -Infinity;
      for (let j = 0; j < res; j++) {
        const y = y1 - ((j + 0.5) / res) * (y1 - y0);
        for (let i = 0; i < res; i++) {
          const x = x0 + ((i + 0.5) / res) * (x1 - x0);
          const v = fn.f(x, y);
          vals[j * res + i] = v;
          if (v < mn) mn = v; if (v > mx) mx = v;
        }
      }
      this.vals = vals;
      this.min = Math.min(mn, fn.fmin);
      this.max = mx;
    }
    t(v) {
      const d = Math.max(0, v - this.min), R = Math.max(1e-12, this.max - this.min);
      switch (this.fn.scale) {
        case 'log': return U.clamp(Math.log1p(d) / Math.log1p(R), 0, 1);
        case 'sqrt': return U.clamp(Math.sqrt(d / R), 0, 1);
        default: return U.clamp(d / R, 0, 1);
      }
    }
  };

  /**
   * Render a field into an offscreen canvas with hill-shading and contour lines.
   * opts: {contours: number of bands, relief: strength}
   */
  P.heatmap = function (field, opts) {
    opts = opts || {};
    const res = field.res, bands = opts.contours === undefined ? 14 : opts.contours, relief = opts.relief === undefined ? 0.55 : opts.relief;
    const cv = document.createElement('canvas');
    cv.width = cv.height = res;
    const g = cv.getContext('2d');
    const img = g.createImageData(res, res), d = img.data;
    const T = new Float32Array(res * res);
    for (let k = 0; k < T.length; k++) T[k] = field.t(field.vals[k]);
    // light from top-left
    const L = [-0.55, -0.55, 0.63], ll = Math.hypot(L[0], L[1], L[2]);
    const Lx = L[0] / ll, Ly = L[1] / ll, Lz = L[2] / ll;
    const k1 = res * relief;
    for (let j = 0; j < res; j++) {
      for (let i = 0; i < res; i++) {
        const k = j * res + i, t = T[k];
        const tl = T[k - (i > 0 ? 1 : 0)], tr = T[k + (i < res - 1 ? 1 : 0)];
        const tu = T[k - (j > 0 ? res : 0)], td = T[k + (j < res - 1 ? res : 0)];
        const gx = (tr - tl) * 0.5, gy = (td - tu) * 0.5;
        const nx = -gx * k1, ny = -gy * k1;
        const shade = (nx * Lx + ny * Ly + Lz) / Math.sqrt(nx * nx + ny * ny + 1);
        let s = 0.5 + 0.62 * shade;
        s = U.clamp(s, 0.35, 1.3);
        const li = (U.clamp(t, 0, 1) * 255) | 0;
        let r = LUT[li * 3] * s, gg = LUT[li * 3 + 1] * s, b = LUT[li * 3 + 2] * s;
        if (bands > 0) {
          const tb = t * bands, fr = tb - Math.floor(tb);
          const grad = Math.hypot(gx, gy) * bands + 1e-6;
          const dist = Math.min(fr, 1 - fr) / grad; // in pixels
          if (dist < 1.1) {
            const a = (1 - dist / 1.1) * 0.35;
            r += (255 - r) * a; gg += (255 - gg) * a; b += (255 - b) * a;
          }
        }
        const o = k * 4;
        d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return cv;
  };

  /** Cache heat-maps by function + resolution. */
  const cache = {};
  P.getHeat = function (key, res, opts) {
    const id = key + '|' + res + '|' + JSON.stringify(opts || {});
    if (!cache[id]) {
      const fn = P.functions[key];
      const field = new P.Field(fn, res);
      cache[id] = { field, img: P.heatmap(field, opts) };
    }
    return cache[id];
  };
})(window.PSO);
