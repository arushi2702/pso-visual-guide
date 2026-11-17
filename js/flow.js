/* 04 · Algorithm — animated flowchart linked to pseudocode and explanations. */
(function (P) {
  'use strict';
  const U = P.util;

  P.initFlow = function () {
    const svg = document.getElementById('flowSvg');
    const desc = document.getElementById('flowDesc');
    const code = [...document.querySelectorAll('#flowCode .ln')];
    const iterEl = document.getElementById('flowIter');
    const toggle = document.getElementById('flowToggle');

    const N = {
      start: { shape: 'ellipse', x: 150, y: 38, rx: 70, ry: 22, label: 'Start', c: '#8b7cff', title: 'Start',
        text: 'Define the problem: the objective function f(x) to minimise, the bounds of the search space, and the parameters w, c₁, c₂ and swarm size N.', lines: [] },
      init: { shape: 'rect', x: 150, y: 118, w: 236, h: 54, label: 'Initialize swarm', sub: 'random xᵢ, vᵢ · pbestᵢ = xᵢ', c: '#5eead4', title: 'Initialize the swarm',
        text: 'Scatter N particles at random positions across the search space and give each a small random velocity. Each particle\'s personal best starts as its starting position — it hasn\'t been anywhere else yet.', lines: [0, 1, 2, 3] },
      eval: { shape: 'rect', x: 150, y: 205, w: 236, h: 54, label: 'Evaluate fitness', sub: 'fᵢ = f(xᵢ) for every particle', c: '#5eead4', title: 'Evaluate fitness',
        text: 'Compute f(xᵢ) for every particle. This is the only place the algorithm touches the actual problem — and usually the most expensive step (a simulation, or training a model).', lines: [5] },
      pbest: { shape: 'rect', x: 150, y: 290, w: 236, h: 54, label: 'Update personal bests', sub: 'if fᵢ < f(pbestᵢ): pbestᵢ ← xᵢ', c: '#fbbf24', title: 'Update personal bests (memory)',
        text: 'If a particle\'s new position is better than the best it has ever visited, it remembers this position as its new pbest. This is the swarm\'s individual memory — good finds are never forgotten.', lines: [6] },
      gbest: { shape: 'rect', x: 150, y: 375, w: 236, h: 54, label: 'Update global best', sub: 'gbest ← best of all pbestᵢ', c: '#fb7185', title: 'Update the global best (sharing)',
        text: 'The best of all personal bests becomes gbest. This single position is broadcast to the whole swarm — it is how one particle\'s discovery influences everyone else.', lines: [7] },
      stop: { shape: 'diamond', x: 150, y: 472, hw: 88, hh: 46, label: 'Stop?', sub: 'criterion met', c: '#a78bfa', title: 'Check the stopping criterion',
        text: 'Have we used up the iteration budget, reached a good-enough value, or stopped improving? If not, the swarm moves and the loop repeats.', lines: [4] },
      vel: { shape: 'rect', x: 418, y: 472, w: 214, h: 54, label: 'Update velocity', sub: 'inertia + cognitive + social', c: '#22d3ee', title: 'Update velocity',
        text: 'Draw fresh random numbers r₁, r₂, then combine inertia, the pull toward pbest and the pull toward gbest — exactly the equation from section 03. Optionally clamp to v_max.', lines: [8, 9] },
      pos: { shape: 'rect', x: 418, y: 335, w: 214, h: 54, label: 'Update position', sub: 'xᵢ ← xᵢ + vᵢ', c: '#34d399', title: 'Update position (move)',
        text: 'Each particle moves by its new velocity. Positions that leave the search space are clamped or reflected back. Then it\'s back to evaluation for the next iteration.', lines: [10] },
      ret: { shape: 'ellipse', x: 150, y: 600, rx: 92, ry: 24, label: 'Return gbest', c: '#34d399', title: 'Return the answer',
        text: 'The best position ever found by any particle — gbest — is returned as the solution, together with its fitness value f(gbest).', lines: [11] },
    };
    const E = {
      'start>init': [[150, 60], [150, 91]],
      'init>eval': [[150, 145], [150, 178]],
      'eval>pbest': [[150, 232], [150, 263]],
      'pbest>gbest': [[150, 317], [150, 348]],
      'gbest>stop': [[150, 402], [150, 426]],
      'stop>vel': [[238, 472], [311, 472]],
      'vel>pos': [[418, 445], [418, 362]],
      'pos>eval': [[418, 308], [418, 205], [268, 205]],
      'stop>ret': [[150, 518], [150, 576]],
    };

    let html = `<defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="rgba(170,180,255,.75)"/></marker>
      <filter id="tglow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`;
    for (const k in E) {
      html += `<polyline class="fedge" data-e="${k}" points="${E[k].map((p) => p.join(',')).join(' ')}" marker-end="url(#arr)"/>`;
    }
    html += `<text class="flabel" x="258" y="462">No</text><text class="flabel" x="160" y="550">Yes</text>`;
    html += `<text class="flabel" x="430" y="262" style="fill:#8b7cff">next iteration</text>`;
    for (const k in N) {
      const n = N[k];
      let shape = '';
      if (n.shape === 'rect') shape = `<rect x="${n.x - n.w / 2}" y="${n.y - n.h / 2}" width="${n.w}" height="${n.h}" rx="12"/>`;
      else if (n.shape === 'ellipse') shape = `<ellipse cx="${n.x}" cy="${n.y}" rx="${n.rx}" ry="${n.ry}"/>`;
      else shape = `<polygon points="${n.x},${n.y - n.hh} ${n.x + n.hw},${n.y} ${n.x},${n.y + n.hh} ${n.x - n.hw},${n.y}"/>`;
      const ty = n.sub ? n.y - 8 : n.y;
      html += `<g class="fnode" data-n="${k}" style="--c:${n.c}">${shape}<text x="${n.x}" y="${ty}">${n.label}</text>${n.sub ? `<text class="sub" x="${n.x}" y="${n.y + 11}">${n.sub}</text>` : ''}</g>`;
    }
    html += `<circle id="ftoken" r="7" fill="#fff" filter="url(#tglow)" cx="150" cy="38"/>`;
    svg.innerHTML = html;
    const token = svg.querySelector('#ftoken');
    const nodes = {}; svg.querySelectorAll('.fnode').forEach((g) => { nodes[g.dataset.n] = g; });
    const edges = {}; svg.querySelectorAll('.fedge').forEach((e) => { edges[e.dataset.e] = e; });

    const LOOPS = 3;
    const seq = ['start', 'init', 'eval', 'pbest', 'gbest', 'stop'];
    for (let i = 0; i < LOOPS; i++) seq.push('vel', 'pos', 'eval', 'pbest', 'gbest', 'stop');
    seq.push('ret');

    const st = { idx: 0, mode: 'dwell', t: 0, path: null, len: 0, iter: 0, paused: false, current: null };

    function show(k) {
      if (st.current === k) return;
      st.current = k;
      Object.values(nodes).forEach((g) => g.classList.toggle('active', g.dataset.n === k));
      const n = N[k];
      const iterTxt = st.iter >= LOOPS && k === 'stop' ? 'Yes — criterion met' : k === 'stop' ? 'No — continue' : '';
      desc.style.setProperty('--c', n.c);
      desc.innerHTML = `<div class="anim"><h3><span class="step-badge">${k === 'start' || k === 'ret' ? 'terminal' : 'step'}</span>${n.title}</h3>
        <p>${n.text}</p>${iterTxt ? `<p style="color:${n.c};font-weight:600;margin-top:10px">${iterTxt}</p>` : ''}</div>`;
      code.forEach((l, i) => { l.classList.toggle('hl', n.lines.includes(i)); l.style.setProperty('--c', n.c); });
      // park the token just left of the active box so it doesn't cover the label
      const tn = N[k], half = tn.w ? tn.w / 2 : tn.rx || tn.hw;
      token.setAttribute('cx', tn.x - half - 14); token.setAttribute('cy', tn.y);
    }
    function plen(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
    function pointAt(pts, d) {
      for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (d <= l) { const u = d / l; return [U.lerp(pts[i - 1][0], pts[i][0], u), U.lerp(pts[i - 1][1], pts[i][1], u)]; }
        d -= l;
      }
      return pts[pts.length - 1];
    }

    function setPaused(p) {
      st.paused = p;
      toggle.innerHTML = p
        ? '<svg viewBox="0 0 24 24"><path d="M7 5v14l12-7z"/></svg>Play'
        : '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>Pause';
    }
    toggle.addEventListener('click', () => setPaused(!st.paused));
    svg.querySelectorAll('.fnode').forEach((g) => g.addEventListener('click', () => {
      setPaused(true);
      st.current = null; show(g.dataset.n);
    }));

    show('start');
    U.loop(svg, (dt) => {
      if (st.paused) return;
      st.t += dt;
      if (st.mode === 'dwell') {
        show(seq[st.idx]);
        const dwell = seq[st.idx] === 'ret' ? 3.2 : seq[st.idx] === 'start' ? 1.6 : 1.9;
        if (st.t >= dwell) {
          st.t = 0;
          if (st.idx >= seq.length - 1) { st.idx = 0; st.iter = 0; iterEl.textContent = 'iteration 0'; st.current = null; return; }
          const key = seq[st.idx] + '>' + seq[st.idx + 1];
          st.path = E[key]; st.len = plen(st.path); st.mode = 'travel';
          Object.values(edges).forEach((e) => e.classList.remove('lit'));
          if (edges[key]) edges[key].classList.add('lit');
          if (key === 'pos>eval') { st.iter++; iterEl.textContent = 'iteration ' + st.iter; }
        }
      } else {
        const d = st.t * 260;
        const p = pointAt(st.path, Math.min(d, st.len));
        token.setAttribute('cx', p[0]); token.setAttribute('cy', p[1]);
        if (d >= st.len) { st.mode = 'dwell'; st.t = 0; st.idx++; }
      }
    });
  };
})(window.PSO);
