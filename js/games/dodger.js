/* Orbital Debris Dodger: pilot a satellite through LEO, dodge debris, grab data cores. */
ARCADE.register({
  id: "dodger",
  name: "Debris Dodger",
  icon: "🛰️",
  blurb: "Inspired by CelestiaGrid: dodge orbital debris and collect data cores.",
  help: "←/→ or A/D · touch & drag",
  create(body, api) {
    const { c, ctx, W, H, toLocal, dispose } = ARCADE.canvas(body, 800, 480);
    const keys = { left: false, right: false };
    let state = "idle", raf = 0, last = 0;
    let player, debris, cores, particles, stars, t, spawnT, coreT, score, bonus, shield, invuln, pointerX;

    function reset() {
      player = { x: W / 2, y: H - 70, vx: 0, r: 16 };
      debris = []; cores = []; particles = [];
      stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + 0.3 }));
      t = 0; spawnT = 0; coreT = 2; score = 0; bonus = 0; shield = 3; invuln = 0; pointerX = null;
      hud();
    }
    const hud = () => api.hud(`<span>SCORE <b>${score}</b></span><span>BEST <b>${api.best() ?? 0}</b></span><span>SHIELD <b>${"♥".repeat(Math.max(0, shield))}${"♡".repeat(Math.max(0, 3 - shield))}</b></span>`);

    function spawnDebris() {
      const r = 8 + Math.random() * 18;
      const n = 6 + ((Math.random() * 4) | 0);
      const pts = Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2, d = r * (0.6 + Math.random() * 0.5);
        return [Math.cos(a) * d, Math.sin(a) * d];
      });
      const diff = Math.min(1, t / 60);
      debris.push({ x: Math.random() * W, y: -30, r, vx: (Math.random() - 0.5) * 60, vy: 110 + Math.random() * 90 + diff * 220, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3, pts });
    }
    function burst(x, y, color, n = 18) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 180;
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6 + Math.random() * 0.4, color });
      }
    }

    function update(dt) {
      t += dt;
      if (pointerX !== null) { player.x += (pointerX - player.x) * Math.min(1, dt * 12); player.vx = 0; }
      else {
        if (keys.left) player.vx -= 1800 * dt;
        if (keys.right) player.vx += 1800 * dt;
        if (!keys.left && !keys.right) player.vx *= Math.pow(0.001, dt);
        player.vx = Math.max(-420, Math.min(420, player.vx));
        player.x += player.vx * dt;
      }
      player.x = Math.max(player.r, Math.min(W - player.r, player.x));

      spawnT -= dt;
      if (spawnT <= 0) { spawnDebris(); spawnT = Math.max(0.16, 0.7 - t * 0.012); }
      coreT -= dt;
      if (coreT <= 0) { cores.push({ x: 30 + Math.random() * (W - 60), y: -20, vy: 140 + Math.random() * 60, a: 0 }); coreT = 1.6 + Math.random() * 1.6; }
      for (const s of stars) { s.y += s.s * 40 * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } }

      invuln = Math.max(0, invuln - dt);
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.vr * dt;
        if (d.y > H + 40) { debris.splice(i, 1); continue; }
        if (Math.hypot(d.x - player.x, d.y - player.y) < d.r * 0.8 + player.r * 0.8 && invuln === 0) {
          debris.splice(i, 1);
          burst(player.x, player.y, "255,77,109", 26);
          shield--; invuln = 1.2;
          if (shield <= 0) return over();
        }
      }
      for (let i = cores.length - 1; i >= 0; i--) {
        const k = cores[i];
        k.y += k.vy * dt; k.a += dt * 3;
        if (k.y > H + 20) { cores.splice(i, 1); continue; }
        if (Math.hypot(k.x - player.x, k.y - player.y) < 12 + player.r) { cores.splice(i, 1); bonus += 5; burst(k.x, k.y, "255,225,77", 14); }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
      score = Math.floor(t * 2) + bonus;
      if (score >= 50) api.unlock("ace");
      hud();
    }

    function drawSat(x, y) {
      ctx.save(); ctx.translate(x, y);
      ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 16;
      ctx.fillStyle = "#1d4ed8"; ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 1.5;
      ctx.fillRect(-34, -6, 20, 12); ctx.strokeRect(-34, -6, 20, 12);
      ctx.fillRect(14, -6, 20, 12); ctx.strokeRect(14, -6, 20, 12);
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-8, 0); ctx.moveTo(8, 0); ctx.lineTo(14, 0); ctx.stroke();
      ctx.fillStyle = "#e6f1ff"; ctx.fillRect(-8, -10, 16, 20);
      ctx.fillStyle = "#ff2bd6"; ctx.fillRect(-3, -14, 6, 4);
      ctx.shadowColor = "#ffe14d";
      ctx.fillStyle = `rgba(255,225,77,${0.5 + Math.random() * 0.5})`;
      ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(4, 10); ctx.lineTo(0, 18 + Math.random() * 6); ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.7)";
      for (const s of stars) ctx.fillRect(s.x, s.y, s.s, s.s);
      const g = ctx.createRadialGradient(W / 2, H + 900, 880, W / 2, H + 900, 960);
      g.addColorStop(0, "rgba(10,60,140,.9)"); g.addColorStop(0.7, "rgba(0,240,255,.35)"); g.addColorStop(1, "rgba(0,240,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, H + 900, 960, 0, Math.PI * 2); ctx.fill();
      for (const k of cores) {
        ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.a);
        ctx.shadowColor = "#ffe14d"; ctx.shadowBlur = 18; ctx.fillStyle = "#ffe14d";
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(8, 0); ctx.lineTo(0, 10); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      for (const d of debris) {
        ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot);
        ctx.fillStyle = "#3a4466"; ctx.strokeStyle = "#ff2bd6"; ctx.lineWidth = 1.5; ctx.shadowColor = "#ff2bd6"; ctx.shadowBlur = 8;
        ctx.beginPath(); d.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      for (const p of particles) { ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.life)})`; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
      if (state === "running" && !(invuln > 0 && Math.floor(invuln * 12) % 2 === 0)) drawSat(player.x, player.y);
    }

    function loop(now) {
      if (state !== "running") return;
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (api.active() && !document.hidden) update(dt);
      if (state === "running") draw();
      raf = requestAnimationFrame(loop);
    }
    function start() {
      reset(); state = "running"; api.unlock("pilot"); api.played();
      last = performance.now(); raf = requestAnimationFrame(loop);
    }
    function over() {
      state = "over";
      const best = api.submit(score);
      draw(); hud();
      api.overlay({ title: best ? "NEW HIGH SCORE!" : "SIGNAL LOST", sub: `Score: <b>${score}</b> · Best: <b>${api.best()}</b>`, button: "↻ Relaunch", onStart: start });
    }

    const kd = (e) => {
      if (state !== "running" || !api.active()) return;
      if (["ArrowLeft", "a", "A"].includes(e.key)) { keys.left = true; pointerX = null; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(e.key)) { keys.right = true; pointerX = null; e.preventDefault(); }
    };
    const ku = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keys.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keys.right = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    c.addEventListener("pointerdown", (e) => { if (state === "running") { pointerX = toLocal(e).x; c.setPointerCapture(e.pointerId); } });
    c.addEventListener("pointermove", (e) => { if (state === "running" && (e.pointerType !== "mouse" || e.buttons)) pointerX = toLocal(e).x; });
    c.addEventListener("pointerup", () => { pointerX = null; });

    reset(); draw();
    api.overlay({ title: "ORBITAL DEBRIS DODGER", sub: `Best: <b>${api.best() ?? 0}</b>`, button: "▶ Launch", onStart: start });

    return {
      destroy() {
        state = "idle"; cancelAnimationFrame(raf);
        window.removeEventListener("keydown", kd);
        window.removeEventListener("keyup", ku);
        dispose();
      },
    };
  },
});
