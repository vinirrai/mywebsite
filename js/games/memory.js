/* Stack Match: a memory game built from Vinir's real tech stack.
 * Each match reveals where that tool was used. */
ARCADE.register({
  id: "memory",
  name: "Stack Match",
  icon: "🧠",
  blurb: "Flip cards to match the tools behind Vinir's projects.",
  help: "click / tap or Tab + Enter",
  create(body, api) {
    const STACK = [
      { k: "Python", g: "🐍", fact: "Python + Pinecone pipelines power the Carla & Nik course assistants." },
      { k: "Pinecone", g: "🌲", fact: "Pinecone is the vector store behind Carla & Nik's cited answers." },
      { k: "Angular", g: "🅰️", fact: "Angular + Chart.js: the KPI dashboard built at AAA." },
      { k: "Three.js", g: "🧊", fact: "Three.js renders CelestiaGrid's 3D globe and this site's hero." },
      { k: "SwiftUI", g: "🍎", fact: "SwiftUI + MapKit power FitSync's live run mapping." },
      { k: "Docker", g: "🐳", fact: "Docker/Codespaces gave BITSoM students reproducible AI labs." },
      { k: "Next.js", g: "▲", fact: "Next.js fronts EstateWise and the MyAI4 assistant." },
      { k: "LLM Agents", g: "🤖", fact: "Agentic shopping lab: LLM agents with tool use and checkout safeguards." },
    ];
    body.innerHTML = `<div class="mem-wrap"><div class="mem-grid" role="grid"></div><p class="mem-fact mono" aria-live="polite">Match all 8 pairs in as few moves as you can.</p></div>`;
    const grid = body.querySelector(".mem-grid");
    const factEl = body.querySelector(".mem-fact");
    let first = null, lock = false, moves = 0, found = 0, started = 0, timer = 0;

    const hud = () => {
      const secs = started ? Math.floor((Date.now() - started) / 1000) : 0;
      api.hud(`<span>MOVES <b>${moves}</b></span><span>PAIRS <b>${found}/8</b></span><span>TIME <b>${secs}s</b></span><span>BEST <b>${api.best() ?? "-"}</b></span>`);
    };

    function deal() {
      first = null; lock = false; moves = 0; found = 0; started = 0;
      clearInterval(timer);
      const deck = [...STACK, ...STACK].map((c, i) => ({ ...c, i })).sort(() => Math.random() - 0.5);
      grid.innerHTML = deck.map((c) => `
        <button class="mem-card" data-k="${c.k}" aria-label="Hidden card">
          <span class="mem-inner"><span class="mem-front">?</span><span class="mem-back"><b>${c.g}</b><small>${c.k}</small></span></span>
        </button>`).join("");
      factEl.textContent = "Match all 8 pairs in as few moves as you can.";
      hud();
    }

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".mem-card");
      if (!card || lock || card.classList.contains("up")) return;
      if (!started) { started = Date.now(); api.played(); timer = setInterval(hud, 1000); }
      card.classList.add("up");
      card.setAttribute("aria-label", card.dataset.k);
      if (!first) { first = card; return; }
      moves++;
      if (first.dataset.k === card.dataset.k) {
        first.classList.add("matched"); card.classList.add("matched");
        found++;
        factEl.textContent = "✓ " + STACK.find((s) => s.k === card.dataset.k).fact;
        first = null;
        if (found === 8) win();
      } else {
        lock = true;
        const a = first;
        first = null;
        setTimeout(() => {
          a.classList.remove("up"); card.classList.remove("up");
          a.setAttribute("aria-label", "Hidden card"); card.setAttribute("aria-label", "Hidden card");
          lock = false;
        }, 750);
      }
      hud();
    });

    function win() {
      clearInterval(timer);
      const secs = Math.floor((Date.now() - started) / 1000);
      const best = api.submit(moves, true);
      api.unlock("memory");
      hud();
      setTimeout(() => api.overlay({
        title: best ? "NEW RECORD!" : "STACK COMPLETE",
        sub: `${moves} moves in ${secs}s · Best: <b>${api.best()} moves</b>`,
        button: "↻ Shuffle again",
        onStart: deal,
      }), 600);
    }

    deal();
    return { destroy() { clearInterval(timer); } };
  },
});
