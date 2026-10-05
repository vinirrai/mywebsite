/* VINIR.OS Arcade: a small game hub. Each game registers itself with
 * ARCADE.register({ id, name, icon, blurb, help, create(stage, api) })
 * and create() returns { destroy() }. The hub owns the tabs, HUD and overlay. */
(() => {
  "use strict";
  const games = [];
  const VOS = () => window.VOS || { unlock() {}, store: { get: (k, d) => d, set() {} } };

  window.ARCADE = {
    games,
    register(game) { games.push(game); },
    open(id) { open(id); },
  };

  let current = null;     // { game, instance }
  let tabs, stage, helpEl;

  function api(game) {
    const hud = stage.querySelector(".game-hud");
    const overlay = stage.querySelector(".game-overlay");
    const key = "vos-best-" + game.id;
    return {
      unlock: (id) => VOS().unlock(id),
      best: () => VOS().store.get(key, null),
      save: (v) => VOS().store.set(key, v),
      // lowerIsBetter: e.g. fewest moves in a memory game
      submit(score, lowerIsBetter = false) {
        const b = VOS().store.get(key, null);
        const better = b === null || (lowerIsBetter ? score < b : score > b);
        if (better) VOS().store.set(key, score);
        return better;
      },
      hud(html) { hud.innerHTML = html; },
      overlay({ title, sub = "", button = "▶ Start", onStart }) {
        overlay.innerHTML = `<h3>${title}</h3>${sub ? `<p class="mono">${sub}</p>` : ""}<button class="btn btn-primary">${button}</button>`;
        overlay.classList.remove("hidden");
        const btn = overlay.querySelector("button");
        btn.addEventListener("click", () => { overlay.classList.add("hidden"); onStart(); }, { once: true });
        return btn;
      },
      hideOverlay() { overlay.classList.add("hidden"); },
      // True when the arcade is on screen, so games only grab arrow keys then
      active() {
        const r = stage.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      },
      played() {
        const set = new Set(VOS().store.get("vos-played", []));
        set.add(game.id);
        VOS().store.set("vos-played", [...set]);
        if (set.size >= games.length) VOS().unlock("arcade-all");
      },
    };
  }

  function open(id) {
    const game = games.find((g) => g.id === id) || games[0];
    if (current) current.instance.destroy();
    stage.innerHTML = `<div class="game-body"></div><div class="game-hud mono"></div><div class="game-overlay hidden"></div>`;
    stage.dataset.game = game.id;
    helpEl.innerHTML = `<b>${game.icon} ${game.name}:</b> ${game.blurb} <span class="mono dim">${game.help}</span>`;
    tabs.querySelectorAll("button").forEach((b) => {
      const on = b.dataset.id === game.id;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    current = { game, instance: game.create(stage.querySelector(".game-body"), api(game)) };
  }

  document.addEventListener("DOMContentLoaded", () => {
    tabs = document.getElementById("game-tabs");
    stage = document.getElementById("arcade-stage");
    helpEl = document.getElementById("game-help");
    if (!tabs || !stage) return;
    tabs.innerHTML = games.map((g) =>
      `<button class="game-tab" role="tab" data-id="${g.id}" aria-selected="false"><span>${g.icon}</span>${g.name}</button>`
    ).join("");
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-id]");
      if (b) open(b.dataset.id);
    });
    open(games[0].id);
  });

  /* Shared helper: a crisp, DPR-aware canvas with a fixed logical size. */
  window.ARCADE.canvas = (parent, W, H) => {
    const c = document.createElement("canvas");
    c.className = "game-canvas";
    c.style.aspectRatio = `${W} / ${H}`;
    parent.appendChild(c);
    const ctx = c.getContext("2d");
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = c.clientWidth || W;
      c.width = Math.round(cssW * dpr);
      c.height = Math.round(cssW * (H / W) * dpr);
      ctx.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    fit();
    const toLocal = (e) => {
      const r = c.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    return { c, ctx, W, H, toLocal, dispose: () => ro.disconnect() };
  };
})();
