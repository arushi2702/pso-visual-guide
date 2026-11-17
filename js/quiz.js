/* 09 · Quiz — ten questions with instant, explained feedback. */
(function (P) {
  'use strict';

  const Q = [
    { q: 'What does <b>pbest</b> represent for particle i?', o: ['The best position found by the whole swarm', 'The best position particle i itself has ever visited', 'The particle\'s current position', 'The particle\'s fastest velocity'], a: 1,
      e: '<b>pbest</b> is the particle\'s <i>personal</i> memory — the best position <i>it</i> has visited so far. The swarm-wide best is gbest.' },
    { q: 'Which term of the velocity update makes a particle keep moving in the direction it was already going?', o: ['c₁r₁(pbest − x)', 'c₂r₂(gbest − x)', 'w · v', 'x + v'], a: 2,
      e: '<b>w · v</b> is the inertia (momentum) term: a fraction w of the previous velocity is carried into the next step.' },
    { q: 'If we set <b>c₂ = 0</b>, what happens?', o: ['Particles stop moving', 'Particles ignore each other — no information is shared', 'Particles forget their own best position', 'The swarm converges faster'], a: 1,
      e: 'c₂ scales the <b>social</b> term. Without it, each particle only follows its own memory, so the swarm becomes N independent searches.' },
    { q: 'An inertia weight <b>w &gt; 1</b> typically causes…', o: ['Very fast, precise convergence', 'Velocities that keep growing, so the swarm never settles', 'Particles to stand still', 'Nothing — w has no effect'], a: 1,
      e: 'With w &gt; 1 each step amplifies the previous velocity. The swarm "explodes" and is only kept in the box by v<sub>max</sub> and the walls. Try the <b>Unstable</b> preset.' },
    { q: 'Why are r₁ and r₂ random numbers in [0, 1]?', o: ['To make the algorithm deterministic', 'To add stochastic variation so particles explore and keep diversity', 'To guarantee the global optimum is found', 'To normalise the velocity'], a: 1,
      e: 'The random factors vary the strength of each pull every step, so particles don\'t move along rigid, identical paths. This keeps the swarm <b>diverse</b>.' },
    { q: 'Compared with the global (gbest) topology, a <b>ring (lbest)</b> topology…', o: ['Spreads information faster', 'Spreads information more slowly but is more robust against premature convergence', 'Removes the need for pbest', 'Only works with one particle'], a: 1,
      e: 'In a ring each particle hears only its neighbours, so news travels hop by hop. Different groups explore different valleys for longer — slower, but more robust.' },
    { q: 'Does PSO need the <b>gradient</b> (derivative) of f?', o: ['Yes, always', 'Only for the velocity update', 'No — it only needs f(x) values', 'Only in high dimensions'], a: 2,
      e: 'PSO is <b>gradient-free</b>: it only compares f(x) values. That\'s why it works on noisy, discontinuous or black-box problems.' },
    { q: 'Decreasing w linearly from 0.9 to 0.4 during a run is meant to…', o: ['Exploit early and explore later', 'Explore early and exploit (fine-tune) later', 'Keep exploration constant', 'Reduce the number of particles'], a: 1,
      e: 'Large w early → wide exploration. Small w late → particles brake and refine around the best region (Shi &amp; Eberhart, 1998).' },
    { q: 'What is the purpose of <b>v<sub>max</sub></b>?', o: ['To limit the step size so particles don\'t fly out of control', 'To set the number of iterations', 'To store the best velocity', 'To choose the topology'], a: 0,
      e: 'v<sub>max</sub> clamps each velocity component, preventing "velocity explosion" and overshooting the search space.' },
    { q: 'All particles collapse onto one point that is <b>not</b> the global minimum. This is called…', o: ['Global convergence', 'Premature convergence', 'Exploration', 'Over-fitting'], a: 1,
      e: '<b>Premature convergence</b>: the swarm lost diversity too early and got trapped in a local minimum. Remedies: higher w, ring topology, more particles, or restarts.' },
  ];

  P.initQuiz = function () {
    const root = document.getElementById('quizRoot');
    let idx = 0, score = 0, answered = [];

    function render() {
      if (idx >= Q.length) return renderResult();
      const item = Q[idx];
      const done = answered[idx] !== undefined;
      root.innerHTML = `
        <div class="quiz-top"><div class="quiz-progress"><i style="width:${(idx / Q.length) * 100}%"></i></div>
          <div class="quiz-score">score <b>${score}</b> / ${Q.length}</div></div>
        <div class="panel qcard">
          <div class="qn">Question ${idx + 1} of ${Q.length}</div>
          <h3>${item.q}</h3>
          <div class="qopts">${item.o.map((o, i) => `<button class="qopt" data-i="${i}" data-k="${'ABCD'[i]}">${o}</button>`).join('')}</div>
          <div class="qexp-slot"></div>
          <div class="qnav">
            <button class="btn btn-sm" id="qPrev" ${idx === 0 ? 'disabled' : ''}>← Back</button>
            <button class="btn btn-primary btn-sm" id="qNext" ${done ? '' : 'disabled'}>${idx === Q.length - 1 ? 'See result' : 'Next question →'}</button>
          </div>
        </div>`;
      const btns = [...root.querySelectorAll('.qopt')];
      const reveal = (pick) => {
        btns.forEach((b, i) => {
          b.disabled = true;
          if (i === item.a) b.classList.add('correct');
          if (i === pick && pick !== item.a) b.classList.add('wrong');
        });
        root.querySelector('.qexp-slot').innerHTML = `<div class="qexp">${pick === item.a ? '<b style="color:#34d399">Correct!</b> ' : '<b style="color:#fb7185">Not quite.</b> '}${item.e}</div>`;
        root.querySelector('#qNext').disabled = false;
      };
      if (done) reveal(answered[idx]);
      btns.forEach((b) => b.addEventListener('click', () => {
        if (answered[idx] !== undefined) return;
        const pick = +b.dataset.i;
        answered[idx] = pick;
        if (pick === item.a) score++;
        reveal(pick);
        root.querySelector('.quiz-score').innerHTML = `score <b>${score}</b> / ${Q.length}`;
      }));
      root.querySelector('#qPrev').addEventListener('click', () => { idx--; render(); });
      root.querySelector('#qNext').addEventListener('click', () => { idx++; render(); });
    }

    function renderResult() {
      const pct = score / Q.length, C = 2 * Math.PI * 64;
      const msg = pct === 1 ? ['Perfect score!', 'You have a complete understanding of PSO. Your swarm has converged on the global optimum.']
        : pct >= 0.7 ? ['Great work!', 'You understand the core ideas. Revisit the sections for the questions you missed to reach 100%.']
          : ['Keep exploring!', 'Scroll back through the visuals — especially the equation and parameters sections — then try again.'];
      root.innerHTML = `<div class="panel qresult">
        <div class="ring"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="64" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/>
          <circle id="qArc" cx="75" cy="75" r="64" fill="none" stroke="url(#qg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" style="transition:stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)"/>
          <defs><linearGradient id="qg"><stop offset="0" stop-color="#22d3ee"/><stop offset=".5" stop-color="#8b7cff"/><stop offset="1" stop-color="#fb7185"/></linearGradient></defs></svg>
          <span>${score}/${Q.length}</span></div>
        <h3>${msg[0]}</h3><p>${msg[1]}</p>
        <button class="btn btn-primary" id="qRetry">Retake the quiz</button></div>`;
      requestAnimationFrame(() => requestAnimationFrame(() => { const a = document.getElementById('qArc'); if (a) a.style.strokeDashoffset = C * (1 - pct); }));
      document.getElementById('qRetry').addEventListener('click', () => { idx = 0; score = 0; answered = []; render(); });
    }
    render();
  };
})(window.PSO);
