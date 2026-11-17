/* 07 · Topology — how a discovery spreads through a global (star) vs ring neighbourhood. */
(function (P) {
  'use strict';
  const U = P.util;

  P.initTopology = function () {
    const n = 12;
    const cG = U.canvas(document.getElementById('topoGlobal'));
    const cR = U.canvas(document.getElementById('topoRing'));
    const el = { gi: document.getElementById('tgInf'), gh: document.getElementById('tgHop'), ri: document.getElementById('trInf'), rh: document.getElementById('trHop') };
    const HOP_G = 0.8, HOP_R = 0.7, HOLD = 2.4;
    let src = 0, t = 0;

    function times(kind) {
      const at = [], parent = [];
      for (let i = 0; i < n; i++) {
        if (kind === 'global') { at[i] = i === src ? 0 : HOP_G; parent[i] = src; }
        else {
          const d = Math.min((i - src + n) % n, (src - i + n) % n);
          at[i] = d * HOP_R;
          const cw = (i - src + n) % n <= n / 2;
          parent[i] = cw ? (i - 1 + n) % n : (i + 1) % n;
        }
      }
      return { at, parent };
    }
    let TG = times('global'), TR = times('ring');
    const total = (n / 2) * HOP_R + HOLD;
    function trigger() { let s; do { s = (Math.random() * n) | 0; } while (s === src); src = s; t = 0; TG = times('global'); TR = times('ring'); }
    document.getElementById('topoTrigger').addEventListener('click', trigger);

    const gSoc = U.glow(U.C.soc, 20), gCog = U.glow(U.C.cog, 30), gIn = U.glow(U.C.in, 12);

    function draw(c, kind, T, dt) {
      const g = c.ctx, W = c.w, H = c.h;
      if (!W) return [0, 0];
      g.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.37;
      const pos = []; for (let i = 0; i < n; i++) { const a = (i / n) * U.TAU - Math.PI / 2; pos.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
      const hop = kind === 'global' ? HOP_G : HOP_R;
      // edges
      g.lineWidth = 1;
      if (kind === 'global') {
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
          const lit = (i === src || j === src) && t < HOP_G + 0.4;
          g.strokeStyle = lit ? 'rgba(251,113,133,0.45)' : 'rgba(140,150,255,0.1)';
          g.beginPath(); g.moveTo(pos[i][0], pos[i][1]); g.lineTo(pos[j][0], pos[j][1]); g.stroke();
        }
      } else {
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          g.strokeStyle = 'rgba(140,150,255,0.35)'; g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(pos[i][0], pos[i][1]); g.lineTo(pos[j][0], pos[j][1]); g.stroke();
        }
      }
      // pulses
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        if (i === src) continue;
        const start = T.at[i] - hop;
        if (t >= start && t <= T.at[i]) {
          const u = U.easeInOut((t - start) / hop), a = pos[T.parent[i]], b = pos[i];
          const x = U.lerp(a[0], b[0], u), y = U.lerp(a[1], b[1], u);
          U.drawGlow(g, gSoc, x, y, 16);
          g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 2.5, 0, U.TAU); g.fill();
        }
      }
      g.globalCompositeOperation = 'source-over';
      // nodes
      let informed = 0;
      for (let i = 0; i < n; i++) {
        const [x, y] = pos[i];
        const inf = t >= T.at[i];
        if (inf) informed++;
        const age = t - T.at[i];
        const pop = inf && age < 0.35 ? 1 + Math.sin((age / 0.35) * Math.PI) * 0.45 : 1;
        if (i === src) {
          g.globalCompositeOperation = 'lighter'; U.drawGlow(g, gCog, x, y, 34 + Math.sin(t * 6) * 4); g.globalCompositeOperation = 'source-over';
        } else if (inf) {
          g.globalCompositeOperation = 'lighter'; U.drawGlow(g, gSoc, x, y, 20); g.globalCompositeOperation = 'source-over';
        } else {
          g.globalCompositeOperation = 'lighter'; U.drawGlow(g, gIn, x, y, 12); g.globalCompositeOperation = 'source-over';
        }
        g.beginPath(); g.arc(x, y, 10 * pop, 0, U.TAU);
        g.fillStyle = i === src ? '#fbbf24' : inf ? '#fb7185' : '#141a38';
        g.fill();
        g.strokeStyle = i === src ? '#fde68a' : inf ? '#ffd1da' : 'rgba(34,211,238,0.6)'; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = i === src || inf ? '#1a0b10' : '#9aa3c7'; g.font = '600 9px "JetBrains Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String(i), x, y + 0.5);
      }
      const sp = pos[src];
      const lx = cx + (sp[0] - cx) * 1.28, ly = cy + (sp[1] - cy) * 1.28;
      U.label(g, 'found a better spot!', lx, ly, '#fbbf24');
      // centre caption
      g.fillStyle = informed === n ? '#34d399' : 'rgba(154,163,199,0.8)';
      g.font = '600 12px "Space Grotesk", sans-serif'; g.textAlign = 'center';
      g.fillText(informed === n ? 'everyone knows' : 'spreading…', cx, cy);
      const hops = kind === 'global' ? (t >= HOP_G ? 1 : 0) : Math.min(n / 2, Math.floor(t / HOP_R + 1e-6));
      return [informed, hops];
    }

    U.loop(document.getElementById('topology'), (dt) => {
      t += dt;
      if (t > total) trigger();
      const [gi, gh] = draw(cG, 'global', TG, dt);
      const [ri, rh] = draw(cR, 'ring', TR, dt);
      el.gi.textContent = gi; el.gh.textContent = gh; el.ri.textContent = ri; el.rh.textContent = rh;
    });
  };
})(window.PSO);
