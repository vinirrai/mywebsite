/* Bug Breaker: Breakout where every brick is a classic bug. Clear the board to ship. */
ARCADE.register({
  id: "breaker",
  name: "Bug Breaker",
  icon: "🐛",
  blurb: "Squash every bug in the codebase before your build fails.",
  help: "mouse / touch or ←/→ · space to launch",
  create(body, api) {
    const { c, ctx, W, H, toLocal, dispose } = ARCADE.canvas(body, 800, 480);
    const BUGS = ["NaN", "404", "null", "off-by-1", "segfault", "CORS", "race cond", "mem leak", "undefined", "deadlock", "typo", "merge conflict", "infinite loop", "stale cache", "flaky test", "timezone"];
    const COLORS = ["#ff2bd6", "#ff9f43", "#ffe14d", "#39ff88", "#00f0ff"];
    const ROWS = 5, COLS = 8, BW = 88, BH = 26, GAP = 6;
    const left = (W - (COLS * BW + (COLS - 1) * GAP)) / 2;
    let state = "idle", raf = 0, last = 0;
    let paddle, ball, bricks, particles, score, lives, level, stuck, keys = { l: false, r: false };

    function build() {
      bricks = [];
      for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
        // Later levels carve gaps into the wall for variety
        if (level > 1 && (r + col + level) % 7 === 0) continue;
        bricks.push({ x: left + col * (BW + GAP), y: 56 + r * (BH + GAP), hp: r < level - 1 ? 2 : 1, color: COLORS[r % COLORS.length], label: BUGS[(Math.random() * BUGS.length) | 0] });
      }
    }
    function resetBall() {
      stuck = true;
      ball = { x: paddle.x, y: paddle.y - 12, r: 7, vx: 0, vy: 0, speed: 360 + level * 40 };
    }
    function reset() {
      score = 0; lives = 3; level = 1;
      paddle = { x: W / 2, y: H - 30, w: 110, h: 12 };
      particles = [];
      build(); resetBall(); hud();
    }
    const hud = () => api.hud(`<span>SCORE <b>${score}</b></span><span>LEVEL <b>${level}</b></span><span>LIVES <b>${"♥".repeat(lives)}</b></span>`);

    function launch() {
      if (!stuck) return;
      stuck = false;
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      ball.vx = Math.cos(a) * ball.speed; ball.vy = Math.sin(a) * ball.speed;
    }
    function burst(x, y, color) {
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 160;
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, color });
      }
    }

    function update(dt) {
      if (keys.l) paddle.x -= 620 * dt;
      if (keys.r) paddle.x += 620 * dt;
      paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, paddle.x));
      if (stuck) { ball.x = paddle.x; ball.y = paddle.y - 12; }
      else {
        // Sub-step so a fast ball can't tunnel through a brick
        const steps = Math.ceil((Math.hypot(ball.vx, ball.vy) * dt) / 5);
        for (let s = 0; s < steps; s++) if (step(dt / steps)) break;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    function step(dt) {
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
      if (ball.y > H + 20) {
        lives--; hud();
        if (lives <= 0) { over(false); return true; }
        resetBall(); return true;
      }
      // Paddle: bounce angle depends on where the ball hits
      if (ball.vy > 0 && ball.y + ball.r >= paddle.y - paddle.h / 2 && ball.y < paddle.y && Math.abs(ball.x - paddle.x) < paddle.w / 2 + ball.r) {
        const off = (ball.x - paddle.x) / (paddle.w / 2);
        const a = -Math.PI / 2 + off * 1.05;
        ball.vx = Math.cos(a) * ball.speed; ball.vy = Math.sin(a) * ball.speed;
        ball.y = paddle.y - paddle.h / 2 - ball.r;
      }
      for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        const nx = Math.max(b.x, Math.min(ball.x, b.x + BW)), ny = Math.max(b.y, Math.min(ball.y, b.y + BH));
        if ((ball.x - nx) ** 2 + (ball.y - ny) ** 2 > ball.r * ball.r) continue;
        // Reflect on the axis of least penetration
        const overlapX = Math.min(ball.x + ball.r - b.x, b.x + BW - (ball.x - ball.r));
        const overlapY = Math.min(ball.y + ball.r - b.y, b.y + BH - (ball.y - ball.r));
        if (overlapX < overlapY) ball.vx = -ball.vx; else ball.vy = -ball.vy;
        b.hp--;
        if (b.hp <= 0) {
          burst(b.x + BW / 2, b.y + BH / 2, b.color);
          bricks.splice(i, 1);
          score += 10 * level;
        } else score += 5;
        hud();
        if (!bricks.length) levelUp();
        return true;
      }
      return false;
    }

    function levelUp() {
      api.unlock("breaker");
      level++;
      build(); resetBall(); hud();
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.font = "600 12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const b of bricks) {
        ctx.fillStyle = b.hp > 1 ? "rgba(255,255,255,.14)" : "rgba(12,18,40,.9)";
        ctx.strokeStyle = b.color; ctx.lineWidth = b.hp > 1 ? 2.5 : 1.5;
        roundRect(b.x, b.y, BW, BH, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = b.color;
        let fs = 12;
        ctx.font = `600 ${fs}px 'JetBrains Mono', monospace`;
        while (fs > 8 && ctx.measureText(b.label).width > BW - 10) ctx.font = `600 ${--fs}px 'JetBrains Mono', monospace`;
        ctx.fillText(b.label, b.x + BW / 2, b.y + BH / 2 + 1);
      }
      ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 14;
      ctx.fillStyle = "#00f0ff";
      roundRect(paddle.x - paddle.w / 2, paddle.y - paddle.h / 2, paddle.w, paddle.h, 6); ctx.fill();
      ctx.shadowColor = "#ffe14d"; ctx.fillStyle = "#ffe14d";
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      for (const p of particles) { ctx.globalAlpha = Math.max(0, p.life / 0.6); ctx.fillStyle = p.color; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); }
      ctx.globalAlpha = 1;
      if (stuck && state === "running") {
        ctx.fillStyle = "rgba(230,241,255,.7)"; ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillText("click / tap / space to launch", W / 2, H - 70);
      }
    }

    function loop(now) {
      if (state !== "running") return;
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (api.active() && !document.hidden) update(dt);
      if (state === "running") draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { reset(); state = "running"; api.played(); last = performance.now(); raf = requestAnimationFrame(loop); }
    function over() {
      state = "over";
      const best = api.submit(score);
      draw();
      api.overlay({ title: best ? "NEW HIGH SCORE!" : "BUILD FAILED", sub: `Score: <b>${score}</b> · Best: <b>${api.best()}</b>`, button: "↻ Retry", onStart: start });
    }

    const kd = (e) => {
      if (state !== "running" || !api.active()) return;
      if (e.key === "ArrowLeft" || e.key === "a") { keys.l = true; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d") { keys.r = true; e.preventDefault(); }
      if (e.key === " ") { launch(); e.preventDefault(); }
    };
    const ku = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.l = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.r = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    c.addEventListener("pointermove", (e) => { if (state === "running") paddle.x = toLocal(e).x; });
    c.addEventListener("pointerdown", (e) => { if (state === "running") { paddle.x = toLocal(e).x; launch(); } });

    reset(); draw();
    api.overlay({ title: "BUG BREAKER", sub: `Best: <b>${api.best() ?? 0}</b>`, button: "▶ Start debugging", onStart: start });

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
