/* VINIR.OS Arcade — Orbital Debris Dodger (inspired by CelestiaGrid) */
(() => {
  "use strict";
  const canvas = document.getElementById("game");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = 800, H = 480;
  const overlay = document.getElementById("game-overlay");
  const startBtn = document.getElementById("game-start");
  const scoreEl = document.getElementById("score");
  const shieldEl = document.getElementById("shield");
  const hiEl = document.getElementById("hi");
  const titleEl = document.getElementById("go-title");
  const subEl = document.getElementById("go-sub");
  const VOS = window.VOS || { unlock() {}, store: { get: (k, d) => d, set() {} } };

  let hi = VOS.store.get("vos-hi", 0);
  hiEl.textContent = hi;

  const keys = { left: false, right: false };
  let state = "idle"; // idle | running | over
  let player, debris, cores, particles, stars, t, spawnT, coreT, score, bonus, shield, invuln, pointerX, visible = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || W;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssW * (H / W) * dpr);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    if (state !== "running") draw();
  }

  function reset() {
    player = { x: W / 2, y: H - 70, vx: 0, r: 16 };
    debris = []; cores = []; particles = [];
    stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + 0.3 }));
    t = 0; spawnT = 0; coreT = 2; score = 0; bonus = 0; shield = 3; invuln = 0; pointerX = null;
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = score;
    shieldEl.textContent = "♥".repeat(shield) + "♡".repeat(Math.max(0, 3 - shield));
  }

  function spawnDebris() {
    const r = 8 + Math.random() * 18;
    const n = 6 + ((Math.random() * 4) | 0);
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const d = r * (0.6 + Math.random() * 0.5);
      return [Math.cos(a) * d, Math.sin(a) * d];
    });
    const diff = Math.min(1, t / 60);
    debris.push({
      x: Math.random() * W, y: -30, r,
      vx: (Math.random() - 0.5) * 60,
      vy: 110 + Math.random() * 90 + diff * 220,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3, pts,
    });
  }

  function burst(x, y, color, n = 18) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 180;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6 + Math.random() * 0.4, color });
    }
  }

  function update(dt) {
    t += dt;
    // Movement
    const accel = 1800, maxV = 420;
    if (pointerX !== null) {
      player.x += (pointerX - player.x) * Math.min(1, dt * 12);
      player.vx = 0;
    } else {
      if (keys.left) player.vx -= accel * dt;
      if (keys.right) player.vx += accel * dt;
      if (!keys.left && !keys.right) player.vx *= Math.pow(0.001, dt);
      player.vx = Math.max(-maxV, Math.min(maxV, player.vx));
      player.x += player.vx * dt;
    }
    player.x = Math.max(player.r, Math.min(W - player.r, player.x));

    // Spawning — ramps up over time
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
      const dist = Math.hypot(d.x - player.x, d.y - player.y);
      if (dist < d.r * 0.8 + player.r * 0.8 && invuln === 0) {
        debris.splice(i, 1);
        burst(player.x, player.y, "255,77,109", 26);
        shield--; invuln = 1.2;
        if (shield <= 0) { gameOver(); return; }
      }
    }
    for (let i = cores.length - 1; i >= 0; i--) {
      const c = cores[i];
      c.y += c.vy * dt; c.a += dt * 3;
      if (c.y > H + 20) { cores.splice(i, 1); continue; }
      if (Math.hypot(c.x - player.x, c.y - player.y) < 12 + player.r) {
        cores.splice(i, 1); bonus += 5; burst(c.x, c.y, "255,225,77", 14);
      }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    score = Math.floor(t * 2) + bonus;
    if (score >= 50) VOS.unlock("ace");
    updateHud();
  }

  function drawSatellite(x, y, blink) {
    if (blink) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 16;
    // solar panels
    ctx.fillStyle = "#1d4ed8"; ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 1.5;
    ctx.fillRect(-34, -6, 20, 12); ctx.strokeRect(-34, -6, 20, 12);
    ctx.fillRect(14, -6, 20, 12); ctx.strokeRect(14, -6, 20, 12);
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-8, 0); ctx.moveTo(8, 0); ctx.lineTo(14, 0); ctx.stroke();
    // body
    ctx.fillStyle = "#e6f1ff";
    ctx.fillRect(-8, -10, 16, 20);
    ctx.fillStyle = "#ff2bd6";
    ctx.fillRect(-3, -14, 6, 4);
    // thruster
    ctx.shadowColor = "#ffe14d";
    ctx.fillStyle = `rgba(255,225,77,${0.5 + Math.random() * 0.5})`;
    ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(4, 10); ctx.lineTo(0, 18 + Math.random() * 6); ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Stars
    ctx.fillStyle = "rgba(255,255,255,.7)";
    for (const s of stars || []) { ctx.fillRect(s.x, s.y, s.s, s.s); }
    // Earth limb
    const g = ctx.createRadialGradient(W / 2, H + 900, 880, W / 2, H + 900, 960);
    g.addColorStop(0, "rgba(10,60,140,.9)"); g.addColorStop(0.7, "rgba(0,240,255,.35)"); g.addColorStop(1, "rgba(0,240,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(W / 2, H + 900, 960, 0, Math.PI * 2); ctx.fill();

    if (!player) return;
    // Cores
    for (const c of cores) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a);
      ctx.shadowColor = "#ffe14d"; ctx.shadowBlur = 18;
      ctx.fillStyle = "#ffe14d";
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(8, 0); ctx.lineTo(0, 10); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // Debris
    for (const d of debris) {
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot);
      ctx.fillStyle = "#3a4466"; ctx.strokeStyle = "#ff2bd6"; ctx.lineWidth = 1.5;
      ctx.shadowColor = "#ff2bd6"; ctx.shadowBlur = 8;
      ctx.beginPath(); d.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // Particles
    for (const p of particles) { ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.life)})`; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
    // Player
    if (state === "running") drawSatellite(player.x, player.y, invuln > 0 && Math.floor(invuln * 12) % 2 === 0);
  }

  let last = 0;
  function loop(now) {
    if (state !== "running") return;
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    if (visible && !document.hidden) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function start() {
    reset();
    state = "running";
    overlay.classList.add("hidden");
    VOS.unlock("pilot");
    last = performance.now();
    requestAnimationFrame(loop);
  }

  function gameOver() {
    state = "over";
    const newHi = score > hi;
    if (newHi) { hi = score; VOS.store.set("vos-hi", hi); }
    hiEl.textContent = hi;
    titleEl.textContent = newHi ? "NEW HIGH SCORE!" : "SIGNAL LOST";
    subEl.innerHTML = `Score: <b>${score}</b> · High score: <b>${hi}</b>`;
    startBtn.textContent = "↻ Relaunch";
    overlay.classList.remove("hidden");
    draw();
  }

  // Input
  startBtn.addEventListener("click", start);
  window.addEventListener("keydown", (e) => {
    if (state !== "running") return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { keys.left = true; pointerX = null; e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { keys.right = true; pointerX = null; e.preventDefault(); }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
  });
  const toLocal = (e) => { const r = canvas.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W; };
  canvas.addEventListener("pointerdown", (e) => { if (state === "running") { pointerX = toLocal(e); canvas.setPointerCapture(e.pointerId); } });
  canvas.addEventListener("pointermove", (e) => { if (state === "running" && (e.pointerType !== "mouse" || e.buttons)) pointerX = toLocal(e); });
  canvas.addEventListener("pointerup", () => { pointerX = null; });

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0.2 }).observe(canvas);
  window.addEventListener("resize", resize);

  reset();
  resize();
})();
