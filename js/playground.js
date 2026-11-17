/* 05 · Playground — the full live PSO simulator. */
(function (P) {
  'use strict';
  const U = P.util;
  const $ = (id) => document.getElementById(id);

  const PRESETS = {
    standard: { name: 'Standard', o: { w: 0.729, c1: 1.494, c2: 1.494, inertia: 'constant', topology: 'global', vmax: 0.2 },
      desc: 'Constriction-derived values (Clerc & Kennedy) — the recommended default. A good balance of exploring and refining.' },
    explorer: { name: 'Explorer', o: { w: 0.95, c1: 2.0, c2: 0.9, inertia: 'constant', topology: 'global', vmax: 0.3 },
      desc: 'High momentum and individualism: particles roam widely and converge slowly. Great coverage, poor precision.' },
    greedy: { name: 'Greedy', o: { w: 0.3, c1: 0.6, c2: 2.2, inertia: 'constant', topology: 'global', vmax: 0.2 },
      desc: 'Low inertia and a strong social pull: the swarm collapses quickly onto the first good spot. Watch for premature convergence on Rastrigin!' },
    loners: { name: 'Loners (c₂ = 0)', o: { w: 0.6, c1: 2.0, c2: 0, inertia: 'constant', topology: 'global', vmax: 0.2 },
      desc: 'No communication at all. Each particle is an independent hill-climber that only trusts its own memory — nobody shares discoveries.' },
    herd: { name: 'Herd (c₁ = 0)', o: { w: 0.6, c1: 0, c2: 2.0, inertia: 'constant', topology: 'global', vmax: 0.2 },
      desc: 'No personal memory. Everyone simply rushes toward the current leader — fast, but diversity is lost almost immediately.' },
    unstable: { name: 'Unstable (w > 1)', o: { w: 1.1, c1: 1.5, c2: 1.5, inertia: 'constant', topology: 'global', vmax: 0.3 },
      desc: 'Inertia above 1 amplifies velocity every step, so the swarm never settles. Only the v_max clamp keeps it inside the box.' },
    decay: { name: 'Linear decay', o: { w: 0.9, c1: 2.0, c2: 2.0, inertia: 'linear', topology: 'global', vmax: 0.2 },
      desc: 'w falls from 0.9 to 0.4 over the run (Shi & Eberhart, 1998): explore boldly first, then brake and fine-tune.' },
    ring: { name: 'Ring topology', o: { w: 0.729, c1: 1.494, c2: 1.494, inertia: 'constant', topology: 'ring', vmax: 0.2 },
      desc: 'Each particle follows only the best of its two ring neighbours. Information spreads slowly, so several valleys are explored at once.' },
  };

  const PHASE_INFO = [
    { c: '#22d3ee', t: 'Update velocity', d: 'Every particle combines <b class="c-in">inertia</b>, a pull toward its <b class="c-cog">pbest</b> and a pull toward <b class="c-soc">gbest</b>. The coloured arrows show each component, added tip-to-tail.' },
    { c: '#34d399', t: 'Move: x ← x + v', d: 'Each particle jumps along its new velocity. Particles that would leave the search space bounce back off the walls.' },
    { c: '#5eead4', t: 'Evaluate f(x)', d: 'The objective function is measured at every new position. Rings show the result: <b style="color:#34d399">green = better</b> than its pbest, grey = not better.' },
    { c: '#fbbf24', t: 'Update personal bests', d: 'Particles that improved move their <b class="c-cog">pbest diamond</b> to their current position. The rest keep their old memory.' },
    { c: '#fb7185', t: 'Update global best', d: 'The best of all personal bests becomes <b class="c-soc">gbest</b> — this is what gets shared with the whole swarm next iteration.' },
  ];

  P.initPlayground = function () {
    const section = $('playground');
    const canvas = $('pgCanvas'), canvas3 = $('pg3d'), wrap = $('pgWrap');
    const tip = $('pgTip'), hud = $('pgHud'), chip = $('pgPhaseChip'), banner = $('phaseBanner');
    const narr = $('narrator'), stats = $('pgStats'), insp = $('inspector');
    const codeLines = [...document.querySelectorAll('#pgCode .ln[data-ph]')];

    const S = {
      key: 'rastrigin', seed: (Math.random() * 1e9) | 0, playing: false, speed: 4, acc: 0,
      moveT: 1, moveDur: 0.25, phaseMode: false, lastPhase: -1, view: '2d',
      trails: new Map(), selected: null, hover: null, ripples: [], sparks: [],
      milestones: {}, heat: null, field: null, preset: 'standard',
      chartDirty: true, finished: false,
    };
    const opts = { n: 30, w: 0.729, c1: 1.494, c2: 1.494, vmax: 0.2, maxIter: 150, inertia: 'constant', topology: 'global' };
    let swarm = null;

    /* ---------------- Canvas setup ---------------- */
    let W = 0, H = 0;
    const cv = U.canvas(canvas, (w, h) => { W = w; H = h; });
    const ctx = cv.ctx;
    const s3d = new P.Surface3D(canvas3);
    const sx = (x) => ((x - swarm.lo[0]) / swarm.range[0]) * W;
    const sy = (y) => ((swarm.hi[1] - y) / swarm.range[1]) * H;
    const wx = (px) => swarm.lo[0] + (px / W) * swarm.range[0];
    const wy = (py) => swarm.hi[1] - (py / H) * swarm.range[1];

    /* ---------------- Function picker ---------------- */
    const grid = $('fnGrid');
    P.functionOrder.forEach((k) => {
      const b = document.createElement('button');
      b.className = 'fn-btn'; b.dataset.k = k;
      const c = document.createElement('canvas'); c.width = c.height = 96;
      const th = P.getHeat(k, 96, { contours: 8, relief: 0.6 });
      c.getContext('2d').drawImage(th.img, 0, 0);
      b.appendChild(c);
      b.appendChild(document.createTextNode(P.functions[k].name));
      b.addEventListener('click', () => setFunction(k));
      grid.appendChild(b);
    });

    function setFunction(k) {
      S.key = k;
      grid.querySelectorAll('.fn-btn').forEach((b) => b.classList.toggle('active', b.dataset.k === k));
      const fn = P.functions[k];
      $('fnInfo').innerHTML = `<div class="formula">${fn.formula}</div><div class="ftag">${fn.tag}</div><p>${fn.desc}</p>
        <p style="margin-top:6px;font-family:var(--mono);font-size:.72rem;color:var(--dim)">domain x ∈ [${fn.x[0]}, ${fn.x[1]}], y ∈ [${fn.y[0]}, ${fn.y[1]}] · f* = ${fn.fmin}</p>`;
      const h = P.getHeat(k, 560, { contours: 16, relief: 0.55 });
      S.heat = h.img; S.field = h.field;
      s3d.setFunction(fn, h.field);
      if (!swarm) swarm = new P.Swarm(fn, Object.assign({}, opts, { seed: S.seed }));
      else swarm.setFunction(fn, false);
      reset();
    }

    /* ---------------- Controls ---------------- */
    const f2 = (v) => v.toFixed(2), f3 = (v) => v.toFixed(3);
    const ctl = {
      w: U.bindRange($('pw'), $('pwO'), f3, (v) => { opts.w = v; swarm.o.w = v; markCustom(); }),
      c1: U.bindRange($('pc1'), $('pc1O'), f3, (v) => { opts.c1 = v; swarm.o.c1 = v; markCustom(); }),
      c2: U.bindRange($('pc2'), $('pc2O'), f3, (v) => { opts.c2 = v; swarm.o.c2 = v; markCustom(); }),
      vmax: U.bindRange($('pvm'), $('pvmO'), (v) => Math.round(v * 100) + '%', (v) => { opts.vmax = v; swarm.o.vmax = v; markCustom(); }),
      n: U.bindRange($('pn'), $('pnO'), (v) => String(v), (v) => { opts.n = v; reset(); }),
      t: U.bindRange($('pt'), $('ptO'), (v) => String(v), (v) => { opts.maxIter = v; swarm.o.maxIter = v; S.finished = swarm.iter >= v; S.chartDirty = true; }),
      speed: U.bindRange($('ps'), $('psO'), (v) => v + '/s', (v) => { S.speed = v; }),
    };
    const inertiaSeg = U.seg($('inertiaSeg'), (v) => { opts.inertia = v; swarm.o.inertia = v; markCustom(); });
    const topoSeg = U.seg($('topoSeg'), (v) => { opts.topology = v; swarm.o.topology = v; markCustom(); say(`Topology switched to <b>${v === 'ring' ? 'Ring (lbest)' : 'Global (gbest)'}</b>.`, '#8b7cff'); });
    function markCustom() { if (!S.applying) { S.preset = null; renderPresets(); $('presetDesc').textContent = 'Custom settings — changes apply live to the running swarm.'; } }

    const presetGrid = $('presetGrid');
    function renderPresets() {
      presetGrid.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.k === S.preset));
    }
    Object.keys(PRESETS).forEach((k) => {
      const b = document.createElement('button'); b.dataset.k = k; b.textContent = PRESETS[k].name;
      b.addEventListener('click', () => applyPreset(k));
      presetGrid.appendChild(b);
    });
    function applyPreset(k) {
      const p = PRESETS[k];
      S.applying = true;
      ctl.w.set(p.o.w, true); ctl.c1.set(p.o.c1, true); ctl.c2.set(p.o.c2, true); ctl.vmax.set(p.o.vmax, true);
      inertiaSeg.set(p.o.inertia, true); topoSeg.set(p.o.topology, true);
      Object.assign(opts, p.o);
      S.applying = false;
      S.preset = k; renderPresets();
      $('presetDesc').textContent = p.desc;
      reset();
      say(`Preset <b>${p.name}</b> applied: w=${p.o.w}, c₁=${p.o.c1}, c₂=${p.o.c2}${p.o.inertia === 'linear' ? ' (decaying)' : ''}.`, '#fbbf24');
    }

    const show = {};
    [['trails', 'dTrails'], ['vel', 'dVel'], ['pbest', 'dPbest'], ['social', 'dSocial'], ['opt', 'dOpt']].forEach(([k, id]) => {
      const el = $(id); show[k] = el.checked; el.addEventListener('change', () => { show[k] = el.checked; });
    });

    const viewSeg = U.seg($('viewSeg'), (v) => {
      S.view = v;
      canvas.style.display = v === '2d' ? 'block' : 'none';
      canvas3.style.display = v === '3d' ? 'block' : 'none';
      tip.classList.remove('show');
      requestAnimationFrame(() => { s3d.cv.refresh(); cv.refresh(); });
    });
    void viewSeg;

    const playBtn = $('pgPlay');
    function setPlaying(p) {
      if (p && S.finished) reset();
      S.playing = p;
      if (p && swarm.phase !== 0) { while (swarm.phase !== 0) runPhase(true); }
      if (p) S.phaseMode = false;
      playBtn.classList.toggle('playing', p);
      playBtn.innerHTML = p
        ? '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg><span>Pause</span>'
        : '<svg viewBox="0 0 24 24"><path d="M7 5v14l12-7z"/></svg><span>Play</span>';
      if (p) setBanner(null);
    }
    playBtn.addEventListener('click', () => setPlaying(!S.playing));
    $('pgStep').addEventListener('click', () => { setPlaying(false); S.phaseMode = false; stepIteration(); setBanner(null); });
    $('pgPhase').addEventListener('click', () => { setPlaying(false); stepPhaseUI(); });
    $('pgReset').addEventListener('click', () => { reset(); });
    $('pgShuffle').addEventListener('click', () => { S.seed = (Math.random() * 1e9) | 0; reset(); say('New random initial swarm generated.', '#8b7cff'); });

    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,select,textarea')) return;
      const r = section.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.bottom < window.innerHeight * 0.4) return;
      const k = e.key.toLowerCase();
      if (k === ' ') { e.preventDefault(); setPlaying(!S.playing); }
      else if (k === 's') { setPlaying(false); stepIteration(); }
      else if (k === 'p') { setPlaying(false); stepPhaseUI(); }
      else if (k === 'r') reset();
    });

    /* ---------------- Simulation control ---------------- */
    function reset() {
      if (!swarm) return;
      Object.assign(swarm.o, opts);
      swarm.reset(S.seed);
      S.trails = new Map(); S.ripples = []; S.sparks = []; S.milestones = {};
      S.moveT = 1; S.lastPhase = -1; S.phaseMode = false; S.finished = false; S.chartDirty = true; S.acc = 0;
      if (S.selected !== null && !swarm.particles.find((p) => p.id === S.selected)) S.selected = null;
      narr.innerHTML = '';
      const fn = P.functions[S.key];
      say(`<b>${swarm.particles.length} particles</b> scattered at random over <b>${fn.name}</b>. Initial best f = ${U.fmt(swarm.gfit)}.`, '#8b7cff', 0);
      setBanner(null);
      renderStats(true); renderInspector();
      if (S.playing) { S.playing = false; setPlaying(true); }
    }

    function runPhase(silent) {
      const ph = swarm.stepPhase();
      if (ph === 1) {
        for (const p of swarm.particles) {
          let tr = S.trails.get(p.id);
          if (!tr) { tr = []; S.trails.set(p.id, tr); }
          tr.push([p.prev[0], p.prev[1]]);
          if (tr.length > 14) tr.shift();
        }
        S.moveT = 0;
      }
      if (ph === 3 && !silent) {
        for (const p of swarm.particles) if (p.improved) S.sparks.push({ x: p.x[0], y: p.x[1], t: 0 });
      }
      if (ph === 4) afterIteration();
      S.lastPhase = ph;
      return ph;
    }

    function stepIteration() {
      if (S.finished) return;
      if (swarm.phase !== 0) { while (swarm.phase !== 0) runPhase(); }
      else { do { runPhase(); } while (swarm.phase !== 0); }
      S.moveDur = Math.min(0.9, 0.85 / S.speed);
    }

    function stepPhaseUI() {
      if (S.finished) reset();
      S.phaseMode = true;
      const ph = runPhase();
      if (ph === 1) S.moveDur = 0.9;
      setBanner(ph);
    }

    function setBanner(ph) {
      if (ph === null || ph === undefined) {
        banner.style.setProperty('--c', '#8b7cff');
        banner.innerHTML = `<div class="pnum">▶</div><div class="anim"><h4>${S.playing ? 'Running continuously' : 'Ready'}</h4><p>${S.playing
          ? 'The highlighted line in “What the code is doing” sweeps through the five phases of every iteration.'
          : 'Press <b>Step phase</b> to walk through one iteration slowly: velocity → move → evaluate → pbest → gbest.'}</p></div>`;
        return;
      }
      const info = PHASE_INFO[ph];
      let extra = '';
      if (ph === 3) extra = ` <b>${swarm.pbestCount}</b> of ${swarm.particles.length} particles improved.`;
      if (ph === 4) {
        const ev = S.lastGbestEvent;
        extra = ev && ev.iter === swarm.iter ? ` <b class="c-soc">New gbest!</b> f improved from ${U.fmt(ev.old)} to <b>${U.fmt(ev.val)}</b>.` : ' No particle beat the current gbest this time.';
        extra += ` Iteration ${swarm.iter} complete.`;
      }
      banner.style.setProperty('--c', info.c);
      banner.innerHTML = `<div class="pnum">${ph + 1}</div><div class="anim"><h4>Phase ${ph + 1} of 5 · ${info.t}</h4><p>${info.d}${extra}</p></div>`;
    }

    /* ---------------- Narrator ---------------- */
    function say(html, color, iter) {
      const d = document.createElement('div');
      d.className = 'nmsg'; d.style.setProperty('--c', color || '#8b7cff');
      d.innerHTML = `<span class="it">it ${iter === undefined ? swarm.iter : iter}</span>${html}`;
      narr.prepend(d);
      while (narr.children.length > 30) narr.lastChild.remove();
    }

    function afterIteration() {
      const it = swarm.iter;
      let biggest = null;
      while (swarm.events.length) {
        const ev = swarm.events.shift();
        if (ev.type === 'gbest') { S.lastGbestEvent = ev; if (!biggest || ev.val < biggest.val) biggest = ev; S.ripples.push({ x: ev.pos[0], y: ev.pos[1], t: 0 }); }
      }
      if (biggest) {
        const pct = isFinite(biggest.old) && Math.abs(biggest.old - swarm.fn.fmin) > 1e-12
          ? (1 - (biggest.val - swarm.fn.fmin) / (biggest.old - swarm.fn.fmin)) * 100 : 0;
        if (it <= 3 || pct > 25 || it % 10 === 0) say(`Particle <b>#${biggest.owner}</b> found a new global best: f = <b>${U.fmt(biggest.val)}</b>${pct > 0 ? ` (error ↓${pct.toFixed(0)}%)` : ''}.`, '#fb7185');
        flashStat('gbest');
      }
      const div = swarm.history.div[swarm.history.div.length - 1];
      const err = swarm.errorOf(swarm.gfit);
      const M = S.milestones;
      if (!M.explore && it >= 3 && div > 0.18) { M.explore = 1; say('Exploration phase: the swarm is spread widely, sampling many regions.', '#22d3ee'); }
      if (!M.converge && div < 0.08 && it > 3) { M.converge = 1; say('The swarm is <b>contracting</b> — shifting from exploration to exploitation around gbest.', '#5eead4'); }
      if (!M.found && err < 1e-3 && swarm.distToOpt(swarm.gbest) < 0.02 * swarm.range[0]) { M.found = 1; say(`<b style="color:#34d399">Global minimum found!</b> error &lt; 0.001 after ${it} iterations and ${swarm.evals} function evaluations.`, '#34d399'); }
      if (!M.premature && div < 0.012 && err > 0.05 * Math.max(1, Math.abs(swarm.fn.fmin)) && !M.found) {
        M.premature = 1; say('<b style="color:#fb7185">Premature convergence:</b> all particles collapsed onto a point that is <i>not</i> the global minimum. Try a higher w, a lower c₂, the Ring topology, or more particles.', '#fb7185');
      }
      if (!M.stag && it - swarm.lastImprove >= 30 && !M.found) { M.stag = 1; say(`Stagnation: no improvement for 30 iterations. The swarm may be stuck in a local minimum.`, '#fbbf24'); }
      if (opts.inertia === 'linear' && it % 25 === 0) say(`Inertia has decayed to w = ${swarm.currentW().toFixed(2)} — the swarm is becoming more ${swarm.currentW() > 0.65 ? 'exploratory' : 'exploitative'}.`, '#22d3ee');
      if (it >= opts.maxIter && !S.finished) {
        S.finished = true; setPlaying(false);
        say(`Finished ${it} iterations. Answer: x = ${U.fmtVec(swarm.gbest, 4)}, f = <b>${U.fmt(swarm.gfit, 5)}</b>${M.found ? ' ✓ global minimum' : ''}. Press Play to run again.`, '#34d399');
      }
      S.chartDirty = true;
      renderStats(); renderInspector();
    }

    /* ---------------- Stats / charts / inspector ---------------- */
    let statEls = null;
    function renderStats(rebuild) {
      if (rebuild || !statEls) {
        stats.innerHTML = ['iter:Iteration', 'gbest:Best f(gbest)', 'err:Error to f*', 'dist:Distance to optimum', 'w:Current w', 'div:Diversity', 'imp:pbest improved', 'evals:Evaluations', 'pos:gbest position:wide']
          .map((s) => { const [k, l, w] = s.split(':'); return `<div class="stat${w ? ' wide' : ''}" data-k="${k}"><small>${l}</small><span></span></div>`; }).join('');
        statEls = {}; stats.querySelectorAll('.stat').forEach((e) => { statEls[e.dataset.k] = e; });
      }
      const set = (k, v) => { statEls[k].querySelector('span').textContent = v; };
      set('iter', `${swarm.iter} / ${opts.maxIter}`);
      set('gbest', U.fmt(swarm.gfit, 4));
      set('err', U.fmt(swarm.errorOf(swarm.gfit), 4));
      set('dist', U.fmt(swarm.distToOpt(swarm.gbest), 3));
      set('w', swarm.currentW().toFixed(3));
      set('div', (swarm.history.div[swarm.history.div.length - 1] * 100).toFixed(1) + '%');
      set('imp', `${swarm.iter ? swarm.pbestCount : '—'} / ${swarm.particles.length}`);
      set('evals', swarm.evals.toLocaleString());
      set('pos', U.fmtVec(swarm.gbest, 4));
    }
    function flashStat(k) { const e = statEls && statEls[k]; if (!e) return; e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); }

    const cConv = U.canvas($('chartConv'), () => { S.chartDirty = true; });
    const cDiv = U.canvas($('chartDiv'), () => { S.chartDirty = true; });
    function drawChart(c, data, opt) {
      const g = c.ctx, w = c.w, h = c.h;
      if (!w) return;
      g.clearRect(0, 0, w, h);
      const L = 40, R = 8, T = 8, B = 18;
      const n = Math.max(opts.maxIter, data.length - 1, 10);
      let vals = data.map(opt.map);
      let lo = Math.min(...vals), hi = Math.max(...vals);
      if (opt.fixLo !== undefined) lo = Math.min(lo, opt.fixLo);
      if (hi - lo < 1e-9) { hi += 1; lo -= opt.log ? 1 : 0; }
      const X = (i) => L + (i / n) * (w - L - R), Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (h - T - B);
      g.font = '500 9px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(154,163,199,0.7)'; g.textAlign = 'right'; g.textBaseline = 'middle';
      g.strokeStyle = 'rgba(140,150,255,0.08)'; g.lineWidth = 1;
      for (let k = 0; k <= 3; k++) {
        const v = lo + ((hi - lo) * k) / 3, y = Y(v);
        g.beginPath(); g.moveTo(L, y); g.lineTo(w - R, y); g.stroke();
        g.fillText(opt.label(v), L - 5, y);
      }
      g.textAlign = 'center'; g.textBaseline = 'top';
      g.fillText('0', L, h - B + 5); g.fillText(String(n), w - R - 8, h - B + 5); g.fillText('iteration', (L + w) / 2, h - B + 5);
      if (vals.length < 1) return;
      const grd = g.createLinearGradient(0, T, 0, h - B);
      grd.addColorStop(0, U.rgba(opt.color, 0.35)); grd.addColorStop(1, U.rgba(opt.color, 0));
      g.beginPath(); g.moveTo(X(0), h - B);
      vals.forEach((v, i) => g.lineTo(X(i), Y(v)));
      g.lineTo(X(vals.length - 1), h - B); g.closePath(); g.fillStyle = grd; g.fill();
      g.beginPath(); vals.forEach((v, i) => (i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v))));
      g.strokeStyle = U.rgba(opt.color, 1); g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
      const lx = X(vals.length - 1), ly = Y(vals[vals.length - 1]);
      g.globalCompositeOperation = 'lighter'; U.drawGlow(g, U.glow(opt.color, 10), lx, ly, 12); g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#fff'; g.beginPath(); g.arc(lx, ly, 2.5, 0, U.TAU); g.fill();
    }
    function drawCharts() {
      drawChart(cConv, swarm.history.best, {
        map: (v) => Math.log10(Math.max(1e-10, swarm.errorOf(v))), log: true, color: U.C.soc,
        label: (v) => Math.pow(10, v).toExponential(0).replace('e+', 'e'),
      });
      drawChart(cDiv, swarm.history.div, { map: (v) => v * 100, fixLo: 0, color: U.C.in, label: (v) => v.toFixed(0) + '%' });
      S.chartDirty = false;
    }

    function renderInspector() {
      const p = S.selected !== null ? swarm.particles.find((q) => q.id === S.selected) : null;
      if (!p) { insp.innerHTML = '<p class="empty">Click any particle on the map to see the forces acting on it. Its arrows will be drawn live on the map.</p>'; return; }
      const m = (v) => Math.hypot(v[0], v[1]);
      const a = m(p.comp.in), b = m(p.comp.cog), c = m(p.comp.soc), mx = Math.max(a, b, c, 1e-9);
      const tot = a + b + c || 1;
      let verdict = 'Not moved yet — step the simulation.';
      if (swarm.iter > 0) {
        if (a / tot > 0.5) verdict = 'Mostly <b class="c-in">coasting on momentum</b> — still exploring.';
        else if (c / tot > 0.5) verdict = 'Mostly <b class="c-soc">following the swarm</b> toward gbest.';
        else if (b / tot > 0.5) verdict = 'Mostly <b class="c-cog">returning to its own best</b> memory.';
        else verdict = 'A balanced mix of all three forces.';
        if (tot < 1e-3 * swarm.range[0]) verdict = 'Almost stationary — it has <b>converged</b>.';
        if (p.id === swarm.gOwner) verdict += ' It currently <b class="c-soc">owns gbest</b> — the leader!';
      }
      insp.innerHTML = `<div class="insp-meta">Particle <b>#${p.id}</b> · age ${p.age}<br>x = <b>${U.fmtVec(p.x, 3)}</b> · f = <b>${U.fmt(p.fit, 4)}</b><br>
        v = ${U.fmtVec(p.v, 3)} · |v| = ${U.fmt(m(p.v), 3)}<br>pbest f = <b class="c-cog">${U.fmt(p.pf, 4)}</b> · r₁ = ${p.r1[0].toFixed(2)}, r₂ = ${p.r2[0].toFixed(2)}</div>
        <div class="force" style="--c:var(--in)"><span>inertia</span><div class="bar"><i style="width:${(a / mx) * 100}%"></i></div><span>${U.fmt(a, 2)}</span></div>
        <div class="force" style="--c:var(--cog)"><span>cognitive</span><div class="bar"><i style="width:${(b / mx) * 100}%"></i></div><span>${U.fmt(b, 2)}</span></div>
        <div class="force" style="--c:var(--soc)"><span>social</span><div class="bar"><i style="width:${(c / mx) * 100}%"></i></div><span>${U.fmt(c, 2)}</span></div>
        <div class="insp-verdict">${verdict}</div>`;
    }

    /* ---------------- Mouse ---------------- */
    function pick(px, py) {
      let best = null, bd = 14;
      for (const p of swarm.particles) {
        const d = disp(p), dd = Math.hypot(sx(d[0]) - px, sy(d[1]) - py);
        if (dd < bd) { bd = dd; best = p; }
      }
      return best;
    }
    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const p = pick(px, py);
      S.hover = p ? p.id : null;
      canvas.style.cursor = p ? 'pointer' : 'crosshair';
      const x = wx(px), y = wy(py), f = swarm.fn.f(x, y);
      tip.innerHTML = p
        ? `<b>Particle #${p.id}</b>${p.id === swarm.gOwner ? ' <span class="c-soc">★ leader</span>' : ''}<br>x = ${U.fmtVec(p.x, 3)}<br>f(x) = <b>${U.fmt(p.fit, 4)}</b><br>pbest f = <span class="c-cog">${U.fmt(p.pf, 4)}</span><br><span style="color:var(--dim)">click to inspect</span>`
        : `(${U.fmt(x, 2)}, ${U.fmt(y, 2)})<br>f = <b>${U.fmt(f, 4)}</b><br><span style="color:var(--dim)">click to drop a particle</span>`;
      const tx = px + 16 + 180 > r.width ? px - 196 : px + 16, ty = py + 16 + 110 > r.height ? py - 110 : py + 16;
      tip.style.left = tx + 'px'; tip.style.top = ty + 'px';
      tip.classList.add('show');
    });
    canvas.addEventListener('pointerleave', () => { tip.classList.remove('show'); S.hover = null; });
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const p = pick(px, py);
      if (p) { S.selected = S.selected === p.id ? null : p.id; renderInspector(); return; }
      const np = swarm.addParticle(wx(px), wy(py));
      S.sparks.push({ x: np.x[0], y: np.x[1], t: 0, c: 'add' });
      say(`You dropped particle <b>#${np.id}</b> at ${U.fmtVec(np.x, 2)} (f = ${U.fmt(np.fit, 3)}).${swarm.gOwner === np.id ? ' <b class="c-soc">It is the new gbest!</b>' : ''}`, '#5eead4');
      while (swarm.events.length) { const ev = swarm.events.shift(); S.ripples.push({ x: ev.pos[0], y: ev.pos[1], t: 0 }); }
      renderStats();
    });

    /* ---------------- Rendering ---------------- */
    function disp(p) {
      const a = U.easeInOut(U.clamp(S.moveT, 0, 1));
      return [U.lerp(p.prev[0], p.x[0], a), U.lerp(p.prev[1], p.x[1], a)];
    }
    const spr = {
      core: U.glow(U.C.white, 6), halo: U.glow(U.C.in, 14), sel: U.glow(U.C.cog, 26),
      soc: U.glow(U.C.soc, 34), res: U.glow(U.C.res, 16), cog: U.glow(U.C.cog, 12), acc2: U.glow(U.C.acc2, 14),
    };

    function draw2D(dt, t) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(S.heat, 0, 0, W, H);
      const ps = swarm.particles, fn = swarm.fn;
      const D = new Map(); ps.forEach((p) => D.set(p.id, disp(p)));
      const phaseView = S.phaseMode ? S.lastPhase : -1;

      // true optimum
      if (show.opt) for (const m of fn.minima) {
        const x = sx(m[0]), y = sy(m[1]);
        ctx.strokeStyle = 'rgba(94,234,212,0.85)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x - 3, y); ctx.moveTo(x + 3, y); ctx.lineTo(x + 9, y);
        ctx.moveTo(x, y - 9); ctx.lineTo(x, y - 3); ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 9); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 12 + Math.sin(t * 2) * 1.5, 0, U.TAU); ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
      }

      // social links
      if (show.social || phaseView === 4) {
        ctx.lineWidth = 1;
        for (const p of ps) {
          const d = D.get(p.id), tgt = opts.topology === 'ring' && p.social ? p.social : swarm.gbest;
          ctx.strokeStyle = phaseView === 4 ? 'rgba(251,113,133,0.28)' : 'rgba(251,113,133,0.14)';
          ctx.beginPath(); ctx.moveTo(sx(d[0]), sy(d[1])); ctx.lineTo(sx(tgt[0]), sy(tgt[1])); ctx.stroke();
        }
      }
      // pbest memories
      if (show.pbest || phaseView === 3) {
        ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
        for (const p of ps) {
          const d = D.get(p.id);
          ctx.strokeStyle = 'rgba(251,191,36,0.22)';
          ctx.beginPath(); ctx.moveTo(sx(d[0]), sy(d[1])); ctx.lineTo(sx(p.pb[0]), sy(p.pb[1])); ctx.stroke();
        }
        ctx.setLineDash([]);
        for (const p of ps) {
          const hl = phaseView === 3 && p.improved;
          ctx.fillStyle = hl ? '#fde68a' : 'rgba(251,191,36,0.85)';
          U.diamond(ctx, sx(p.pb[0]), sy(p.pb[1]), hl ? 5.5 : 3.6); ctx.fill();
        }
      }
      // trails
      if (show.trails) {
        const maxL = 14;
        for (let k = 0; k < maxL; k++) {
          ctx.beginPath();
          let any = false;
          for (const p of ps) {
            const tr = S.trails.get(p.id); if (!tr || tr.length <= k) continue;
            const idx = tr.length - 1 - k;
            const a = tr[idx], b = k === 0 ? D.get(p.id) : tr[idx + 1];
            ctx.moveTo(sx(a[0]), sy(a[1])); ctx.lineTo(sx(b[0]), sy(b[1])); any = true;
          }
          if (any) { ctx.strokeStyle = `rgba(125,211,252,${0.55 * (1 - k / maxL)})`; ctx.lineWidth = Math.max(0.6, 2 - k * 0.12); ctx.stroke(); }
        }
      }
      // velocity components (phase 1) or plain velocity arrows
      const scale = W / swarm.range[0];
      if (phaseView === 0) {
        for (const p of ps) {
          const x0 = sx(p.x[0]), y0 = sy(p.x[1]);
          const a = [x0 + p.comp.in[0] * scale, y0 - p.comp.in[1] * scale];
          const b = [a[0] + p.comp.cog[0] * scale, a[1] - p.comp.cog[1] * scale];
          const c = [b[0] + p.comp.soc[0] * scale, b[1] - p.comp.soc[1] * scale];
          U.arrow(ctx, x0, y0, a[0], a[1], 'rgba(34,211,238,0.95)', 1.8, 7);
          U.arrow(ctx, a[0], a[1], b[0], b[1], 'rgba(251,191,36,0.95)', 1.8, 7);
          U.arrow(ctx, b[0], b[1], c[0], c[1], 'rgba(251,113,133,0.95)', 1.8, 7);
          U.arrow(ctx, x0, y0, sx(p.x[0] + p.v[0]), sy(p.x[1] + p.v[1]), 'rgba(52,211,153,0.9)', 2.4, 8, [4, 3]);
        }
      } else if (show.vel) {
        for (const p of ps) {
          const d = D.get(p.id);
          U.arrow(ctx, sx(d[0]), sy(d[1]), sx(d[0] + p.v[0] * 0.8), sy(d[1] + p.v[1] * 0.8), 'rgba(52,211,153,0.8)', 1.5, 6);
        }
      }

      // selected particle: live decomposition
      const sel = S.selected !== null ? ps.find((p) => p.id === S.selected) : null;
      if (sel && phaseView !== 0) {
        const d = D.get(sel.id), x0 = sx(d[0]), y0 = sy(d[1]);
        const a = [x0 + sel.comp.in[0] * scale, y0 - sel.comp.in[1] * scale];
        const b = [a[0] + sel.comp.cog[0] * scale, a[1] - sel.comp.cog[1] * scale];
        const c = [b[0] + sel.comp.soc[0] * scale, b[1] - sel.comp.soc[1] * scale];
        if (swarm.iter > 0) {
          U.arrow(ctx, x0, y0, a[0], a[1], '#22d3ee', 2.6, 9);
          U.arrow(ctx, a[0], a[1], b[0], b[1], '#fbbf24', 2.6, 9);
          U.arrow(ctx, b[0], b[1], c[0], c[1], '#fb7185', 2.6, 9);
        }
        ctx.strokeStyle = 'rgba(251,191,36,0.9)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(sx(sel.pb[0]), sy(sel.pb[1])); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x0, y0, 13 + Math.sin(t * 5) * 2, 0, U.TAU); ctx.stroke();
        U.label(ctx, '#' + sel.id, x0, y0 - 24, '#fbbf24');
      }

      // particles
      ctx.globalCompositeOperation = 'lighter';
      for (const p of ps) {
        const d = D.get(p.id), x = sx(d[0]), y = sy(d[1]);
        U.drawGlow(ctx, spr.halo, x, y, p.id === S.hover ? 18 : 12);
        U.drawGlow(ctx, spr.core, x, y, 5);
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const p of ps) {
        const d = D.get(p.id);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx(d[0]), sy(d[1]), 2.3, 0, U.TAU); ctx.fill();
      }
      // evaluation rings (phase 3)
      if (phaseView === 2) {
        for (const p of ps) {
          const better = p.fit < p.pf;
          ctx.strokeStyle = better ? 'rgba(52,211,153,0.95)' : 'rgba(154,163,199,0.55)'; ctx.lineWidth = better ? 2 : 1;
          ctx.beginPath(); ctx.arc(sx(p.x[0]), sy(p.x[1]), better ? 8 : 6, 0, U.TAU); ctx.stroke();
        }
        if (ps.length <= 40) for (const p of ps) {
          ctx.font = '500 9px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(232,234,246,0.85)'; ctx.textAlign = 'center';
          ctx.fillText(U.fmt(p.fit, 2), sx(p.x[0]), sy(p.x[1]) - 11);
        }
      }

      // gbest
      if (swarm.gbest) {
        const gx = sx(swarm.gbest[0]), gy = sy(swarm.gbest[1]);
        ctx.globalCompositeOperation = 'lighter';
        U.drawGlow(ctx, spr.soc, gx, gy, (phaseView === 4 ? 48 : 34) + Math.sin(t * 4) * 4);
        ctx.globalCompositeOperation = 'source-over';
        U.star(ctx, gx, gy, 10, t * 1.1, '#ffe1e7');
        ctx.strokeStyle = 'rgba(251,113,133,0.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(gx, gy, 16, t * 2, t * 2 + 1.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(gx, gy, 16, t * 2 + Math.PI, t * 2 + Math.PI + 1.2); ctx.stroke();
        U.label(ctx, 'gbest ' + U.fmt(swarm.gfit, 3), gx, gy + (gy > H - 40 ? -28 : 28), '#fb7185');
      }

      // ripples & sparks
      S.ripples = S.ripples.filter((r) => (r.t += dt) < 1.2);
      for (const r of S.ripples) {
        const e = U.easeOut(r.t / 1.2);
        ctx.strokeStyle = `rgba(251,113,133,${0.8 * (1 - e)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx(r.x), sy(r.y), 8 + e * 60, 0, U.TAU); ctx.stroke();
      }
      S.sparks = S.sparks.filter((s) => (s.t += dt) < 0.9);
      ctx.globalCompositeOperation = 'lighter';
      for (const s of S.sparks) {
        const e = s.t / 0.9, x = sx(s.x), y = sy(s.y);
        U.drawGlow(ctx, s.c === 'add' ? spr.acc2 : spr.cog, x, y, 14 * (1 - e) + 6);
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * U.TAU + s.x, r = 4 + e * 14;
          ctx.fillStyle = s.c === 'add' ? `rgba(94,234,212,${1 - e})` : `rgba(251,191,36,${1 - e})`;
          ctx.fillRect(x + Math.cos(a) * r - 1, y + Math.sin(a) * r - 1, 2, 2);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    let lastHud = '';
    U.loop(section, (dt, t) => {
      if (!swarm || !W) return;
      // advance simulation
      if (S.playing) {
        S.acc += dt;
        const interval = 1 / S.speed;
        S.moveDur = Math.min(0.9, interval * 0.92);
        let guard = 0;
        while (S.acc >= interval && guard++ < 4 && S.playing) { S.acc -= interval; stepIteration(); }
        if (guard >= 4) S.acc = 0;
      }
      S.moveT = Math.min(1, S.moveT + dt / S.moveDur);

      if (S.view === '2d') draw2D(dt, t);
      else {
        const parts = swarm.particles.map((p) => { const d = disp(p); return { dx: d[0], dy: d[1], sel: p.id === S.selected }; });
        s3d.draw(dt, t, parts, swarm.gbest, { showOpt: show.opt });
      }

      // code highlight
      let ph = -1;
      if (S.phaseMode) ph = S.lastPhase;
      else if (S.playing) ph = Math.min(4, Math.floor((S.acc * S.speed) * 5));
      codeLines.forEach((l) => l.classList.toggle('hl', +l.dataset.ph === ph));
      const info = ph >= 0 ? PHASE_INFO[ph] : null;
      const chipTxt = S.finished ? 'finished' : info ? info.t.toLowerCase() : S.playing ? 'running' : 'paused';
      const h = `${chipTxt}|${info ? info.c : ''}`;
      if (h !== lastHud) {
        lastHud = h;
        chip.style.setProperty('--c', info ? info.c : S.finished ? '#34d399' : '#8b7cff');
        chip.querySelector('span').textContent = chipTxt;
      }
      hud.innerHTML = `<b>${P.functions[S.key].name}</b> · iter <b>${swarm.iter}</b>/${opts.maxIter} · N=${swarm.particles.length} · w=${swarm.currentW().toFixed(2)}`;
      if (S.chartDirty) drawCharts();
    });

    // initial state
    setFunction('rastrigin');
    S.preset = 'standard'; renderPresets(); $('presetDesc').textContent = PRESETS.standard.desc;
    setBanner(null);
    P.playground = { setFunction, applyPreset, setPlaying };
  };
})(window.PSO);
