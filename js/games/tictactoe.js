/* Neural Tic-Tac-Toe: play against a minimax AI with alpha-beta pruning.
 * "Unbeatable" plays perfectly; "Casual" makes a random move 45% of the time. */
ARCADE.register({
  id: "ttt",
  name: "Minimax Tic-Tac-Toe",
  icon: "🤖",
  blurb: "Challenge an AI that searches the whole game tree. Can you force a draw?",
  help: "you are X · click / tap a cell",
  create(body, api) {
    const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    body.innerHTML = `
      <div class="ttt">
        <div class="ttt-modes" role="group" aria-label="Difficulty">
          <button class="chip active" data-mode="hard">Unbeatable</button>
          <button class="chip" data-mode="easy">Casual</button>
        </div>
        <div class="ttt-board" role="grid" aria-label="Tic-tac-toe board"></div>
        <p class="ttt-status mono" aria-live="polite">Your move.</p>
        <p class="ttt-brain mono dim"></p>
        <button class="btn ttt-reset">↻ New game</button>
      </div>`;
    const boardEl = body.querySelector(".ttt-board");
    const statusEl = body.querySelector(".ttt-status");
    const brainEl = body.querySelector(".ttt-brain");
    let board, mode = "hard", over = false, nodes = 0, thinking = 0;
    const tally = api.best() || { w: 0, l: 0, d: 0 };

    const winner = (b) => {
      for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { p: b[a], line: [a, c, d] };
      return b.every(Boolean) ? { p: "draw" } : null;
    };

    // Minimax with alpha-beta pruning; prefers faster wins / slower losses via depth
    function minimax(b, player, depth, alpha, beta) {
      nodes++;
      const w = winner(b);
      if (w) return w.p === "O" ? 10 - depth : w.p === "X" ? depth - 10 : 0;
      if (player === "O") {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) if (!b[i]) {
          b[i] = "O"; best = Math.max(best, minimax(b, "X", depth + 1, alpha, beta)); b[i] = null;
          alpha = Math.max(alpha, best); if (beta <= alpha) break;
        }
        return best;
      }
      let best = Infinity;
      for (let i = 0; i < 9; i++) if (!b[i]) {
        b[i] = "X"; best = Math.min(best, minimax(b, "O", depth + 1, alpha, beta)); b[i] = null;
        beta = Math.min(beta, best); if (beta <= alpha) break;
      }
      return best;
    }

    function aiMove() {
      const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
      nodes = 0;
      if (mode === "easy" && Math.random() < 0.45) {
        brainEl.textContent = "🎲 Casual mode: picked a random cell this turn.";
        return empty[(Math.random() * empty.length) | 0];
      }
      let bestScore = -Infinity, move = empty[0];
      for (const i of empty) {
        board[i] = "O";
        const s = minimax(board, "X", 1, -Infinity, Infinity);
        board[i] = null;
        if (s > bestScore) { bestScore = s; move = i; }
      }
      const verdict = bestScore > 0 ? "I can force a win" : bestScore < 0 ? "you might beat me" : "best play is a draw";
      brainEl.textContent = `🧠 searched ${nodes.toLocaleString()} positions · evaluation: ${verdict}`;
      return move;
    }

    function render(win) {
      boardEl.innerHTML = board.map((v, i) =>
        `<button class="ttt-cell ${v ? "p" + v : ""} ${win && win.line && win.line.includes(i) ? "win" : ""}" data-i="${i}" aria-label="Cell ${i + 1}${v ? ", " + v : ", empty"}" ${v || over ? "disabled" : ""}>${v || ""}</button>`
      ).join("");
      api.hud(`<span>YOU <b>${tally.w}</b></span><span>AI <b>${tally.l}</b></span><span>DRAWS <b>${tally.d}</b></span><span>MODE <b>${mode === "hard" ? "UNBEATABLE" : "CASUAL"}</b></span>`);
    }

    function end(w) {
      over = true;
      if (w.p === "X") { tally.w++; statusEl.textContent = "🎉 You win! (Try Unbeatable mode…)"; }
      else if (w.p === "O") { tally.l++; statusEl.textContent = "🤖 AI wins. Minimax never forgets."; }
      else {
        tally.d++;
        statusEl.textContent = mode === "hard" ? "🤝 Draw. That's the best anyone can do against perfect play." : "🤝 Draw.";
        if (mode === "hard") api.unlock("ttt");
      }
      api.save(tally);
      render(w);
    }

    function newGame() {
      clearTimeout(thinking);
      board = Array(9).fill(null); over = false;
      statusEl.textContent = "Your move. You're X.";
      brainEl.textContent = "";
      render();
    }

    boardEl.addEventListener("click", (e) => {
      const cell = e.target.closest(".ttt-cell");
      if (!cell || over) return;
      const i = +cell.dataset.i;
      if (board[i]) return;
      api.played();
      board[i] = "X";
      let w = winner(board);
      if (w) return end(w);
      over = true; // lock input while the AI "thinks"
      statusEl.textContent = "AI is thinking…";
      render();
      thinking = setTimeout(() => {
        over = false;
        board[aiMove()] = "O";
        w = winner(board);
        if (w) return end(w);
        statusEl.textContent = "Your move.";
        render();
      }, 380);
    });
    body.querySelector(".ttt-modes").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-mode]");
      if (!b) return;
      mode = b.dataset.mode;
      body.querySelectorAll(".ttt-modes .chip").forEach((c) => c.classList.toggle("active", c === b));
      newGame();
    });
    body.querySelector(".ttt-reset").addEventListener("click", newGame);

    newGame();
    return { destroy() { clearTimeout(thinking); } };
  },
});
