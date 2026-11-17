/* 06 · Parameters — three swarms race from identical starts; plus the inertia schedule chart. */
(function (P) {
  'use strict';
  const U = P.util;

  const BASE = { n: 24, w: 0.729, c1: 1.494, c2: 1.494, vmax: 0.2, topology: 'global', inertia: 'constant', maxIter: 80 };
  const CONFIGS = {
    inertia: {
      fn: 'rastrigin',
      panels: [
        { title: 'w = 0.95', sub: 'too much momentum', o: { w: 0.95 } },
        { title: 'w = 0.73', sub: 'balanced', o: { w: 0.729 } },
        { title: 'w = 0.20', sub: 'too little momentum', o: { w: 0.2 } },
      ],
      explain: '<b>High w</b> keeps particles flying: they explore a lot but struggle to settle, so the answer stays imprecise. <b>Low w</b> makes them brake immediately: the swarm collapses within a few iterations — often onto a local minimum (<b>premature convergence</b>). <b>Balanced w</b> explores first, then contracts smoothly onto the best valley.',
    },
    social: {
      fn: 'rastrigin',
      panels: [
        { title: 'c₁ = 2.5 · c₂ = 0', sub: 'loners — no sharing', o: { c1: 2.5, c2: 0, w: 0.6 } },
        { title: 'c₁ = c₂ = 1.49', sub: 'team players', o: { c1: 1.494, c2: 1.494 } },
        { title: 'c₁ = 0 · c₂ = 2.5', sub: 'herd — no memory', o: { c1: 0, c2: 2.5, w: 0.6 } },
      ],
      explain: 'With <b>no social term</b> nobody learns from anybody: it is just N separate searches, each circling its own start. With <b>no cognitive term</b> particles have no memory and stampede after the leader, losing diversity at once. <b>Balancing both</b> lets discoveries spread while particles keep refining their own finds.',
    },
    size: {
      fn: 'rastrigin',
      panels: [
        { title: 'N = 5', sub: 'tiny swarm', o: { n: 5 } },
        { title: 'N = 20', sub: 'typical', o: { n: 20 } },
        { title: 'N = 60', sub: 'large swarm', o: { n: 60 } },
      ],
      explain: 'More particles sample more of the landscape every iteration, so there is a better chance one of them lands in the right basin. The price: each iteration costs N function evaluations. Somewhere around <b>20–50 particles</b> is a common sweet spot.',
    },
    topology: {
      fn: 'schwefel', base: { n: 16, maxIter: 120 }, thr: 1,
      panels: [
        { title: 'Global (gbest)', sub: 'everyone follows the best', o: { topology: 'global' } },
        { title: 'Ring (lbest)', sub: 'follow your 2 neighbours', o: { topology: 'ring' } },
        { title: 'No communication', sub: 'c₂ = 0', o: { c2: 0, c1: 2.0, w: 0.6 } },
      ],
      explain: 'On the deceptive Schwefel landscape the <b>global</b> topology often gets fooled: the whole swarm follows one leader into a wrong corner. The <b>ring</b> spreads news slowly, so different groups explore different regions for longer — slower, but it succeeds more often. With <b>no communication</b> the swarm barely improves at all.',
    },
  };

  P.initCompare = function () {
    const root = document.getElementById('racePanels');
    const explainEl = document.getElementById('raceExplain');
    const iterEl = document.getElementById('raceIter');
    let cfgKey = 'inertia', panels = [], heat = null, seed = 1, rest = 0, acc = 0, moveT = 1;
    const IT = 1 / 8;

    let builtKey = null;
    const RUNS = 40;
    const optsFor = (cfg, i, s) => Object.assign({}, BASE, cfg.base || {}, cfg.panels[i].o, { seed: s });

    /** Many hidden runs from different random starts: a single race is luck, the rate is the trend. */
    function successRates(cfg) {
      return cfg.panels.map((pc, i) => {
        let ok = 0;
        for (let r = 0; r < RUNS; r++) {
          const o = optsFor(cfg, i, 7000 + r);
          const s = new P.Swarm(P.functions[cfg.fn], o);
          for (let k = 0; k < o.maxIter; k++) s.step();
          if (s.errorOf(s.gfit) < (cfg.thr || 0.01)) ok++;
        }
        return ok / RUNS;
      });
    }

    function build() {
      const cfg = CONFIGS[cfgKey];
      heat = P.getHeat(cfg.fn, 320, { contours: 12, relief: 0.55 });
      seed = (Math.random() * 1e9) | 0;
      if (builtKey !== cfgKey) {
        builtKey = cfgKey;
        root.innerHTML = '';
        panels = cfg.panels.map((pc) => {
          const el = document.createElement('div');
          el.className = 'panel race-panel';
          el.innerHTML = `<div class="race-head"><h4>${pc.title}</h4><small>${pc.sub}</small></div>
            <div class="cw r-sq"><canvas></canvas></div>
            <canvas class="spark"></canvas>
            <div class="race-foot"><span>best f = <b class="bf">—</b></span><span class="badge">exploring</span></div>
            <div class="rate"><span>success rate · ${RUNS} runs</span><div class="bar"><i></i></div><b>…</b></div>`;
          root.appendChild(el);
          const c = U.canvas(el.querySelector('.cw canvas'));
          const sp = U.canvas(el.querySelector('.spark'));
          return { el, sw: null, c, sp, bf: el.querySelector('.bf'), badge: el.querySelector('.badge'), rate: el.querySelector('.rate') };
        });
        explainEl.innerHTML = `<b style="color:var(--accent)">What to notice · </b>${cfg.explain}
          <span style="display:block;margin-top:8px;font-size:.85rem;color:var(--dim)">A single race depends on luck. The <b style="color:var(--muted)">success rate</b> under each panel comes from ${RUNS} hidden runs from different random starts (success = error below ${cfg.thr || 0.01}) — that is the real trend.</span>`;
        setTimeout(() => {
          if (builtKey !== cfgKey) return;
          const rates = successRates(cfg), best = Math.max(...rates);
          panels.forEach((pn, i) => {
            const r = rates[i];
            pn.rate.querySelector('b').textContent = Math.round(r * 100) + '%';
            const bar = pn.rate.querySelector('i');
            bar.style.background = r === best ? 'var(--res)' : r < 0.4 ? 'var(--soc)' : 'var(--cog)';
            requestAnimationFrame(() => { bar.style.width = r * 100 + '%'; });
          });
        }, 60);
      }
      // identical seed → identical starting positions in every panel
      panels.forEach((pn, i) => { pn.sw = new P.Swarm(P.functions[cfg.fn], optsFor(cfg, i, seed)); });
      rest = 0; acc = 0; moveT = 1;
    }
    U.seg(document.getElementById('raceSeg'), (v) => { cfgKey = v; build(); });
    document.getElementById('raceRestart').addEventListener('click', build);
    build();

    const halo = U.glow(U.C.in, 9), core = U.glow(U.C.white, 4), soc = U.glow(U.C.soc, 22);

    function status(pn, final, winner) {
      const sw = pn.sw, err = sw.errorOf(sw.gfit), div = sw.history.div[sw.history.div.length - 1];
      if (final) {
        if (winner) return ['best result', 'good'];
        if (err < (CONFIGS[cfgKey].thr || 0.01)) return ["found optimum", "good"];
        if (div < 0.03) return ['trapped', 'bad'];
        return ['unsettled', 'warn'];
      }
      return div > 0.1 ? ['exploring', ''] : ['converging', 'warn'];
    }

    U.loop(root, (dt, t) => {
      const MI = panels.length ? panels[0].sw.o.maxIter : 80;
      const running = panels.length && panels[0].sw.iter < MI;
      if (running) {
        acc += dt;
        if (acc >= IT) { acc = 0; panels.forEach((p) => p.sw.step()); moveT = 0; }
      } else {
        rest += dt;
        if (rest > 5) build();
      }
      moveT = Math.min(1, moveT + dt / (IT * 0.9));
      const a = U.easeInOut(moveT);
      iterEl.textContent = running ? `iteration ${panels[0].sw.iter} / ${MI}` : `finished · next race in ${Math.max(0, 5 - rest).toFixed(0)}s`;

      let winIdx = -1;
      if (!running) { let b = Infinity; panels.forEach((p, i) => { if (p.sw.gfit < b) { b = p.sw.gfit; winIdx = i; } }); }

      panels.forEach((pn, idx) => {
        const { c, sw } = pn, g = c.ctx, W = c.w, H = c.h;
        if (!W) return;
        g.drawImage(heat.img, 0, 0, W, H);
        const X = (x) => ((x - sw.lo[0]) / sw.range[0]) * W, Y = (y) => ((sw.hi[1] - y) / sw.range[1]) * H;
        // optimum
        for (const m of sw.fn.minima) {
          g.strokeStyle = 'rgba(94,234,212,0.7)'; g.lineWidth = 1.2;
          g.beginPath(); g.arc(X(m[0]), Y(m[1]), 7, 0, U.TAU); g.stroke();
        }
        g.globalCompositeOperation = 'lighter';
        for (const p of sw.particles) {
          const x = X(U.lerp(p.prev[0], p.x[0], a)), y = Y(U.lerp(p.prev[1], p.x[1], a));
          U.drawGlow(g, halo, x, y, 9); U.drawGlow(g, core, x, y, 3.5);
        }
        const gx = X(sw.gbest[0]), gy = Y(sw.gbest[1]);
        U.drawGlow(g, soc, gx, gy, 22 + Math.sin(t * 4) * 3);
        g.globalCompositeOperation = 'source-over';
        U.star(g, gx, gy, 7, t, '#ffe1e7');

        // sparkline of log error
        const s = pn.sp, sg = s.ctx;
        if (s.w) {
          sg.clearRect(0, 0, s.w, s.h);
          const vals = sw.history.best.map((v) => Math.log10(Math.max(1e-8, sw.errorOf(v))));
          const lo = -8, hi = Math.max(2, ...vals);
          const XX = (i) => (i / MI) * s.w, YY = (v) => 4 + (1 - (v - lo) / (hi - lo)) * (s.h - 8);
          sg.strokeStyle = 'rgba(140,150,255,0.12)'; sg.beginPath(); sg.moveTo(0, s.h - 1); sg.lineTo(s.w, s.h - 1); sg.stroke();
          sg.beginPath(); vals.forEach((v, i) => (i ? sg.lineTo(XX(i), YY(v)) : sg.moveTo(XX(i), YY(v))));
          sg.strokeStyle = idx === winIdx ? '#34d399' : '#fb7185'; sg.lineWidth = 1.8; sg.stroke();
        }
        pn.bf.textContent = U.fmt(sw.gfit, 4);
        const [txt, cls] = status(pn, !running, idx === winIdx);
        if (pn.badge.textContent !== txt) { pn.badge.textContent = txt; pn.badge.className = 'badge ' + cls; }
        pn.el.classList.toggle('winner', idx === winIdx);
      });
    });

    /* ---------- Inertia schedule chart ---------- */
    const wc = document.getElementById('wSched');
    const ws = U.canvas(wc);
    U.loop(wc, (dt, t) => {
      const g = ws.ctx, W = ws.w, H = ws.h;
      if (!W) return;
      g.clearRect(0, 0, W, H);
      const L = 36, R = 12, T = 14, B = 26;
      const X = (u) => L + u * (W - L - R), Y = (w) => T + (1 - (w - 0.3) / 0.7) * (H - T - B);
      // explore / exploit bands
      const grd = g.createLinearGradient(L, 0, W - R, 0);
      grd.addColorStop(0, 'rgba(34,211,238,0.14)'); grd.addColorStop(1, 'rgba(251,113,133,0.14)');
      g.fillStyle = grd; g.fillRect(L, T, W - L - R, H - T - B);
      g.font = '600 10px "JetBrains Mono", monospace'; g.textBaseline = 'top';
      g.fillStyle = '#22d3ee'; g.textAlign = 'left'; g.fillText('EXPLORE', L + 8, T + 6);
      g.fillStyle = '#fb7185'; g.textAlign = 'right'; g.fillText('EXPLOIT', W - R - 8, T + 6);
      g.strokeStyle = 'rgba(140,150,255,0.1)'; g.fillStyle = 'rgba(154,163,199,0.7)'; g.font = '500 9px "JetBrains Mono", monospace';
      [0.4, 0.6, 0.8, 1.0].forEach((w) => {
        g.beginPath(); g.moveTo(L, Y(w)); g.lineTo(W - R, Y(w)); g.stroke();
        g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(w.toFixed(1), L - 6, Y(w));
      });
      g.textAlign = 'center'; g.textBaseline = 'top';
      g.fillText('t = 0', X(0) + 10, H - B + 6); g.fillText('iteration →', X(0.5), H - B + 6); g.fillText('t = T', X(1) - 12, H - B + 6);
      g.beginPath(); g.moveTo(X(0), Y(0.9)); g.lineTo(X(1), Y(0.4));
      g.strokeStyle = '#8b7cff'; g.lineWidth = 2.5; g.stroke();
      const u = (t * 0.18) % 1, w = 0.9 - 0.5 * u;
      g.globalCompositeOperation = 'lighter'; U.drawGlow(g, U.glow(U.C.acc, 14), X(u), Y(w), 18); g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(u), Y(w), 4, 0, U.TAU); g.fill();
      U.label(g, 'w = ' + w.toFixed(2), X(u), Y(w) - 18, '#c4b5fd');
    });
  };
})(window.PSO);
