/* The PSO engine (2-D), written to be read: each phase of an iteration is its own method. */
(function (P) {
  'use strict';
  const U = P.util;

  P.PHASES = ['velocity', 'position', 'evaluate', 'pbest', 'gbest'];

  class Swarm {
    constructor(fn, opts) {
      this.o = Object.assign({
        n: 30, w: 0.729, c1: 1.494, c2: 1.494, vmax: 0.2,
        topology: 'global', inertia: 'constant', wStart: 0.9, wEnd: 0.4,
        maxIter: 150, boundary: 'reflect', seed: null,
      }, opts || {});
      this.setFunction(fn, false);
      this.reset();
    }

    setFunction(fn, reset) {
      this.fn = fn;
      this.lo = [fn.x[0], fn.y[0]];
      this.hi = [fn.x[1], fn.y[1]];
      if (reset !== false) this.reset();
    }

    get range() { return [this.hi[0] - this.lo[0], this.hi[1] - this.lo[1]]; }

    /** Inertia weight for the current iteration (constant or linearly decreasing). */
    currentW() {
      if (this.o.inertia === 'linear') {
        const t = Math.min(1, this.iter / Math.max(1, this.o.maxIter));
        return this.o.wStart + (this.o.wEnd - this.o.wStart) * t;
      }
      return this.o.w;
    }

    reset(seed) {
      if (seed !== undefined) this.o.seed = seed;
      this.rand = this.o.seed != null ? U.rng(this.o.seed) : Math.random;
      this.iter = 0; this.phase = 0; this.nextId = 0; this.evals = 0;
      this.particles = []; this.events = [];
      this.history = { best: [], div: [], mean: [], w: [] };
      this.gbest = null; this.gfit = Infinity; this.gOwner = -1; this.lastImprove = 0;
      this.pbestCount = 0;
      for (let i = 0; i < this.o.n; i++) this.particles.push(this._make());
      this._updateGbest(true);
      this._record();
    }

    _make(x, y) {
      const r = this.range, vm = this.o.vmax;
      const px = x !== undefined
        ? [x, y]
        : [this.lo[0] + this.rand() * r[0], this.lo[1] + this.rand() * r[1]];
      const v = [(this.rand() * 2 - 1) * r[0] * vm * 0.5, (this.rand() * 2 - 1) * r[1] * vm * 0.5];
      const f = this.fn.f(px[0], px[1]);
      this.evals++;
      return {
        id: this.nextId++, x: px.slice(), prev: px.slice(), v, fit: f,
        pb: px.slice(), pf: f, social: null,
        comp: { in: [0, 0], cog: [0, 0], soc: [0, 0] }, r1: [0, 0], r2: [0, 0],
        improved: false, age: 0,
      };
    }

    addParticle(x, y) {
      const p = this._make(x, y);
      this.particles.push(p);
      if (p.pf < this.gfit) {
        const old = this.gfit;
        this.gfit = p.pf; this.gbest = p.pb.slice(); this.gOwner = p.id;
        this.events.push({ type: 'gbest', iter: this.iter, owner: p.id, old, val: p.pf, pos: this.gbest.slice(), added: true });
      }
      return p;
    }

    /** The position each particle is socially attracted to (gbest, or best of ring neighbours). */
    socialTarget(i) {
      if (this.o.topology === 'ring') {
        const ps = this.particles, n = ps.length;
        let best = ps[i];
        const a = ps[(i - 1 + n) % n], b = ps[(i + 1) % n];
        if (a.pf < best.pf) best = a;
        if (b.pf < best.pf) best = b;
        return best.pb;
      }
      return this.gbest;
    }

    /* ---------- Phase 1: velocity update ---------- */
    phaseVelocity() {
      const w = this.currentW(), c1 = this.o.c1, c2 = this.o.c2, r = this.range;
      const vm = [r[0] * this.o.vmax, r[1] * this.o.vmax];
      this.particles.forEach((p, i) => {
        const s = this.socialTarget(i);
        p.social = s.slice();
        for (let d = 0; d < 2; d++) {
          const r1 = this.rand(), r2 = this.rand();
          p.r1[d] = r1; p.r2[d] = r2;
          const a = w * p.v[d];
          const b = c1 * r1 * (p.pb[d] - p.x[d]);
          const c = c2 * r2 * (s[d] - p.x[d]);
          p.comp.in[d] = a; p.comp.cog[d] = b; p.comp.soc[d] = c;
          p.v[d] = U.clamp(a + b + c, -vm[d], vm[d]);
        }
      });
    }

    /* ---------- Phase 2: position update (with reflecting walls) ---------- */
    phasePosition() {
      for (const p of this.particles) {
        p.prev[0] = p.x[0]; p.prev[1] = p.x[1];
        for (let d = 0; d < 2; d++) {
          let x = p.x[d] + p.v[d];
          const lo = this.lo[d], hi = this.hi[d];
          if (this.o.boundary === 'reflect') {
            if (x < lo) { x = lo + (lo - x); p.v[d] *= -0.5; }
            else if (x > hi) { x = hi - (x - hi); p.v[d] *= -0.5; }
          } else if (x < lo || x > hi) p.v[d] = 0;
          p.x[d] = U.clamp(x, lo, hi);
        }
        p.age++;
      }
    }

    /* ---------- Phase 3: evaluate fitness ---------- */
    phaseEvaluate() {
      for (const p of this.particles) { p.fit = this.fn.f(p.x[0], p.x[1]); this.evals++; }
    }

    /* ---------- Phase 4: update personal bests ---------- */
    phasePbest() {
      let c = 0;
      for (const p of this.particles) {
        p.improved = p.fit < p.pf;
        if (p.improved) { p.pf = p.fit; p.pb[0] = p.x[0]; p.pb[1] = p.x[1]; c++; }
      }
      this.pbestCount = c;
    }

    /* ---------- Phase 5: update global best ---------- */
    phaseGbest() { this._updateGbest(false); }

    _updateGbest(init) {
      let best = null;
      for (const p of this.particles) if (!best || p.pf < best.pf) best = p;
      if (best && best.pf < this.gfit) {
        const old = this.gfit;
        this.gfit = best.pf; this.gbest = best.pb.slice(); this.gOwner = best.id;
        this.lastImprove = this.iter + (init ? 0 : 1);
        if (!init) this.events.push({ type: 'gbest', iter: this.iter + 1, owner: best.id, old, val: best.pf, pos: this.gbest.slice() });
        return true;
      }
      return false;
    }

    /** Run one phase. Returns the phase index that was executed. */
    stepPhase() {
      const ph = this.phase;
      switch (ph) {
        case 0: this.phaseVelocity(); break;
        case 1: this.phasePosition(); break;
        case 2: this.phaseEvaluate(); break;
        case 3: this.phasePbest(); break;
        case 4: this.phaseGbest(); break;
      }
      this.phase = (ph + 1) % 5;
      if (this.phase === 0) { this.iter++; this._record(); }
      return ph;
    }

    /** Finish the current iteration (all remaining phases). */
    step() {
      do { this.stepPhase(); } while (this.phase !== 0);
    }

    diversity() {
      const ps = this.particles, n = ps.length;
      if (!n) return 0;
      let cx = 0, cy = 0;
      for (const p of ps) { cx += p.x[0]; cy += p.x[1]; }
      cx /= n; cy /= n;
      const r = this.range;
      let s = 0;
      for (const p of ps) s += Math.hypot((p.x[0] - cx) / r[0], (p.x[1] - cy) / r[1]);
      return s / n; // fraction of domain size
    }

    errorOf(v) { return Math.max(0, v - this.fn.fmin); }

    distToOpt(pos) {
      let best = Infinity;
      for (const m of this.fn.minima) best = Math.min(best, Math.hypot(pos[0] - m[0], pos[1] - m[1]));
      return best;
    }

    _record() {
      this.history.best.push(this.gfit);
      this.history.div.push(this.diversity());
      let m = 0;
      for (const p of this.particles) m += p.fit;
      this.history.mean.push(m / Math.max(1, this.particles.length));
      this.history.w.push(this.currentW());
    }
  }

  P.Swarm = Swarm;
})(window.PSO);
