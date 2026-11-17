/* Shared helpers: canvas sizing, animation loops, drawing primitives, RNG. */
window.PSO = window.PSO || {};
(function (P) {
  'use strict';
  const U = {};

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  U.easeOut = (t) => 1 - Math.pow(1 - t, 3);
  U.smooth = (t) => t * t * (3 - 2 * t);
  U.dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  U.TAU = Math.PI * 2;

  /** Seeded PRNG (mulberry32) so races can start from identical swarms. */
  U.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  U.hex = function (hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  U.rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  U.C = {
    in: U.hex('#22d3ee'), cog: U.hex('#fbbf24'), soc: U.hex('#fb7185'), res: U.hex('#34d399'),
    acc: U.hex('#8b7cff'), acc2: U.hex('#5eead4'), white: [232, 247, 255], text: [232, 234, 246], muted: [154, 163, 199],
  };

  /**
   * Keep a canvas' backing store matched to its CSS size (HiDPI aware).
   * Returns a live state object {ctx, w, h}.
   */
  U.canvas = function (canvas, onResize) {
    const ctx = canvas.getContext('2d');
    const st = { canvas, ctx, w: 0, h: 0, dpr: 1 };
    const apply = () => {
      const w = Math.round(canvas.clientWidth), h = Math.round(canvas.clientHeight);
      if (!w || !h) return;
      const d = U.dpr();
      if (w === st.w && h === st.h && d === st.dpr) return;
      st.w = w; st.h = h; st.dpr = d;
      canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (onResize) onResize(w, h);
    };
    st.refresh = apply;
    new ResizeObserver(apply).observe(canvas);
    apply();
    return st;
  };

  /** requestAnimationFrame loop that only runs while `el` is on screen. */
  U.loop = function (el, fn) {
    let visible = false, running = false, last = 0;
    const frame = (now) => {
      if (!visible || document.hidden) { running = false; return; }
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      fn(dt, now / 1000);
      requestAnimationFrame(frame);
    };
    const start = () => {
      if (!running && visible && !document.hidden) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    };
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; start(); }, { rootMargin: '150px' }).observe(el);
    document.addEventListener('visibilitychange', start);
    return { kick: start, isVisible: () => visible };
  };

  /** Arrow with a filled head. */
  U.arrow = function (ctx, x1, y1, x2, y2, color, width, head, dash) {
    width = width || 2; head = head || 10;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const ux = dx / len, uy = dy / len;
    const hl = Math.min(head, len * 0.55);
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * hl * 0.85, y2 - uy * hl * 0.85); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * hl - uy * hl * 0.5, y2 - uy * hl + ux * hl * 0.5);
    ctx.lineTo(x2 - ux * hl + uy * hl * 0.5, y2 - uy * hl - ux * hl * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  /** Pre-rendered radial glow sprite (much cheaper than shadowBlur). */
  const sprites = {};
  U.glow = function (c, r) {
    const key = c.join(',') + '|' + r;
    if (sprites[key]) return sprites[key];
    const d = U.dpr(), s = Math.ceil(r * 2 * d);
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const g = cv.getContext('2d');
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, U.rgba(c, 0.95));
    grd.addColorStop(0.18, U.rgba(c, 0.55));
    grd.addColorStop(0.45, U.rgba(c, 0.14));
    grd.addColorStop(1, U.rgba(c, 0));
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    sprites[key] = cv;
    return cv;
  };
  U.drawGlow = function (ctx, sprite, x, y, r) { ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2); };

  /** 4-point star (used for gbest markers). */
  U.star = function (ctx, x, y, r, rot, fill) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * U.TAU, rr = i % 2 === 0 ? r : r * 0.36;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  };

  U.diamond = function (ctx, x, y, r) {
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
  };

  U.fmt = function (v, d) {
    if (d === undefined) d = 3;
    if (!isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(2);
    return v.toFixed(d);
  };
  U.fmtVec = (v, d) => `(${U.fmt(v[0], d === undefined ? 2 : d)}, ${U.fmt(v[1], d === undefined ? 2 : d)})`;

  /** Bind a range input to an <output> and keep the coloured fill in sync. */
  U.bindRange = function (input, out, fmt, cb) {
    const upd = (silent) => {
      const p = ((+input.value - +input.min) / (+input.max - +input.min)) * 100;
      input.style.setProperty('--p', p + '%');
      if (out) out.textContent = fmt ? fmt(+input.value) : input.value;
      if (cb && silent !== true) cb(+input.value);
    };
    input.addEventListener('input', () => upd(false));
    upd(true);
    return {
      set(v, silent) { input.value = v; upd(silent); },
      get: () => +input.value,
    };
  };

  /** Segmented control helper. */
  U.seg = function (el, cb) {
    const btns = [...el.querySelectorAll('button')];
    const set = (v, silent) => {
      btns.forEach((b) => b.classList.toggle('active', b.dataset.v === v));
      if (!silent && cb) cb(v);
    };
    btns.forEach((b) => b.addEventListener('click', () => set(b.dataset.v)));
    return { set, get: () => (btns.find((b) => b.classList.contains('active')) || btns[0]).dataset.v };
  };

  U.roundRect = function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  };

  /** Text label with dark pill background. */
  U.label = function (ctx, text, x, y, color, align) {
    ctx.save();
    ctx.font = '600 11px "JetBrains Mono", monospace';
    const w = ctx.measureText(text).width + 12, h = 19;
    let bx = x - w / 2;
    if (align === 'left') bx = x; else if (align === 'right') bx = x - w;
    U.roundRect(ctx, bx, y - h / 2, w, h, 6);
    ctx.fillStyle = 'rgba(5,8,20,0.82)'; ctx.fill();
    ctx.strokeStyle = color; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(text, bx + w / 2, y + 0.5);
    ctx.restore();
  };

  P.util = U;
})(window.PSO);
