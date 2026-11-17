/* Hero: a live swarm that hunts the cursor (a dynamic optimisation problem). */
(function (P) {
  'use strict';
  const U = P.util;

  P.initHero = function () {
    const canvas = document.getElementById('heroCanvas');
    const header = canvas.parentElement;
    const N = window.innerWidth < 700 ? 45 : 85;
    let W = 0, H = 0, parts = [], updates = 0, gx = 0, gy = 0, gf = Infinity, gid = -1;
    const target = { x: 0, y: 0 };
    let mouse = null, mouseT = 0, ripple = 0;

    const cv = U.canvas(canvas, (w, h) => {
      const first = !W; W = w; H = h;
      if (first) { spawn(); target.x = W * 0.7; target.y = H * 0.5; }
    });
    const ctx = cv.ctx;
    const sIn = U.glow(U.C.in, 10), sAcc = U.glow(U.C.acc, 10), sSoc = U.glow(U.C.soc, 26), sWhite = U.glow(U.C.white, 8);

    function spawn() {
      parts = [];
      for (let i = 0; i < N; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        parts.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, px: x, py: y, pf: Infinity, hue: Math.random() });
      }
    }
    const f = (x, y) => Math.hypot(x - target.x, y - target.y);

    header.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; mouseT = performance.now();
    });
    header.addEventListener('pointerleave', () => { mouse = null; });
    header.addEventListener('pointerdown', () => { ripple = 1; parts.forEach((p) => { p.vx += (Math.random() - 0.5) * 30; p.vy += (Math.random() - 0.5) * 30; }); });

    const elN = document.getElementById('hsN'), elIt = document.getElementById('hsIt'), elD = document.getElementById('hsD');
    elN.textContent = N;
    let frame = 0;

    U.loop(header, (dt, t) => {
      if (!W) return;
      const s = Math.min(3, dt * 60);
      const idle = !mouse || performance.now() - mouseT > 2600;
      const tx = idle ? W * (0.62 + 0.26 * Math.sin(t * 0.33)) : mouse.x;
      const ty = idle ? H * (0.5 + 0.3 * Math.sin(t * 0.51 + 1.3)) : mouse.y;
      const k = Math.min(1, dt * (idle ? 1.5 : 7));
      target.x += (tx - target.x) * k; target.y += (ty - target.y) * k;

      // Target moves, so memories must be re-evaluated every frame (dynamic PSO).
      gf = Infinity;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.pf = f(p.px, p.py);
        const cur = f(p.x, p.y);
        if (cur < p.pf) { p.px = p.x; p.py = p.y; p.pf = cur; }
        // memories slowly fade toward the present (keeps the swarm lively)
        p.px += (p.x - p.px) * 0.01 * s; p.py += (p.y - p.py) * 0.01 * s;
        if (p.pf < gf) { gf = p.pf; gx = p.px; gy = p.py; gid = i; }
      }
      const w = Math.pow(0.95, s);
      for (const p of parts) {
        const r1 = Math.random(), r2 = Math.random();
        p.vx = p.vx * w + (0.02 * r1 * (p.px - p.x) + 0.028 * r2 * (gx - p.x)) * s;
        p.vy = p.vy * w + (0.02 * r1 * (p.py - p.y) + 0.028 * r2 * (gy - p.y)) * s;
        const sp = Math.hypot(p.vx, p.vy), mx = 11;
        if (sp > mx) { p.vx *= mx / sp; p.vy *= mx / sp; }
        p.x += p.vx * s; p.y += p.vy * s;
        if (p.x < -40) p.vx += 1; if (p.x > W + 40) p.vx -= 1;
        if (p.y < -40) p.vy += 1; if (p.y > H + 40) p.vy -= 1;
      }
      updates++;

      // Explicit fading trails (a translucent fill would leave grey ghost pixels)
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      const TL = 12;
      for (const p of parts) { (p.tr || (p.tr = [])).push(p.x, p.y); if (p.tr.length > TL * 2) p.tr.splice(0, 2); }
      ctx.lineCap = 'round';
      for (let k = 0; k < TL - 1; k++) {
        ctx.beginPath();
        for (const p of parts) {
          const n = p.tr.length / 2, i = n - 1 - k;
          if (i < 1) continue;
          ctx.moveTo(p.tr[i * 2], p.tr[i * 2 + 1]); ctx.lineTo(p.tr[i * 2 - 2], p.tr[i * 2 - 1]);
        }
        ctx.strokeStyle = `rgba(125,200,255,${0.5 * (1 - k / TL)})`;
        ctx.lineWidth = Math.max(0.5, 2.2 - k * 0.16);
        ctx.stroke();
      }

      // constellation lines
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 9000) {
            ctx.strokeStyle = `rgba(139,124,255,${0.16 * (1 - d2 / 9000)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = 'lighter';
      // target (the "food")
      const pr = 18 + Math.sin(t * 4) * 4;
      U.drawGlow(ctx, sSoc, target.x, target.y, 60);
      ctx.strokeStyle = 'rgba(251,113,133,0.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(target.x, target.y, pr, 0, U.TAU); ctx.stroke();
      ctx.strokeStyle = `rgba(251,113,133,${0.35 * (1 - ((t * 0.8) % 1))})`;
      ctx.beginPath(); ctx.arc(target.x, target.y, 20 + ((t * 0.8) % 1) * 60, 0, U.TAU); ctx.stroke();
      if (ripple > 0) {
        ctx.strokeStyle = `rgba(34,211,238,${ripple * 0.6})`;
        ctx.beginPath(); ctx.arc(target.x, target.y, (1 - ripple) * 400, 0, U.TAU); ctx.stroke();
        ripple = Math.max(0, ripple - dt * 1.2);
      }

      // particles
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const sp = Math.hypot(p.vx, p.vy);
        U.drawGlow(ctx, p.hue > 0.5 ? sIn : sAcc, p.x, p.y, 9 + sp * 0.6);
        U.drawGlow(ctx, sWhite, p.x, p.y, 3.2);
      }
      ctx.globalCompositeOperation = 'source-over';
      // gbest marker
      if (gid >= 0) U.star(ctx, gx, gy, 7, t * 1.5, 'rgba(255,220,230,0.95)');

      if (++frame % 6 === 0) {
        elIt.textContent = updates.toLocaleString();
        elD.textContent = isFinite(gf) ? gf.toFixed(1) : '—';
      }
    });
  };
})(window.PSO);
