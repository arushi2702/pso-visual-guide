/* 01 · The Problem — a 1-D landscape hidden in fog: blind probing, gradient descent, and a swarm. */
(function (P) {
  'use strict';
  const U = P.util;

  P.initProblem = function () {
    const canvas = document.getElementById('problemCanvas');
    const wrap = canvas.parentElement;
    const cap = document.getElementById('problemCaption');
    const hud = document.getElementById('problemHud');
    const revealEl = document.getElementById('problemReveal');
    const tabs = [...document.querySelectorAll('#problemTabs .tab')];

    const X0 = 0, X1 = 10, NS = 600;
    const g = (x) => 0.055 * (x - 6.6) ** 2 + 0.9 * Math.sin(1.75 * x) + 0.35 * Math.sin(4.2 * x + 1.1);
    const dg = (x) => (g(x + 1e-4) - g(x - 1e-4)) / 2e-4;
    const samples = new Float32Array(NS + 1);
    let gmin = Infinity, gmax = -Infinity, xg = 0;
    for (let i = 0; i <= NS; i++) {
      const x = X0 + (i / NS) * (X1 - X0), v = g(x);
      samples[i] = v;
      if (v < gmin) { gmin = v; xg = x; }
      if (v > gmax) gmax = v;
    }
    const ylo = gmin - 0.35, yhi = gmax + 0.25;
    const ML = 44, MR = 16, MT = 22, MB = 30;

    let W = 0, H = 0, curveImg = null, layer = null, lctx = null;
    let mode = 'probe', reveal = false, hoverX = null;
    let seen = new Float32Array(NS + 1); // fog reveal buffer
    let probes = [];
    let ball = null;
    let swarm = null;
    let capKey = '';

    const sx = (x) => ML + ((x - X0) / (X1 - X0)) * (W - ML - MR);
    const sy = (v) => MT + ((yhi - v) / (yhi - ylo)) * (H - MT - MB);
    const wx = (px) => X0 + ((px - ML) / (W - ML - MR)) * (X1 - X0);

    const cv = U.canvas(canvas, (w, h) => { W = w; H = h; buildCurve(); });
    const ctx = cv.ctx;

    function buildCurve() {
      const d = U.dpr();
      curveImg = document.createElement('canvas');
      curveImg.width = W * d; curveImg.height = H * d;
      const c = curveImg.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      const grd = c.createLinearGradient(0, MT, 0, H - MB);
      grd.addColorStop(0, 'rgba(251,113,133,0.30)');
      grd.addColorStop(0.5, 'rgba(139,124,255,0.22)');
      grd.addColorStop(1, 'rgba(34,211,238,0.05)');
      c.beginPath(); c.moveTo(sx(X0), H - MB);
      for (let i = 0; i <= NS; i++) c.lineTo(sx(X0 + (i / NS) * (X1 - X0)), sy(samples[i]));
      c.lineTo(sx(X1), H - MB); c.closePath(); c.fillStyle = grd; c.fill();
      const lg = c.createLinearGradient(0, MT, 0, H - MB);
      lg.addColorStop(0, '#fb7185'); lg.addColorStop(0.55, '#a78bfa'); lg.addColorStop(1, '#22d3ee');
      c.beginPath();
      for (let i = 0; i <= NS; i++) c.lineTo(sx(X0 + (i / NS) * (X1 - X0)), sy(samples[i]));
      c.strokeStyle = lg; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke();
      layer = document.createElement('canvas');
      layer.width = W * d; layer.height = H * d;
      lctx = layer.getContext('2d'); lctx.setTransform(d, 0, 0, d, 0, 0);
    }

    function see(x, width) {
      width = width || 0.32;
      const i0 = Math.max(0, Math.floor(((x - 3 * width - X0) / (X1 - X0)) * NS));
      const i1 = Math.min(NS, Math.ceil(((x + 3 * width - X0) / (X1 - X0)) * NS));
      for (let i = i0; i <= i1; i++) {
        const xi = X0 + (i / NS) * (X1 - X0), a = Math.exp(-(((xi - x) / width) ** 2));
        if (a > seen[i]) seen[i] = a;
      }
    }

    function setCaption(key, html) {
      if (key === capKey) return;
      capKey = key;
      cap.innerHTML = html;
      cap.classList.remove('fade'); void cap.offsetWidth; cap.classList.add('fade');
    }

    function resetMode() {
      seen = new Float32Array(NS + 1);
      probes = []; capKey = '';
      if (mode === 'descent') startBall(1.65);
      if (mode === 'swarm') startSwarm();
    }

    function setMode(m) {
      mode = m;
      tabs.forEach((t) => t.classList.toggle('active', t.dataset.mode === m));
      reveal = m === 'descent';
      revealEl.checked = reveal;
      resetMode();
    }

    /* ---------- Gradient descent ball ---------- */
    function startBall(x) { ball = { x, trail: [x], still: 0, steps: 0, done: false, acc: 0 }; capKey = ''; }
    function updateBall(dt) {
      if (!ball || ball.done) return;
      ball.acc += dt;
      while (ball.acc > 1 / 30 && !ball.done) {
        ball.acc -= 1 / 30;
        const step = -0.09 * dg(ball.x);
        const s = U.clamp(step, -0.25, 0.25);
        ball.x = U.clamp(ball.x + s, X0, X1);
        ball.steps++;
        see(ball.x, 0.25);
        if (ball.steps % 2 === 0) { ball.trail.push(ball.x); if (ball.trail.length > 40) ball.trail.shift(); }
        if (Math.abs(s) < 4e-4) ball.still++; else ball.still = 0;
        if (ball.still > 12 || ball.steps > 600) ball.done = true;
      }
    }

    /* ---------- 1-D swarm ---------- */
    function startSwarm() {
      const n = 10, parts = [];
      for (let i = 0; i < n; i++) {
        const x = X0 + ((i + Math.random() * 0.8) / n) * (X1 - X0);
        const f = g(x);
        parts.push({ x, prev: x, v: (Math.random() - 0.5) * 0.8, pb: x, pf: f });
        see(x);
      }
      let gi = 0; parts.forEach((p, i) => { if (p.pf < parts[gi].pf) gi = i; });
      swarm = { parts, gb: parts[gi].pb, gf: parts[gi].pf, iter: 0, t: 0, done: false, flash: 0 };
      capKey = '';
    }
    function iterSwarm() {
      const S = swarm;
      for (const p of S.parts) {
        const r1 = Math.random(), r2 = Math.random();
        p.v = 0.62 * p.v + 1.5 * r1 * (p.pb - p.x) + 1.5 * r2 * (S.gb - p.x);
        p.v = U.clamp(p.v, -1.6, 1.6);
        p.prev = p.x;
        p.x = U.clamp(p.x + p.v, X0, X1);
        const f = g(p.x);
        see(p.x);
        if (f < p.pf) { p.pf = f; p.pb = p.x; }
        if (p.pf < S.gf) { S.gf = p.pf; S.gb = p.pb; S.flash = 1; }
      }
      S.iter++;
      const spread = Math.max(...S.parts.map((p) => Math.abs(p.x - S.gb)));
      if (spread < 0.04 || S.iter >= 45) S.done = true;
    }
    const SW_DT = 0.6;
    function updateSwarm(dt) {
      if (!swarm || swarm.done) return;
      swarm.t += dt;
      swarm.flash = Math.max(0, swarm.flash - dt * 1.5);
      if (swarm.t >= SW_DT) { swarm.t = 0; iterSwarm(); }
    }

    /* ---------- Interaction ---------- */
    tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));
    revealEl.addEventListener('change', () => { reveal = revealEl.checked; });
    document.getElementById('problemReset').addEventListener('click', resetMode);
    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      hoverX = U.clamp(wx(e.clientX - r.left), X0, X1);
    });
    canvas.addEventListener('pointerleave', () => { hoverX = null; });
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = U.clamp(wx(e.clientX - r.left), X0, X1);
      if (mode === 'probe') { probes.push({ x, v: g(x), t: 0 }); see(x, 0.22); capKey = ''; }
      else if (mode === 'descent') startBall(x);
      else if (mode === 'swarm') startSwarm();
    });

    /* ---------- Drawing ---------- */
    function drawAxes() {
      ctx.strokeStyle = 'rgba(140,150,255,0.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ML, MT - 6); ctx.lineTo(ML, H - MB); ctx.lineTo(W - MR, H - MB); ctx.stroke();
      ctx.fillStyle = 'rgba(154,163,199,0.75)'; ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let x = 0; x <= 10; x++) {
        const px = sx(x);
        ctx.fillText(String(x), px, H - MB + 7);
        ctx.strokeStyle = 'rgba(140,150,255,0.06)';
        ctx.beginPath(); ctx.moveTo(px, MT); ctx.lineTo(px, H - MB); ctx.stroke();
      }
      ctx.save(); ctx.translate(14, (MT + H - MB) / 2); ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle'; ctx.fillText('f(x)  ·  cost ↑', 0, 0); ctx.restore();
      ctx.textAlign = 'right'; ctx.fillText('x →', W - MR, H - MB + 7);
    }

    function drawCurve() {
      if (!curveImg) return;
      if (reveal) { ctx.drawImage(curveImg, 0, 0, W, H); return; }
      lctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, W, H);
      const dx = (W - ML - MR) / NS;
      for (let i = 0; i <= NS; i++) {
        const a = 0.035 + 0.965 * seen[i];
        lctx.fillStyle = `rgba(0,0,0,${a})`;
        lctx.fillRect(ML + i * dx - 0.5, 0, dx + 1, H);
      }
      lctx.globalCompositeOperation = 'source-in';
      lctx.drawImage(curveImg, 0, 0, W, H);
      ctx.drawImage(layer, 0, 0, W, H);
      // fog question marks
      ctx.fillStyle = 'rgba(139,124,255,0.07)'; ctx.font = '700 26px "Space Grotesk", sans-serif'; ctx.textAlign = 'center';
      for (let i = 0; i < 9; i++) {
        const x = 0.6 + i * 1.1, idx = Math.round(((x - X0) / (X1 - X0)) * NS);
        if (seen[idx] < 0.3) ctx.fillText('?', sx(x), MT + 30 + (i % 3) * 40);
      }
    }

    function markGlobal(label) {
      const px = sx(xg), py = sy(gmin);
      ctx.save();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(52,211,153,0.6)';
      ctx.beginPath(); ctx.moveTo(px, py + 10); ctx.lineTo(px, H - MB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(px, py, 5, 0, U.TAU); ctx.fill();
      U.label(ctx, label || 'global minimum', px, py + 26, '#34d399');
      ctx.restore();
    }

    const sCyan = U.glow(U.C.in, 16), sSoc = U.glow(U.C.soc, 26), sWhite = U.glow(U.C.white, 10), sCog = U.glow(U.C.cog, 12);

    U.loop(wrap, (dt, t) => {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#070a1a'); bg.addColorStop(1, '#04060f');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      drawAxes();

      if (mode === 'descent') updateBall(dt);
      if (mode === 'swarm') updateSwarm(dt);
      drawCurve();

      if (mode === 'probe') {
        if (hoverX !== null) {
          const px = sx(hoverX);
          ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(139,124,255,0.55)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px, MT); ctx.lineTo(px, H - MB); ctx.stroke(); ctx.setLineDash([]);
          U.label(ctx, 'click to probe x = ' + hoverX.toFixed(2), px, MT + 10, '#8b7cff');
        }
        let best = null;
        probes.forEach((p) => { if (!best || p.v < best.v) best = p; });
        probes.forEach((p) => {
          p.t = Math.min(1, p.t + dt * 2.5);
          const px = sx(p.x), py = sy(p.v), e = U.easeOut(p.t);
          const isBest = p === best;
          ctx.strokeStyle = isBest ? 'rgba(52,211,153,0.6)' : 'rgba(139,124,255,0.4)';
          ctx.beginPath(); ctx.moveTo(px, H - MB); ctx.lineTo(px, U.lerp(H - MB, py, e)); ctx.stroke();
          U.drawGlow(ctx, isBest ? U.glow(U.C.res, 18) : sCyan, px, py, 18 * e);
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 3.5 * e, 0, U.TAU); ctx.fill();
          if (e > 0.9) U.label(ctx, 'f = ' + p.v.toFixed(2), px, py - 18, isBest ? '#34d399' : '#9aa3c7');
        });
        if (best) {
          ctx.setLineDash([2, 6]); ctx.strokeStyle = 'rgba(52,211,153,0.35)';
          ctx.beginPath(); ctx.moveTo(ML, sy(best.v)); ctx.lineTo(W - MR, sy(best.v)); ctx.stroke(); ctx.setLineDash([]);
        }
        if (reveal && probes.length) markGlobal();
        hud.innerHTML = `Probes <b>${probes.length}</b> · best f = <b>${best ? best.v.toFixed(3) : '—'}</b>`;
        if (probes.length < 4) setCaption('p0', '<b>You are blindfolded.</b> Click anywhere on the canvas to probe a point — you only learn the height at that one spot. Try to find the lowest point of the curve.');
        else setCaption('p1', `<b>See the problem?</b> After ${probes.length > 6 ? 'many' : 'several'} probes you still can't be sure a deeper valley isn't hiding between them. Grid search doesn't scale: with 30 variables and only 10 samples each you'd need <b>10³⁰ probes</b>. Toggle "Reveal landscape" to check your guess.`);
      }

      if (mode === 'descent' && ball) {
        markGlobal();
        ball.trail.forEach((x, i) => {
          const a = (i / ball.trail.length) * 0.6;
          ctx.fillStyle = `rgba(34,211,238,${a})`;
          ctx.beginPath(); ctx.arc(sx(x), sy(g(x)) - 8, 2.5, 0, U.TAU); ctx.fill();
        });
        const bx = sx(ball.x), by = sy(g(ball.x)) - 9;
        // tangent line (the only information gradient descent uses)
        const slope = dg(ball.x), L = 0.7;
        ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(251,191,36,0.85)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sx(ball.x - L), sy(g(ball.x) - slope * L)); ctx.lineTo(sx(ball.x + L), sy(g(ball.x) + slope * L)); ctx.stroke(); ctx.setLineDash([]);
        U.drawGlow(ctx, sCyan, bx, by, 26);
        const bg2 = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, 9);
        bg2.addColorStop(0, '#ffffff'); bg2.addColorStop(1, '#22d3ee');
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(bx, by, 8, 0, U.TAU); ctx.fill();
        const atGlobal = Math.abs(ball.x - xg) < 0.2;
        if (ball.done) {
          U.label(ctx, atGlobal ? 'reached the global minimum' : 'stuck · slope = 0', bx, by - 24, atGlobal ? '#34d399' : '#fb7185');
          if (atGlobal) setCaption('d2', 'This time the ball started in the right valley and reached the <b class="c-res">global minimum</b>. That was pure luck of the starting point — click somewhere else to drop it again.');
          else setCaption('d1', '<b>Stuck!</b> The slope here is zero, so gradient descent stops — but this is only a <b class="c-soc">local minimum</b>. The true global minimum (green) is elsewhere. A single downhill searcher always ends in the valley it starts in. Click to try another start.');
        } else setCaption('d0', '<b>Gradient descent</b> feels only the slope under its feet (the <span class="c-cog">dashed tangent</span>) and always steps downhill. It also needs the function to be differentiable. Click anywhere to drop the ball somewhere new.');
        hud.innerHTML = `Gradient descent · step <b>${ball.steps}</b> · slope <b>${slope.toFixed(3)}</b>`;
      }

      if (mode === 'swarm' && swarm) {
        const S = swarm, a = U.easeInOut(U.clamp(S.t / (SW_DT * 0.85), 0, 1));
        // pbest ticks
        S.parts.forEach((p) => {
          const px = sx(p.pb), py = sy(p.pf);
          ctx.fillStyle = 'rgba(251,191,36,0.9)';
          U.diamond(ctx, px, py, 4); ctx.fill();
        });
        // gbest
        const gxp = sx(S.gb), gyp = sy(S.gf);
        U.drawGlow(ctx, sSoc, gxp, gyp, 30 + S.flash * 30);
        U.star(ctx, gxp, gyp, 9, t * 1.2, '#ffd1da');
        U.label(ctx, 'gbest f = ' + S.gf.toFixed(3), gxp, gyp + 26, '#fb7185');
        // particles
        S.parts.forEach((p) => {
          const x = S.done ? p.x : U.lerp(p.prev, p.x, a);
          const px = sx(x), py = sy(g(x)) - 7;
          ctx.strokeStyle = 'rgba(251,113,133,0.18)';
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(gxp, gyp); ctx.stroke();
          U.drawGlow(ctx, sCyan, px, py, 18);
          U.drawGlow(ctx, sWhite, px, py, 6);
        });
        const atGlobal = Math.abs(S.gb - xg) < 0.2;
        if (S.done) {
          markGlobal(atGlobal ? 'swarm found the global minimum ✓' : 'global minimum');
          if (atGlobal) setCaption('s2', `<b>Found it.</b> The swarm converged on the global minimum at x = ${S.gb.toFixed(2)} after <b>${S.iter} iterations</b> — no slopes or derivatives, just particles sharing what they found. Press Restart to watch again.`);
          else setCaption('s3', 'This run settled in a local minimum. PSO is <b>stochastic</b> — very good in practice, but not guaranteed. Press Restart to run again.');
        } else setCaption('s0', '<b>10 particles</b> start at random places. Each remembers its own best spot (<span class="c-cog">amber diamonds</span>) and is pulled toward the swarm\'s best (<span class="c-soc">star</span>). Notice how the fog lifts wherever the particles probe.');
        hud.innerHTML = `PSO · iteration <b>${S.iter}</b> · gbest f = <b>${S.gf.toFixed(3)}</b>`;
      }
    });

    setMode('probe');
  };
})(window.PSO);
