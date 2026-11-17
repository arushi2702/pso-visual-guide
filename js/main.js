/* Page wiring: navigation, scroll progress, reveal-on-scroll, and module start-up. */
(function (P) {
  'use strict';

  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const links = [...document.querySelectorAll('#navLinks a')];
  const navLinks = document.getElementById('navLinks');

  function onScroll() {
    const y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('navToggle').addEventListener('click', () => navLinks.classList.toggle('open'));
  links.forEach((a) => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // highlight the section currently in view
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  // reveal on scroll
  const rev = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  document.querySelectorAll('.reveal').forEach((el) => rev.observe(el));

  // start every interactive module; one failure must not take down the rest
  const modules = ['initHero', 'initProblem', 'initAnalogy', 'initVector', 'initFlow', 'initPlayground', 'initCompare', 'initTopology', 'initQuiz'];
  modules.forEach((m) => {
    try { if (P[m]) P[m](); } catch (err) { console.error('[PSO] ' + m + ' failed:', err); }
  });
})(window.PSO);
