/* Hyper Typer: a typing-speed test using lines of code from Vinir's projects. */
ARCADE.register({
  id: "typer",
  name: "Hyper Typer",
  icon: "⌨️",
  blurb: "Type real lines of code from Vinir's projects as fast as you can.",
  help: "just start typing · Backspace fixes mistakes",
  create(body, api) {
    const LINES = [
      "index.upsert(vectors=batch, namespace=course_id)",
      "const pos = satellite.propagate(satrec, new Date());",
      "docker compose up --build -d",
      "git checkout -b feature/slide-alignment",
      "df = pd.read_csv('records.csv').dropna()",
      "model = RandomForestClassifier(n_estimators=200)",
      "agent.run(task, tools=[browse, add_to_cart])",
      "if (cart.checkout) throw new Error('blocked');",
      "this.chart = new Chart(ctx, { type: 'line' });",
      "renderer.render(scene, camera);",
      "SELECT course, COUNT(*) FROM docs GROUP BY course;",
      "embeddings = client.embed(chunks, model=EMBED_MODEL)",
      "@State private var runs: [Run] = []",
      "git push origin main",
    ];
    const ROUND = 5;
    body.innerHTML = `
      <div class="typer">
        <div class="typer-progress mono"></div>
        <div class="typer-line mono" aria-live="off"></div>
        <input class="typer-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type the line of code shown">
        <p class="typer-hint mono dim">Click here and start typing ↑</p>
      </div>`;
    const lineEl = body.querySelector(".typer-line");
    const progEl = body.querySelector(".typer-progress");
    const input = body.querySelector(".typer-input");
    let queue = [], idx = 0, typed = "", startedAt = 0, correctChars = 0, keystrokes = 0, errors = 0, running = false, timer = 0;

    const elapsed = () => (startedAt ? (Date.now() - startedAt) / 1000 : 0);
    const wpm = () => { const m = elapsed() / 60; return elapsed() >= 2 || idx >= ROUND ? Math.round((correctChars + countCorrect()) / 5 / m) : 0; };
    const acc = () => (keystrokes ? Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 100)) : 100);
    function countCorrect() { let n = 0; const t = queue[idx] || ""; for (let i = 0; i < typed.length; i++) if (typed[i] === t[i]) n++; return n; }
    const hud = () => api.hud(`<span>WPM <b>${wpm()}</b></span><span>ACCURACY <b>${acc()}%</b></span><span>LINE <b>${Math.min(idx + 1, ROUND)}/${ROUND}</b></span><span>BEST <b>${api.best() ?? 0} wpm</b></span>`);

    function render() {
      const target = queue[idx] || "";
      let html = "";
      for (let i = 0; i < target.length; i++) {
        const ch = target[i] === " " ? "&nbsp;" : target[i].replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
        let cls = "";
        if (i < typed.length) cls = typed[i] === target[i] ? "ok" : "bad";
        else if (i === typed.length) cls = "cur";
        html += `<span class="${cls}">${ch}</span>`;
      }
      lineEl.innerHTML = html;
      progEl.innerHTML = Array.from({ length: ROUND }, (_, i) => `<i class="${i < idx ? "done" : i === idx ? "now" : ""}"></i>`).join("");
    }

    function reset() {
      queue = [...LINES].sort(() => Math.random() - 0.5).slice(0, ROUND);
      idx = 0; typed = ""; startedAt = 0; correctChars = 0; keystrokes = 0; errors = 0; running = true;
      input.value = "";
      clearInterval(timer);
      render(); hud();
      input.focus({ preventScroll: true });
    }

    input.addEventListener("input", () => {
      if (!running) { input.value = ""; return; }
      if (!startedAt) { startedAt = Date.now(); api.played(); timer = setInterval(hud, 500); }
      const target = queue[idx];
      const val = input.value;
      if (val.length > typed.length) {
        // count each newly typed character once
        for (let i = typed.length; i < val.length; i++) { keystrokes++; if (val[i] !== target[i]) errors++; }
      }
      typed = val.slice(0, target.length);
      if (typed === target) {
        correctChars += target.length + 1; // +1 for the implicit "enter"
        idx++; typed = ""; input.value = "";
        if (idx >= ROUND) return finish();
      }
      render(); hud();
    });

    function finish() {
      running = false;
      clearInterval(timer);
      const score = wpm(), accuracy = acc();
      render(); hud();
      const best = api.submit(score);
      if (score >= 40 && accuracy >= 90) api.unlock("typer");
      api.overlay({
        title: best ? "NEW RECORD!" : "COMPILED ✓",
        sub: `<b>${score} WPM</b> at ${accuracy}% accuracy · Best: <b>${api.best()} wpm</b>${score >= 40 && accuracy >= 90 ? "" : "<br>Hit 40+ WPM at 90%+ accuracy for an achievement"}`,
        button: "↻ New snippets",
        onStart: reset,
      });
    }

    body.querySelector(".typer").addEventListener("click", () => input.focus({ preventScroll: true }));
    api.overlay({ title: "HYPER TYPER", sub: `${ROUND} lines of real project code · Best: <b>${api.best() ?? 0} wpm</b>`, button: "▶ Start typing", onStart: reset });
    queue = LINES.slice(0, ROUND); render(); hud();
    return { destroy() { clearInterval(timer); running = false; } };
  },
});
