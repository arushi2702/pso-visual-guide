/* Lightweight 3-D surface renderer (Canvas 2D, painter's algorithm) used by the playground. */
(function (P) {
  'use strict';
  const U = P.util;

  class Surface3D {
    constructor(canvas) {
      this.canvas = canvas;
      this.cv = U.canvas(canvas, (w, h) => { this.W = w; this.H = h; });
      this.ctx = this.cv.ctx;
      this.yaw = -0.75; this.pitch = 0.82; this.auto = true; this.zoom = 1;
      this.N = 52; this.hs = 0.42;
      this.drag = null;
      canvas.addEventListener('pointerdown', (e) => {
        this.drag = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch, moved: false };
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!this.drag) return;
        const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) { this.drag.moved = true; this.auto = false; }
        this.yaw = this.drag.yaw + dx * 0.008;
        this.pitch = U.clamp(this.drag.pitch + dy * 0.006, 0.25, 1.45);
      });
      const end = () => { this.drag = null; };
      canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
      canvas.addEventListener('dblclick', () => { this.auto = !this.auto; });
      canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.zoom = U.clamp(this.zoom * (e.deltaY > 0 ? 0.93 : 1.07), 0.6, 1.8); }, { passive: false });
    }

    setFunction(fn, field) {
      this.fn = fn; this.field = field;
      const N = this.N, Z = new Float32Array(N * N);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = fn.x[0] + (i / (N - 1)) * (fn.x[1] - fn.x[0]);
        const y = fn.y[0] + (j / (N - 1)) * (fn.y[1] - fn.y[0]);
        Z[j * N + i] = field.t(fn.f(x, y));
      }
      this.Z = Z;
      // per-quad colour with fixed world-space lighting
      const L = [-0.45, -0.55, 0.7], ll = Math.hypot(...L);
      this.cols = []; this.edgeCols = [];
      const du = 1 / (N - 1);
      for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
        const z00 = Z[j * N + i], z10 = Z[j * N + i + 1], z01 = Z[(j + 1) * N + i], z11 = Z[(j + 1) * N + i + 1];
        const hz = this.hs;
        const ax = du, az = (z10 - z00) * hz, by = du, bz = (z01 - z00) * hz;
        // normal = (a × b) where a=(du,0,az), b=(0,du,bz)
        let nx = -az * du, ny = -bz * du, nz = du * du;
        const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
        const sh = U.clamp(0.45 + 0.75 * ((nx * L[0] + ny * L[1] + nz * L[2]) / ll), 0.3, 1.25);
        const c = P.palette((z00 + z10 + z01 + z11) / 4);
        this.cols.push(`rgb(${(c[0] * sh) | 0},${(c[1] * sh) | 0},${(c[2] * sh) | 0})`);
        this.edgeCols.push(`rgba(${Math.min(255, c[0] * sh + 40) | 0},${Math.min(255, c[1] * sh + 40) | 0},${Math.min(255, c[2] * sh + 50) | 0},0.55)`);
        void ax; void by;
      }
    }

    /** world (x, y in function domain; z in [0,1]) → screen */
    proj(u, v, z) {
      const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      const a = u * cy - v * sy, b = u * sy + v * cy;
      const zz = (z - 0.35) * this.hs;
      const up = zz * cp + b * sp;
      const close = -b * cp + zz * sp;
      const k = 2.6 / (2.6 - close);
      const S = Math.min(this.W, this.H) * 0.74 * this.zoom;
      return [this.W / 2 + a * k * S, this.H * 0.54 - up * k * S, close];
    }
    uv(x, y) {
      const fn = this.fn;
      return [(x - fn.x[0]) / (fn.x[1] - fn.x[0]) - 0.5, (y - fn.y[0]) / (fn.y[1] - fn.y[0]) - 0.5];
    }

    draw(dt, t, particles, gbest, opts) {
      const ctx = this.ctx, W = this.W, H = this.H, N = this.N;
      if (!W || !this.Z) return;
      if (this.auto && !this.drag) this.yaw += dt * 0.12;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.5, W * 0.75);
      bg.addColorStop(0, '#0b1230'); bg.addColorStop(1, '#03050d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // project vertices
      const PX = new Float32Array(N * N), PY = new Float32Array(N * N), PZ = new Float32Array(N * N);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const k = j * N + i;
        const p = this.proj(i / (N - 1) - 0.5, j / (N - 1) - 0.5, this.Z[k]);
        PX[k] = p[0]; PY[k] = p[1]; PZ[k] = p[2];
      }
      // floor frame
      ctx.strokeStyle = 'rgba(140,150,255,0.25)'; ctx.lineWidth = 1;
      const corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]].map((c) => this.proj(c[0], c[1], -0.15));
      ctx.beginPath(); corners.forEach((c, i) => (i ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1]))); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(140,150,255,0.04)'; ctx.fill();

      // sort quads back-to-front
      const Q = (N - 1) * (N - 1);
      if (!this.order || this.order.length !== Q) this.order = new Uint32Array(Q).map((_, i) => i);
      const depth = this.depth && this.depth.length === Q ? this.depth : (this.depth = new Float32Array(Q));
      for (let q = 0; q < Q; q++) {
        const j = (q / (N - 1)) | 0, i = q % (N - 1), k = j * N + i;
        depth[q] = PZ[k] + PZ[k + 1] + PZ[k + N] + PZ[k + N + 1];
      }
      const ord = Array.from(this.order).sort((a, b) => depth[a] - depth[b]);
      ctx.lineWidth = 0.6; ctx.lineJoin = 'round';
      for (const q of ord) {
        const j = (q / (N - 1)) | 0, i = q % (N - 1), k = j * N + i;
        ctx.beginPath();
        ctx.moveTo(PX[k], PY[k]); ctx.lineTo(PX[k + 1], PY[k + 1]); ctx.lineTo(PX[k + N + 1], PY[k + N + 1]); ctx.lineTo(PX[k + N], PY[k + N]);
        ctx.closePath();
        ctx.fillStyle = this.cols[q]; ctx.fill();
        ctx.strokeStyle = this.edgeCols[q]; ctx.stroke();
      }

      // optimum markers
      if (opts.showOpt) for (const m of this.fn.minima) {
        const uv = this.uv(m[0], m[1]);
        const z = this.field.t(this.fn.f(m[0], m[1]));
        const p = this.proj(uv[0], uv[1], z), top = this.proj(uv[0], uv[1], z + 0.5);
        ctx.strokeStyle = 'rgba(94,234,212,0.7)'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(top[0], top[1]); ctx.stroke(); ctx.setLineDash([]);
      }

      // particles (drawn on top of the surface)
      ctx.globalCompositeOperation = 'lighter';
      const gl = U.glow(U.C.in, 12), gw = U.glow(U.C.white, 5);
      const pts = [];
      for (const p of particles) {
        const uv = this.uv(p.dx, p.dy);
        const z = this.field.t(this.fn.f(p.dx, p.dy)) + 0.03;
        const s = this.proj(uv[0], uv[1], z);
        pts.push({ s, p });
        U.drawGlow(ctx, gl, s[0], s[1], p.sel ? 22 : 12);
        U.drawGlow(ctx, gw, s[0], s[1], 4.5);
      }
      ctx.globalCompositeOperation = 'source-over';

      // gbest beacon
      if (gbest) {
        const uv = this.uv(gbest[0], gbest[1]);
        const z = this.field.t(this.fn.f(gbest[0], gbest[1]));
        const b = this.proj(uv[0], uv[1], z), top = this.proj(uv[0], uv[1], z + 0.9);
        const gr = ctx.createLinearGradient(b[0], b[1], top[0], top[1]);
        gr.addColorStop(0, 'rgba(251,113,133,0.9)'); gr.addColorStop(1, 'rgba(251,113,133,0)');
        ctx.strokeStyle = gr; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        U.drawGlow(ctx, U.glow(U.C.soc, 26), b[0], b[1], 30 + Math.sin(t * 4) * 4);
        ctx.globalCompositeOperation = 'source-over';
        U.star(ctx, b[0], b[1], 9, t * 1.2, '#ffe1e7');
        U.label(ctx, 'gbest', top[0], top[1] - 8, '#fb7185');
      }
      // axis hints
      ctx.fillStyle = 'rgba(154,163,199,0.7)'; ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      const ax = this.proj(0.58, -0.5, -0.15), ay = this.proj(-0.5, 0.58, -0.15);
      ctx.fillText('x', ax[0], ax[1]); ctx.fillText('y', ay[0], ay[1]);
      ctx.textAlign = 'right';
      ctx.fillText(this.auto ? 'drag to rotate · scroll to zoom · double-click to stop spin' : 'drag to rotate · scroll to zoom · double-click to auto-spin', W - 12, H - 14);
      return pts;
    }
  }
  P.Surface3D = Surface3D;
})(window.PSO);
