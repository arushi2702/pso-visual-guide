/* 02 · Intuition — birds searching a field for food by smell, using the three PSO rules. */
(function (P) {
  'use strict';
  const U = P.util;

  P.initAnalogy = function () {
    const canvas = document.getElementById('birdCanvas');
    const wrap = canvas.parentElement;
    const hud = document.getElementById('birdHud');
    const tSmell = document.getElementById('birdSmell');
    const tMem = document.getElementById('birdMemory');
    const tSoc = document.getElementById('birdSocial');

    const FW = 16, FH = 10; // field units
    let W = 0, H = 0;
    const food = { x: 12, y: 3.2 };
    const decoys = [{ x: 4, y: 7.5, a: 0.3 }, { x: 8.5, y: 1.6, a: 0.26 }, { x: 2.5, y: 2.2, a: 0.24 }];
    const smell = (x, y) => {
      let s = Math.exp(-((x - food.x) ** 2 + (y - food.y) ** 2) / (2 * 2.0 ** 2));
      s += 0.55 * Math.exp(-((x - food.x) ** 2 + (y - food.y) ** 2) / (2 * 9 ** 2));
      for (const d of decoys) s += d.a * Math.exp(-((x - d.x) ** 2 + (y - d.y) ** 2) / (2 * 1.1 ** 2));
      return s;
    };
    const fit = (x, y) => -smell(x, y); // minimise

    let smellImg = null;
    function buildSmell() {
      const rw = 160, rh = 100;
      const c = document.createElement('canvas'); c.width = rw; c.height = rh;
      const g = c.getContext('2d'), img = g.createImageData(rw, rh), d = img.data;
      let mx = 0;
      const vals = new Float32Array(rw * rh);
      for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) {
        const v = smell(((i + 0.5) / rw) * FW, ((j + 0.5) / rh) * FH); vals[j * rw + i] = v; if (v > mx) mx = v;
      }
      for (let k = 0; k < vals.length; k++) {
        const t = vals[k] / mx;
        const fr = (t * 9) % 1, line = Math.min(fr, 1 - fr) < 0.06 ? 0.25 : 0;
        d[k * 4] = 251 * t + 30 * (1 - t); d[k * 4 + 1] = 191 * t + 40 * (1 - t); d[k * 4 + 2] = 36 * t + 120 * (1 - t);
        d[k * 4 + 3] = 255 * (0.12 + 0.55 * t * t + line);
      }
      g.putImageData(img, 0, 0);
      smellImg = c;
    }
    buildSmell();

    const N = 18;
    let birds = [], gb = null, gf = Infinity, gOwner = -1, found = 0, iter = 0, acc = 0, eaten = 0, celebrate = 0;
    const IT = 0.3;
    function spawn() {
      birds = [];
      for (let i = 0; i < N; i++) {
        const x = 0.5 + Math.random() * 15, y = 0.6 + Math.random() * 8.8; // birds start scattered over the field
        const f = fit(x, y);
        birds.push({ x, y, px: x, py: y, vx: 0.5 + Math.random() * 0.6, vy: (Math.random() - 0.5) * 0.8, bx: x, by: y, bf: f, ang: 0, flap: Math.random() * 6 });
      }
      gf = Infinity; reevaluate();
    }
    function reevaluate() {
      gf = Infinity;
      birds.forEach((b, i) => { b.bf = fit(b.bx, b.by); if (b.bf < gf) { gf = b.bf; gb = { x: b.bx, y: b.by }; gOwner = i; } });
    }
    function step() {
      const w = 0.68, c1 = 1.4, c2 = 1.5, vm = 1.4;
      for (const b of birds) {
        const r1 = Math.random(), r2 = Math.random(), r3 = Math.random(), r4 = Math.random();
        b.vx = w * b.vx + c1 * r1 * (b.bx - b.x) + c2 * r2 * (gb.x - b.x);
        b.vy = w * b.vy + c1 * r3 * (b.by - b.y) + c2 * r4 * (gb.y - b.y);
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > vm) { b.vx *= vm / sp; b.vy *= vm / sp; }
        b.px = b.x; b.py = b.y;
        b.x = U.clamp(b.x + b.vx, 0.2, FW - 0.2); b.y = U.clamp(b.y + b.vy, 0.2, FH - 0.2);
        const f = fit(b.x, b.y);
        if (f < b.bf) { b.bf = f; b.bx = b.x; b.by = b.y; }
      }
      birds.forEach((b, i) => { if (b.bf < gf) { gf = b.bf; gb = { x: b.bx, y: b.by }; gOwner = i; } });
      iter++;
    }
    function moveFood(x, y) {
      food.x = x; food.y = y; buildSmell();
      reevaluate(); // memories are re-checked against the new field
      found = 0; iter = 0; celebrate = 0;
    }

    const cv = U.canvas(canvas, (w, h) => { W = w; H = h; });
    const ctx = cv.ctx;
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      moveFood(((e.clientX - r.left) / r.width) * FW, ((e.clientY - r.top) / r.height) * FH);
    });
    spawn();

    const sFood = U.glow(U.C.cog, 40), sSoc = U.glow(U.C.soc, 22), sWhite = U.glow(U.C.white, 12);
    const X = (x) => (x / FW) * W, Y = (y) => (y / FH) * H;

    function drawBird(x, y, ang, flap, color, scale) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(scale, scale);
      const f = Math.sin(flap) * 0.9;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -3.2); ctx.lineTo(-3, 0); ctx.lineTo(-5, 3.2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(1, 0); ctx.quadraticCurveTo(-1, -6 * f - 1, -4, -9 * f); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1, 0); ctx.quadraticCurveTo(-1, 6 * f + 1, -4, 9 * f); ctx.stroke();
      ctx.restore();
    }

    U.loop(wrap, (dt, t) => {
      if (!W) return;
      acc += dt;
      if (acc >= IT) { acc = 0; step(); }
      const a = U.smooth(U.clamp(acc / IT, 0, 1));

      // background field
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
      bg.addColorStop(0, '#0b1226'); bg.addColorStop(1, '#05070f');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(140,150,255,0.07)';
      for (let gx = 0.5; gx < FW; gx += 1) for (let gy = 0.5; gy < FH; gy += 1) ctx.fillRect(X(gx) - 1, Y(gy) - 1, 2, 2);

      if (tSmell.checked && smellImg) { ctx.imageSmoothingEnabled = true; ctx.drawImage(smellImg, 0, 0, W, H); }

      // decoy crumbs and the food
      ctx.globalCompositeOperation = 'lighter';
      for (const d of decoys) U.drawGlow(ctx, U.glow([200, 150, 60], 20), X(d.x), Y(d.y), 22);
      U.drawGlow(ctx, sFood, X(food.x), Y(food.y), 46 + Math.sin(t * 3) * 6);
      ctx.globalCompositeOperation = 'source-over';
      for (const d of decoys) for (let k = 0; k < 4; k++) {
        ctx.fillStyle = 'rgba(214,170,90,0.7)';
        ctx.beginPath(); ctx.arc(X(d.x) + Math.cos(k * 2.1) * 5, Y(d.y) + Math.sin(k * 2.1) * 4, 1.8, 0, U.TAU); ctx.fill();
      }
      for (let k = 0; k < 9; k++) {
        ctx.fillStyle = k % 2 ? '#fde68a' : '#fbbf24';
        ctx.beginPath(); ctx.ellipse(X(food.x) + Math.cos(k * 0.7) * (k * 1.3), Y(food.y) + Math.sin(k * 0.7) * (k * 1.1), 2.6, 1.8, k, 0, U.TAU); ctx.fill();
      }
      U.label(ctx, 'food (hidden from birds)', X(food.x), Y(food.y) - 30, '#fbbf24');

      // memory links (pbest)
      if (tMem.checked) {
        ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
        birds.forEach((b) => {
          const x = U.lerp(b.px, b.x, a), y = U.lerp(b.py, b.y, a);
          ctx.strokeStyle = 'rgba(251,191,36,0.35)';
          ctx.beginPath(); ctx.moveTo(X(x), Y(y)); ctx.lineTo(X(b.bx), Y(b.by)); ctx.stroke();
        });
        ctx.setLineDash([]);
        birds.forEach((b) => { ctx.fillStyle = 'rgba(251,191,36,0.9)'; U.diamond(ctx, X(b.bx), Y(b.by), 3.5); ctx.fill(); });
      }
      // social links (gbest)
      if (tSoc.checked && gb) {
        birds.forEach((b) => {
          const x = U.lerp(b.px, b.x, a), y = U.lerp(b.py, b.y, a);
          ctx.strokeStyle = 'rgba(251,113,133,0.16)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(X(x), Y(y)); ctx.lineTo(X(gb.x), Y(gb.y)); ctx.stroke();
        });
        U.drawGlow(ctx, sSoc, X(gb.x), Y(gb.y), 26 + Math.sin(t * 5) * 4);
        U.star(ctx, X(gb.x), Y(gb.y), 8, t, '#ffd1da');
        if (Math.hypot(gb.x - food.x, gb.y - food.y) > 1.6) U.label(ctx, "flock's best spot", X(gb.x), Y(gb.y) + 22, '#fb7185');
      }

      // birds
      let spread = 0;
      birds.forEach((b, i) => {
        const x = U.lerp(b.px, b.x, a), y = U.lerp(b.py, b.y, a);
        const target = Math.atan2(b.y - b.py, b.x - b.px);
        if (Math.hypot(b.x - b.px, b.y - b.py) > 0.02) {
          let d = target - b.ang; while (d > Math.PI) d -= U.TAU; while (d < -Math.PI) d += U.TAU;
          b.ang += d * Math.min(1, dt * 8);
        }
        b.flap += dt * (10 + Math.hypot(b.vx, b.vy) * 8);
        const leader = i === gOwner;
        if (leader) U.drawGlow(ctx, sSoc, X(x), Y(y), 20);
        drawBird(X(x), Y(y), b.ang, b.flap, leader ? '#ffd1da' : '#e6f4ff', leader ? 1.35 : 1.1);
        spread += Math.hypot(b.x - food.x, b.y - food.y);
      });
      spread /= birds.length;
      const dist = gb ? Math.hypot(gb.x - food.x, gb.y - food.y) : 99;
      if (found > 0 || (dist < 0.5 && spread < 1.6)) found += dt;
      if (found > 0) {
        celebrate += dt;
        const r = celebrate * 120;
        ctx.strokeStyle = `rgba(52,211,153,${Math.max(0, 0.7 - celebrate * 0.35)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(X(food.x), Y(food.y), r % 160, 0, U.TAU); ctx.stroke();
        hud.innerHTML = `<b style="color:#34d399">Food found!</b> after ${iter} moves · new food in ${Math.max(0, 4 - found).toFixed(0)}s`;
        if (found > 4) {
          eaten++;
          let nx, ny;
          do { nx = 1.5 + Math.random() * 13; ny = 1.2 + Math.random() * 7.6; } while (Math.hypot(nx - food.x, ny - food.y) < 6);
          moveFood(nx, ny);
        }
      } else if (iter > 70) {
        spawn(); iter = 0; // fooled by crumbs: take off again from new random spots
      } else {
        hud.innerHTML = `Searching… move <b>${iter}</b> · best bird is <b>${dist.toFixed(1)} m</b> from the food`;
      }
    });
  };
})(window.PSO);
