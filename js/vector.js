/* 03 · The Equation — an interactive vector diagram of a single velocity update. */
(function (P) {
  'use strict';
  const U = P.util;

  P.initVector = function () {
    const canvas = document.getElementById('vecCanvas');
    const wrap = canvas.parentElement;
    const stageEl = document.getElementById('vecStage');
    const calcEl = document.getElementById('vecCalc');
    const terms = [...document.querySelectorAll('#anatomy .eq-term')];

    const DEF = { x: [-5, -2.6], v: [1.4, 1.1], p: [-2.6, 1.4], g: [1.6, -1.4] };
    const S = {
      x: DEF.x.slice(), v: DEF.v.slice(), p: DEF.p.slice(), g: DEF.g.slice(),
      w: 0.7, c1: 1.5, c2: 1.5, r1: 0.6, r2: 0.45,
      show: [1, 1, 1, 1], build: null, move: null, trail: [], hover: null, drag: null, focus: null, roll: null,
    };

    const sl = {
      w: U.bindRange(document.getElementById('vw'), document.getElementById('vwO'), (v) => v.toFixed(2), (v) => { S.w = v; }),
      c1: U.bindRange(document.getElementById('vc1'), document.getElementById('vc1O'), (v) => v.toFixed(2), (v) => { S.c1 = v; }),
      c2: U.bindRange(document.getElementById('vc2'), document.getElementById('vc2O'), (v) => v.toFixed(2), (v) => { S.c2 = v; }),
      r1: U.bindRange(document.getElementById('vr1'), document.getElementById('vr1O'), (v) => v.toFixed(2), (v) => { S.r1 = v; }),
      r2: U.bindRange(document.getElementById('vr2'), document.getElementById('vr2O'), (v) => v.toFixed(2), (v) => { S.r2 = v; }),
    };

    let W = 0, H = 0, sc = 1;
    const cv = U.canvas(canvas, (w, h) => { W = w; H = h; sc = Math.min(W / 16, H / 10); });
    const ctx = cv.ctx;
    const toS = (p) => [W / 2 + p[0] * sc, H / 2 - p[1] * sc];
    const toW = (px, py) => [(px - W / 2) / sc, -(py - H / 2) / sc];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
    const mul = (a, k) => [a[0] * k, a[1] * k];

    function comps() {
      const inn = mul(S.v, S.w);
      const cog = mul(sub(S.p, S.x), S.c1 * S.r1);
      const soc = mul(sub(S.g, S.x), S.c2 * S.r2);
      const vn = add(add(inn, cog), soc);
      return { inn, cog, soc, vn, xn: add(S.x, vn) };
    }

    const STAGES = [
      { key: 'in', text: 'Step 1/4 · Inertia: begin with the old velocity v, scaled by w' },
      { key: 'cog', text: 'Step 2/4 · Cognitive pull: add a fraction c₁·r₁ of the vector toward pbest' },
      { key: 'soc', text: 'Step 3/4 · Social pull: add a fraction c₂·r₂ of the vector toward gbest' },
      { key: 'res', text: 'Step 4/4 · Their tip-to-tail sum is the new velocity v(t+1)' },
    ];

    function setFocus(k) {
      S.focus = k;
      terms.forEach((t) => t.classList.toggle('hl', t.dataset.term === k));
      calcEl.querySelectorAll('.calc-row').forEach((r) => r.classList.toggle('hl', r.dataset.k === k));
    }
    terms.forEach((t) => {
      t.addEventListener('mouseenter', () => { if (!S.build) setFocus(t.dataset.term); });
      t.addEventListener('mouseleave', () => { if (!S.build) setFocus(null); });
    });

    function renderCalc() {
      const c = comps(), f = (v) => U.fmtVec(v, 2), n = (v) => v.toFixed(2);
      calcEl.innerHTML = `
        <div class="calc-row" data-k="in"><span class="c-in">w·v</span> <span class="k">=</span> ${n(S.w)} × ${f(S.v)} <span class="k">=</span> <b class="c-in">${f(c.inn)}</b></div>
        <div class="calc-row" data-k="cog"><span class="c-cog">c₁r₁(pbest−x)</span> <span class="k">=</span> ${n(S.c1)}×${n(S.r1)} × ${f(sub(S.p, S.x))} <span class="k">=</span> <b class="c-cog">${f(c.cog)}</b></div>
        <div class="calc-row" data-k="soc"><span class="c-soc">c₂r₂(gbest−x)</span> <span class="k">=</span> ${n(S.c2)}×${n(S.r2)} × ${f(sub(S.g, S.x))} <span class="k">=</span> <b class="c-soc">${f(c.soc)}</b></div>
        <div class="calc-row total" data-k="res"><span class="c-res">v(t+1)</span> <span class="k">=</span> <b class="c-res">${f(c.vn)}</b> <span class="k">· |v| = ${Math.hypot(c.vn[0], c.vn[1]).toFixed(2)}</span></div>
        <div class="calc-row" data-k="pos"><span>x(t+1)</span> <span class="k">=</span> ${f(S.x)} + ${f(c.vn)} <span class="k">=</span> <b>${f(c.xn)}</b></div>`;
      if (S.focus) setFocus(S.focus);
    }
    let lastCalc = '';

    /* ---------- Buttons ---------- */
    document.getElementById('vecBuild').addEventListener('click', () => {
      S.move = null; S.build = { t: 0 }; S.show = [0, 0, 0, 0];
    });
    document.getElementById('vecStep').addEventListener('click', () => {
      if (S.move) return;
      S.build = null; S.show = [1, 1, 1, 1];
      const c = comps();
      S.move = { t: 0, from: S.x.slice(), to: [U.clamp(c.xn[0], -7.6, 7.6), U.clamp(c.xn[1], -4.6, 4.6)], vn: c.vn };
    });
    function reroll() {
      S.roll = { t: 0, a: [S.r1, S.r2], b: [Math.random(), Math.random()] };
    }
    document.getElementById('vecRoll').addEventListener('click', reroll);
    document.getElementById('vecReset').addEventListener('click', () => {
      Object.assign(S, { x: DEF.x.slice(), v: DEF.v.slice(), p: DEF.p.slice(), g: DEF.g.slice(), trail: [], build: null, move: null, show: [1, 1, 1, 1] });
      sl.w.set(0.7); sl.c1.set(1.5); sl.c2.set(1.5); sl.r1.set(0.6); sl.r2.set(0.45);
      setFocus(null);
    });

    /* ---------- Dragging ---------- */
    function handles() {
      return [
        { k: 'vtip', p: add(S.x, S.v) },
        { k: 'x', p: S.x }, { k: 'p', p: S.p }, { k: 'g', p: S.g },
      ];
    }
    function hit(px, py) {
      for (const h of handles()) {
        const s = toS(h.p);
        if (Math.hypot(s[0] - px, s[1] - py) < 15) return h.k;
      }
      return null;
    }
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener('pointerdown', (e) => {
      const [px, py] = pos(e); const k = hit(px, py);
      if (k) { S.drag = k; canvas.setPointerCapture(e.pointerId); S.build = null; S.show = [1, 1, 1, 1]; }
    });
    canvas.addEventListener('pointermove', (e) => {
      const [px, py] = pos(e);
      if (S.drag) {
        const w = toW(px, py);
        w[0] = U.clamp(w[0], -7.8, 7.8); w[1] = U.clamp(w[1], -4.8, 4.8);
        if (S.drag === 'vtip') S.v = sub(w, S.x);
        else if (S.drag === 'x') S.x = w;
        else if (S.drag === 'p') S.p = w;
        else if (S.drag === 'g') S.g = w;
      } else {
        S.hover = hit(px, py);
        canvas.style.cursor = S.hover ? 'grab' : 'default';
      }
    });
    const end = () => { S.drag = null; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    /* ---------- Drawing ---------- */
    const sW = U.glow(U.C.white, 22), sCog = U.glow(U.C.cog, 22), sSoc = U.glow(U.C.soc, 26), sRes = U.glow(U.C.res, 22);
    function dimFor(k) { return S.focus && S.focus !== k && S.focus !== 'pos' ? 0.25 : 1; }

    U.loop(wrap, (dt, t) => {
      if (!W) return;
      // animations
      if (S.build) {
        S.build.t += dt;
        const per = 1.25, st = Math.floor(S.build.t / per), fr = (S.build.t % per) / (per * 0.75);
        for (let i = 0; i < 4; i++) S.show[i] = i < st ? 1 : i === st ? U.easeInOut(U.clamp(fr, 0, 1)) : 0;
        if (st < 4) { stageEl.textContent = STAGES[st].text; setFocus(STAGES[st].key); }
        if (S.build.t > per * 4 + 0.8) { S.build = null; S.show = [1, 1, 1, 1]; setFocus(null); stageEl.textContent = 'Done — press "Take the step" to move'; }
      }
      if (S.move) {
        S.move.t += dt / 1.1;
        if (S.move.t >= 1) {
          S.trail.push(S.move.from); if (S.trail.length > 8) S.trail.shift();
          S.x = S.move.to; S.v = S.move.vn; S.move = null;
          stageEl.textContent = 'Moved! The new velocity becomes next step\'s inertia';
          reroll();
        }
      }
      if (S.roll) {
        S.roll.t += dt / 0.6;
        const e = U.easeInOut(Math.min(1, S.roll.t));
        sl.r1.set(U.lerp(S.roll.a[0], S.roll.b[0], e), true); sl.r2.set(U.lerp(S.roll.a[1], S.roll.b[1], e), true);
        S.r1 = +document.getElementById('vr1').value; S.r2 = +document.getElementById('vr2').value;
        if (S.roll.t >= 1) S.roll = null;
      }

      const c = comps();
      const key = [S.x, S.v, S.p, S.g, S.w, S.c1, S.c2, S.r1, S.r2].join('|');
      if (key !== lastCalc) { lastCalc = key; renderCalc(); }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#060918'; ctx.fillRect(0, 0, W, H);
      // grid
      ctx.lineWidth = 1;
      for (let gx = -8; gx <= 8; gx++) {
        ctx.strokeStyle = gx === 0 ? 'rgba(140,150,255,0.22)' : 'rgba(140,150,255,0.07)';
        const s = toS([gx, 0]); ctx.beginPath(); ctx.moveTo(s[0], 0); ctx.lineTo(s[0], H); ctx.stroke();
      }
      for (let gy = -5; gy <= 5; gy++) {
        ctx.strokeStyle = gy === 0 ? 'rgba(140,150,255,0.22)' : 'rgba(140,150,255,0.07)';
        const s = toS([0, gy]); ctx.beginPath(); ctx.moveTo(0, s[1]); ctx.lineTo(W, s[1]); ctx.stroke();
      }

      const moveE = S.move ? U.easeInOut(Math.min(1, S.move.t)) : 0;
      const X = S.move ? [U.lerp(S.move.from[0], S.move.to[0], moveE), U.lerp(S.move.from[1], S.move.to[1], moveE)] : S.x;
      const xs = toS(X);

      // trail
      S.trail.forEach((tp, i) => {
        const s = toS(tp), a = 0.15 + (i / S.trail.length) * 0.4;
        ctx.fillStyle = `rgba(232,247,255,${a})`; ctx.beginPath(); ctx.arc(s[0], s[1], 4, 0, U.TAU); ctx.fill();
        const nx = i < S.trail.length - 1 ? toS(S.trail[i + 1]) : xs;
        ctx.strokeStyle = `rgba(232,247,255,${a * 0.5})`; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(nx[0], nx[1]); ctx.stroke(); ctx.setLineDash([]);
      });

      if (!S.move) {
        const ps = toS(S.p), gs = toS(S.g);
        // full direction vectors (before scaling)
        ctx.globalAlpha = 0.45 * dimFor('cog');
        U.arrow(ctx, xs[0], xs[1], ps[0], ps[1], '#fbbf24', 1.2, 8, [4, 5]);
        ctx.globalAlpha = 0.45 * dimFor('soc');
        U.arrow(ctx, xs[0], xs[1], gs[0], gs[1], '#fb7185', 1.2, 8, [4, 5]);
        ctx.globalAlpha = 1;
        // old velocity
        const vt = toS(add(S.x, S.v));
        ctx.globalAlpha = 0.7 * dimFor('in');
        U.arrow(ctx, xs[0], xs[1], vt[0], vt[1], '#22d3ee', 1.5, 9, [6, 4]);
        ctx.globalAlpha = 1;
        U.label(ctx, 'v (old velocity)', vt[0], vt[1] - 16, '#22d3ee');
        ctx.fillStyle = S.hover === 'vtip' || S.drag === 'vtip' ? '#fff' : '#22d3ee';
        ctx.beginPath(); ctx.arc(vt[0], vt[1], 5.5, 0, U.TAU); ctx.fill();

        // tip-to-tail chain
        const A = add(S.x, mul(c.inn, S.show[0])), B = add(A, mul(c.cog, S.show[1])), C = add(B, mul(c.soc, S.show[2]));
        const As = toS(A), Bs = toS(B), Cs = toS(C);
        const seg = (from, to, col, k, lab, show) => {
          if (show < 0.02) return;
          ctx.globalAlpha = dimFor(k);
          U.arrow(ctx, from[0], from[1], to[0], to[1], col, 3.5, 13);
          if (show > 0.9 && Math.hypot(to[0] - from[0], to[1] - from[1]) > 30) U.label(ctx, lab, (from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - 14, col);
          ctx.globalAlpha = 1;
        };
        seg(xs, As, '#22d3ee', 'in', 'w·v', S.show[0]);
        seg(As, Bs, '#fbbf24', 'cog', 'c₁r₁(pbest−x)', S.show[1]);
        seg(Bs, Cs, '#fb7185', 'soc', 'c₂r₂(gbest−x)', S.show[2]);
        // resultant
        if (S.show[3] > 0.02) {
          const R = toS(add(S.x, mul(c.vn, S.show[3])));
          ctx.globalAlpha = dimFor('res');
          ctx.globalCompositeOperation = 'lighter';
          U.drawGlow(ctx, sRes, R[0], R[1], 26);
          ctx.globalCompositeOperation = 'source-over';
          U.arrow(ctx, xs[0], xs[1], R[0], R[1], '#34d399', 5, 16);
          if (S.show[3] > 0.95) {
            ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(52,211,153,0.8)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(R[0], R[1], 11 + Math.sin(t * 4) * 2, 0, U.TAU); ctx.stroke(); ctx.setLineDash([]);
            U.label(ctx, 'new position', R[0], R[1] + 24, '#34d399');
          }
          ctx.globalAlpha = 1;
        }
      }

      // pbest / gbest markers
      const ps = toS(S.p), gs = toS(S.g);
      ctx.globalCompositeOperation = 'lighter';
      U.drawGlow(ctx, sCog, ps[0], ps[1], 24); U.drawGlow(ctx, sSoc, gs[0], gs[1], 30 + Math.sin(t * 3) * 3);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fbbf24'; U.diamond(ctx, ps[0], ps[1], S.hover === 'p' || S.drag === 'p' ? 10 : 8); ctx.fill();
      U.star(ctx, gs[0], gs[1], S.hover === 'g' || S.drag === 'g' ? 14 : 12, t * 0.8, '#ffd1da');
      U.label(ctx, 'pbest (its own best)', ps[0], ps[1] - 22, '#fbbf24');
      U.label(ctx, 'gbest (swarm best)', gs[0], gs[1] + 24, '#fb7185');
      // particle
      ctx.globalCompositeOperation = 'lighter'; U.drawGlow(ctx, sW, xs[0], xs[1], 26); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(xs[0], xs[1], S.hover === 'x' || S.drag === 'x' ? 9 : 7.5, 0, U.TAU); ctx.fill();
      U.label(ctx, 'x (particle)', xs[0], xs[1] + 22, '#e8f7ff');
    });
  };
})(window.PSO);
