/* VINIR.OS interactive layer: boot, starfield, rendering, achievements, terminal */
(() => {
  "use strict";
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  /* ───────────── Achievements ───────────── */
  const ACH = [
    { id: "boot", icon: "🖥️", name: "System Online", desc: "Booted VINIR.OS" },
    { id: "explorer", icon: "🗺️", name: "Cartographer", desc: "Visited every section" },
    { id: "lore", icon: "📜", name: "Lore Master", desc: "Opened 3 quest reports" },
    { id: "filter", icon: "🚀", name: "Mission Control", desc: "Filtered the mission board" },
    { id: "hacker", icon: "💻", name: "Hacker Voice", desc: "Ran a terminal command" },
    { id: "sudo", icon: "🔓", name: "Root Access", desc: "Tried to sudo" },
    { id: "warp", icon: "🌌", name: "Warp Drive", desc: "Warped through the starfield" },
    { id: "pilot", icon: "🛰️", name: "Ignition", desc: "Launched the arcade" },
    { id: "ace", icon: "🏆", name: "Ace Pilot", desc: "Scored 50+ in the arcade" },
    { id: "konami", icon: "🕹️", name: "Old School", desc: "Entered the Konami code" },
    { id: "comms", icon: "🤝", name: "Handshake", desc: "Opened a comms channel" },
    { id: "orbit", icon: "🪐", name: "Orbital Navigator", desc: "Traveled by clicking a 3D satellite" },
    { id: "recruiter", icon: "👔", name: "Suit Up", desc: "Tried Recruiter Mode" },
    { id: "breaker", icon: "🐛", name: "Debugger", desc: "Cleared a level of Bug Breaker" },
    { id: "memory", icon: "🧠", name: "Total Recall", desc: "Completed Stack Match" },
    { id: "typer", icon: "⌨️", name: "Speed Coder", desc: "40+ WPM at 90%+ accuracy in Hyper Typer" },
    { id: "ttt", icon: "🤖", name: "Turing Tested", desc: "Drew against the Unbeatable minimax AI" },
    { id: "arcade-all", icon: "🕹️", name: "Arcade Champion", desc: "Played every arcade game" },
    { id: "geo", icon: "🌍", name: "Geo Genius", desc: "Scored 5,000+ in Orbit Geo" },
    { id: "fly", icon: "🚀", name: "Liftoff", desc: "Launched Pilot Mode" },
    { id: "fly-all", icon: "🪐", name: "Grand Tour", desc: "Docked at every planet in Pilot Mode" },
  ];
  const got = new Set(store.get("vos-ach", []));

  function updateXP() {
    const n = got.size;
    $("#ach-count").textContent = n;
    $("#ach-total").textContent = ACH.length;
    $("#lvl").textContent = 1 + n;
    $("#xpfill").style.width = `${(n / ACH.length) * 100}%`;
  }

  function toast(icon, title, sub = "ACHIEVEMENT UNLOCKED") {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="t-ico">${icon}</span><div><small>${esc(sub)}</small><b>${esc(title)}</b></div>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, 3200);
  }

  function unlock(id) {
    if (got.has(id)) return;
    const a = ACH.find((x) => x.id === id);
    if (!a) return;
    got.add(id);
    store.set("vos-ach", [...got]);
    updateXP();
    toast(a.icon, a.name);
    if (got.size === ACH.length) setTimeout(() => toast("👑", "100% complete. You're hired?", "ALL ACHIEVEMENTS"), 900);
  }

  function renderAchList() {
    $("#ach-list").innerHTML = ACH.map((a) =>
      `<li class="${got.has(a.id) ? "got" : ""}"><span>${a.icon}</span><div><b>${esc(a.name)}</b><small>${got.has(a.id) ? esc(a.desc) : "???"}</small></div></li>`
    ).join("");
  }
  $("#ach-btn").addEventListener("click", () => { renderAchList(); $("#ach-dialog").showModal(); });

  window.VOS = { unlock, toast, store };

  /* ───────────── Boot sequence ───────────── */
  function boot() {
    const el = $("#boot");
    const log = $("#boot-log");
    const finish = () => {
      if (el.classList.contains("done")) return;
      el.classList.add("done");
      window.removeEventListener("keydown", finish);
      el.removeEventListener("click", finish);
      unlock("boot");
    };
    // Plays on every visit (skippable with any key or click); skipped for reduced-motion users
    if (reduceMotion) { el.classList.add("done"); unlock("boot"); return; }
    const lines = [
      "VINIR.OS BIOS v3.0  (c) 2026 Chapel Hill Dynamics",
      "",
      "CPU0: Tar Heel Core · Dean's List x4 ............. [ OK ]",
      "MEM : 4,400,000 rows checked ....................... [ OK ]",
      "LOAD: python typescript angular next.js swift ...... [ OK ]",
      "LOAD: rag.pinecone  llm.bridge  three.js ........... [ OK ]",
      `MNT : /quests    (${S.quests.length} entries) ............................ [ OK ]`,
      `MNT : /missions  (${S.missions.length} entries) ............................ [ OK ]`,
      "NET : uplink Chapel Hill, NC ....................... [ OK ]",
      "",
      "> welcome, player one.",
    ];
    let i = 0;
    const tick = () => {
      if (el.classList.contains("done")) return;
      if (i < lines.length) { log.textContent += lines[i++] + "\n"; setTimeout(tick, i < 3 ? 320 : 230); }
      else setTimeout(finish, 1500);
    };
    window.addEventListener("keydown", finish);
    el.addEventListener("click", finish);
    tick();
  }

  /* ───────────── Starfield ───────────── */
  function starfield() {
    const c = $("#starfield");
    const ctx = c.getContext("2d");
    let w, h, dpr, stars = [];
    let speed = 0.06, target = 0.06;
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const tints = ["255,255,255", "255,255,255", "255,255,255", "0,240,255", "255,43,214", "255,225,77"];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(900, Math.floor((w * h) / 2200));
      stars = Array.from({ length: n }, () => spawn(Math.random()));
    }
    function spawn(z = 1) {
      return { x: (Math.random() * 2 - 1), y: (Math.random() * 2 - 1), z: Math.max(z, 0.02), pz: z, t: tints[(Math.random() * tints.length) | 0] };
    }
    function frame(dt) {
      mouse.sx += (mouse.x - mouse.sx) * 0.05;
      mouse.sy += (mouse.y - mouse.sy) * 0.05;
      speed += (target - speed) * 0.04;
      const cx = w / 2 - mouse.sx * 30, cy = h / 2 - mouse.sy * 30;
      const f = Math.max(w, h) * 0.5;
      ctx.fillStyle = speed > 0.3 ? "rgba(5,6,15,0.35)" : "rgba(5,6,15,1)";
      ctx.fillRect(0, 0, w, h);
      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed * dt;
        if (s.z <= 0.02) { Object.assign(s, spawn(1)); continue; }
        const x = cx + (s.x / s.z) * f, y = cy + (s.y / s.z) * f;
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) { Object.assign(s, spawn(1)); continue; }
        const a = Math.min(1, (1 - s.z) * 1.4);
        const r = Math.max(0.3, (1 - s.z) * 2.2);
        if (speed > 0.2) {
          const px = cx + (s.x / s.pz) * f, py = cy + (s.y / s.pz) * f;
          ctx.strokeStyle = `rgba(${s.t},${a})`;
          ctx.lineWidth = r;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${s.t},${a})`;
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    let last = performance.now(), running = true;
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (running) frame(dt);
      requestAnimationFrame(loop);
    }
    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) { speed = target = 0; frame(0); window.addEventListener("resize", () => frame(0)); return { warp() {} }; }
    window.addEventListener("pointermove", (e) => { mouse.x = e.clientX / w - 0.5; mouse.y = e.clientY / h - 0.5; }, { passive: true });
    document.addEventListener("visibilitychange", () => { running = !document.hidden; last = performance.now(); });
    requestAnimationFrame(loop);

    const warp = () => {
      window.dispatchEvent(new Event("vos:warp"));
      target = 1.6;
      document.body.classList.add("warp");
      setTimeout(() => { target = 0.06; document.body.classList.remove("warp"); }, 900);
      unlock("warp");
    };
    // Warp when clicking "empty space" in the hero.
    $("#top").addEventListener("click", (e) => { if (!e.target.closest("a, button, #hero3d")) warp(); });
    return { warp };
  }

  /* ───────────── Typing roles ───────────── */
  function typeRoles() {
    const el = $("#typed");
    if (reduceMotion) { el.textContent = S.roles[0]; return; }
    let i = 0, j = 0, del = false;
    const step = () => {
      const word = S.roles[i];
      j += del ? -1 : 1;
      el.textContent = word.slice(0, j);
      let wait = del ? 35 : 70;
      if (!del && j === word.length) { del = true; wait = 1600; }
      else if (del && j === 0) { del = false; i = (i + 1) % S.roles.length; wait = 300; }
      setTimeout(step, wait);
    };
    step();
  }

  /* ───────────── Render content ───────────── */
  function render() {
    $("#headline").textContent = S.headline;
    $("#pc-name").textContent = S.name;
    $("#pc-class").textContent = S.playerClass;
    $("#pc-loc").textContent = S.location;
    $("#year").textContent = new Date().getFullYear();

    if (S.links.resume) { const r = $("#resume-btn"); r.href = S.links.resume; r.hidden = false; }
    $("#recruiter-contact").innerHTML = [
      S.links.email && `<a href="mailto:${esc(S.links.email)}">${esc(S.links.email)}</a>`,
      S.links.linkedin && `<a href="${esc(S.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`,
      S.links.github && `<a href="${esc(S.links.github)}" target="_blank" rel="noopener">GitHub</a>`,
      esc(S.location),
    ].filter(Boolean).join(" · ");

    $("#counters").innerHTML = S.counters.map((c) =>
      `<div class="counter"><b data-count="${c.value}" data-dec="${c.decimals || 0}" data-suffix="${esc(c.suffix || "")}">0</b><span>${esc(c.label)}</span></div>`
    ).join("");

    $("#bio").innerHTML = S.bio.map((p) => `<p>${esc(p)}</p>`).join("");

    $("#stats").innerHTML = S.stats.map((s) =>
      `<div class="stat-row"><span>${esc(s.label)}</span><div class="stat-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.value}" aria-label="${esc(s.label)}"><i data-w="${s.value}"></i></div><span class="val">${s.value}</span></div>`
    ).join("");

    $("#education").innerHTML = S.education.map((e) =>
      `<div class="edu-item"><b>${esc(e.degree)}</b>${esc(e.school)}<br><small>${esc(e.dates)}${e.detail ? " · " + esc(e.detail) : ""}</small></div>`
    ).join("");

    $("#trophies").innerHTML = S.trophies.map((t) => `<li><span>${t.icon}</span>${esc(t.name)}</li>`).join("");

    $("#guilds").innerHTML =
      `<div class="pill-row">${S.guilds.map((g) => `<span class="pill">${esc(g)}</span>`).join("")}</div>` +
      `<div class="pill-row">${S.hobbies.map((g) => `<span class="pill">${esc(g)}</span>`).join("")}</div>`;

    $("#quest-list").innerHTML = S.quests.map((q, i) => `
      <li class="quest ${q.status}">
        <button class="quest-head" aria-expanded="false" aria-controls="qb-${i}">
          <span class="q-title">${esc(q.title)}</span>
          <span class="q-org">${esc(q.org)} · ${esc(q.where)}</span>
          <span class="q-meta">
            <span class="badge ${q.status}">${q.status === "active" ? "● ACTIVE" : "✓ COMPLETE"}</span>
            <span>${esc(q.dates)}</span>
            <span class="q-xp">+${q.xp.toLocaleString()} XP</span>
          </span>
        </button>
        <div class="quest-body" id="qb-${i}" role="region">
          <div class="quest-body-inner">
            <ul>${q.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
            <div class="tags">${q.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          </div>
        </div>
      </li>`).join("");

    $("#mission-grid").innerHTML = S.missions.map((m) => `
      <article class="card mission tilt" data-cat="${m.category.join(" ")}">
        <div class="m-top"><span class="m-icon" aria-hidden="true">${m.icon}</span><span class="m-badge">${esc(m.badge)}</span></div>
        <h3>${esc(m.name)}</h3>
        <p class="m-sub">${esc(m.subtitle)}</p>
        <p class="m-desc">${esc(m.description)}</p>
        <div class="tech">${m.tech.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        ${m.repo || m.live ? `<div class="m-links">
          ${m.live ? `<a href="${esc(m.live)}" target="_blank" rel="noopener">▶ Live demo</a>` : ""}
          ${m.repo ? `<a href="${esc(m.repo)}" target="_blank" rel="noopener">&lt;/&gt; Source</a>` : ""}
        </div>` : ""}
      </article>`).join("");

    const rarity = ["#00f0ff", "#ff2bd6", "#ffe14d", "#39ff88", "#9b8cff", "#ff9f43"];
    $("#inv").innerHTML = Object.entries(S.inventory).map(([group, items], gi) => `
      <div class="inv-group">
        <h3>[${esc(group)}]</h3>
        <div class="inv-grid" style="--rarity:${rarity[gi % rarity.length]}">
          ${items.map((it) => `<div class="slot">${esc(it)}</div>`).join("")}
        </div>
      </div>`).join("");

    const links = [];
    if (S.links.email) links.push(`<a class="btn btn-primary" href="mailto:${esc(S.links.email)}">✉ ${esc(S.links.email)}</a>`);
    if (S.links.linkedin) links.push(`<a class="btn" href="${esc(S.links.linkedin)}" target="_blank" rel="noopener">in LinkedIn</a>`);
    if (S.links.github) links.push(`<a class="btn" href="${esc(S.links.github)}" target="_blank" rel="noopener">⌥ GitHub</a>`);
    if (S.links.resume) links.push(`<a class="btn" href="${esc(S.links.resume)}" download>⬇ Resume</a>`);
    $("#contact-links").innerHTML = links.join("");
    $$("#contact-links a").forEach((a) => a.addEventListener("click", () => unlock("comms")));
  }

  /* ───────────── Interactions ───────────── */
  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.dec, suf = el.dataset.suffix;
    if (reduceMotion || document.body.classList.contains("recruiter")) { el.textContent = end.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function observe() {
    // Reveal-on-scroll
    const revealTargets = $$(".card, .quest, .section-title, .inv-group");
    revealTargets.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        $$("[data-count]", en.target).forEach(countUp);
        $$(".stat-bar i", en.target).forEach((i) => { i.style.width = i.dataset.w + "%"; });
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el) => io.observe(el));

    // Section tracking → active nav + explorer achievement
    const sections = $$("[data-section]");
    const visited = new Set();
    const navLinks = $$(".hud-nav a");
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        visited.add(id);
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
        if (visited.size === sections.length) unlock("explorer");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => so.observe(s));
  }

  function quests() {
    const opened = new Set();
    $$(".quest-head").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const li = btn.parentElement;
        const open = li.classList.toggle("open");
        li.dataset.userOpen = open ? "1" : "0";
        btn.setAttribute("aria-expanded", open);
        if (open) { opened.add(i); if (opened.size >= 3) unlock("lore"); }
      });
    });
    // Open the first quest by default so visitors see what's inside.
    $(".quest-head")?.click();
  }

  function filters() {
    $$(".filters .chip").forEach((chip) => chip.addEventListener("click", () => {
      $$(".filters .chip").forEach((c) => c.classList.toggle("active", c === chip));
      const f = chip.dataset.filter;
      $$(".mission").forEach((m) => m.classList.toggle("hide", f !== "all" && !m.dataset.cat.split(" ").includes(f)));
      if (f !== "all") unlock("filter");
    }));
  }

  function tilt() {
    if (!finePointer || reduceMotion) return;
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  function mobileNav() {
    const btn = $(".nav-toggle"), list = $("#nav-list");
    btn.addEventListener("click", () => { const o = list.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
    $$("#nav-list a").forEach((a) => a.addEventListener("click", () => { list.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }));
  }

  /* ───────────── Recruiter mode ─────────────
   * One click strips the boot screen, 3D, animations, terminal and games
   * and expands every quest: a fast, plain resume view.
   * Shareable as ?mode=recruiter. */
  function recruiterMode() {
    const btn = $("#recruiter-btn");
    const params = new URLSearchParams(location.search);
    const set = (on, announce) => {
      document.body.classList.toggle("recruiter", on);
      btn.setAttribute("aria-pressed", on);
      btn.querySelector("span").textContent = on ? "Exit recruiter mode" : "Recruiter mode";
      $$(".quest").forEach((q) => {
        q.classList.toggle("open", on || q.dataset.userOpen === "1");
        q.querySelector(".quest-head").setAttribute("aria-expanded", q.classList.contains("open"));
      });
      store.set("vos-recruiter", on);
      if (on) {
        unlock("recruiter");
        $("#boot").classList.add("done");
        $$("[data-count]").forEach((c) => { c.textContent = (+c.dataset.count).toFixed(+c.dataset.dec) + c.dataset.suffix; });
        $$(".stat-bar i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
      }
      if (announce) toast(on ? "👔" : "🚀", on ? "Recruiter mode on" : "Full experience restored", "DISPLAY MODE");
    };
    const initial = params.get("mode") === "recruiter" || (params.get("mode") !== "game" && store.get("vos-recruiter", false));
    if (initial) set(true, false);
    btn.addEventListener("click", () => set(!document.body.classList.contains("recruiter"), true));
    return { set };
  }

  /* ───────────── Pilot mode (loaded on demand) ───────────── */
  function pilotMode() {
    const launch = async () => {
      try {
        const mod = await import(new URL("js/pilot.js", document.baseURI).href);
        mod.open();
      } catch (err) {
        toast("⚠️", "Pilot mode needs WebGL, which this browser doesn't support", "UNAVAILABLE");
      }
    };
    $$("#fly-btn, .fly-cta").forEach((b) => b.addEventListener("click", launch));
    return { launch };
  }

  function konami(sf) {
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    window.addEventListener("keydown", (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === code[pos] ? pos + 1 : (k === code[0] ? 1 : 0);
      if (pos === code.length) {
        pos = 0;
        document.body.classList.toggle("konami");
        sf.warp();
        unlock("konami");
      }
    });
  }

  /* ───────────── Terminal ───────────── */
  function terminal(sf) {
    const out = $("#term-out"), form = $("#term-form"), input = $("#term-in");
    const hist = []; let hi = 0;
    const print = (html, cls = "out") => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; };
    const link = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;
    const goto = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); };
    const files = {
      "about.txt": () => S.bio.map(esc).join("\n\n"),
      "resume.md": () => cmds.quests(),
      "secret.txt": () => "🥁 fun fact: I play drums. a kick drum is just a very loud clock signal.",
    };

    const cmds = {
      help: () => [
        "<span class='hl'>available commands</span>",
        "  whoami        who is Vinir?",
        "  quests        experience log",
        "  missions      projects",
        "  skills        inventory",
        "  education     degrees",
        "  awards        trophy case",
        "  contact       comms channels",
        "  goto &lt;id&gt;     jump to: about quests missions inventory arcade contact",
        "  ls / cat      browse files",
        "  games         list arcade games",
        "  play [game]   launch a game: dodger breaker memory typer ttt geo",
        "  recruiter     toggle recruiter mode (plain resume view)",
        "  fly           launch pilot mode: fly between planets",
        "  warp          engage warp drive",
        "  achievements  your progress",
        "  history, date, echo, clear",
      ].join("\n"),
      whoami: () => `<span class='y'>${esc(S.name)}</span> · ${esc(S.playerClass)}\n${esc(S.headline)}\nbase: ${esc(S.location)}`,
      about: () => cmds.whoami() + "\n\n" + esc(S.bio[0]),
      quests: () => S.quests.map((q) => `<span class='${q.status === "active" ? "ok" : "hl"}'>${q.status === "active" ? "●" : "✓"}</span> ${esc(q.title)}\n   <span class='y'>${esc(q.org)}</span> · ${esc(q.dates)}`).join("\n"),
      missions: () => S.missions.map((m) => `${m.icon} <span class='hl'>${esc(m.name)}</span>: ${esc(m.subtitle)}${m.live ? "  " + link(m.live, "[live]") : ""}${m.repo ? "  " + link(m.repo, "[src]") : ""}`).join("\n"),
      skills: () => Object.entries(S.inventory).map(([g, it]) => `<span class='y'>${esc(g)}</span>: ${it.map(esc).join(", ")}`).join("\n"),
      education: () => S.education.map((e) => `🎓 ${esc(e.degree)}, ${esc(e.school)} (${esc(e.dates)})${e.detail ? "\n   " + esc(e.detail) : ""}`).join("\n"),
      awards: () => S.trophies.map((t) => `${t.icon} ${esc(t.name)}`).join("\n"),
      contact: () => [
        S.links.email && `email    <a href="mailto:${esc(S.links.email)}">${esc(S.links.email)}</a>`,
        S.links.linkedin && `linkedin ${link(S.links.linkedin, S.links.linkedin)}`,
        S.links.github && `github   ${link(S.links.github, S.links.github)}`,
      ].filter(Boolean).join("\n"),
      ls: () => Object.keys(files).map((f) => `<span class='hl'>${f}</span>`).join("  "),
      cat: (arg) => files[arg] ? files[arg]() : `<span class='err'>cat: ${esc(arg || "")}: no such file</span>`,
      goto: (arg) => { if (!document.getElementById(arg || "")) return `<span class='err'>goto: unknown section '${esc(arg || "")}'</span>`; goto(arg); return `<span class='ok'>navigating to #${esc(arg)}…</span>`; },
      games: () => (window.ARCADE ? ARCADE.games.map((g) => `${g.icon} <span class='hl'>${g.id.padEnd(8)}</span> ${esc(g.name)}: ${esc(g.blurb)}`).join("\n") + "\n\ntype <span class='y'>play &lt;id&gt;</span>" : "arcade offline"),
      play: (arg) => {
        const g = window.ARCADE && ARCADE.games.find((x) => x.id === (arg || "").toLowerCase());
        if (arg && !g) return `<span class='err'>play: unknown game '${esc(arg)}'</span>. Try <span class='y'>games</span>`;
        if (window.ARCADE) ARCADE.open(g ? g.id : "dodger");
        goto("arcade");
        return `<span class='ok'>launching ${esc(g ? g.name : "the arcade")}…</span>`;
      },
      fly: () => { pilot.launch(); return "<span class='ok'>🚀 launching pilot mode… press Esc to return</span>"; },
      recruiter: () => { const on = !document.body.classList.contains("recruiter"); rm.set(on, true); return on ? "<span class='ok'>recruiter mode on: plain resume view</span>" : "<span class='ok'>full experience restored</span>"; },
      warp: () => { sf.warp(); return "<span class='ok'>⚡ warp drive engaged</span>"; },
      achievements: () => `${got.size}/${ACH.length} unlocked\n` + ACH.map((a) => `${got.has(a.id) ? a.icon : "🔒"} ${got.has(a.id) ? esc(a.name) : "???"}`).join("\n"),
      history: () => hist.map((h, i) => `${String(i + 1).padStart(3)}  ${esc(h)}`).join("\n"),
      date: () => new Date().toString(),
      echo: (arg, raw) => esc(raw),
      clear: () => { out.innerHTML = ""; return null; },
      sudo: (arg, raw) => {
        unlock("sudo");
        if (/hire/.test(raw)) return "<span class='ok'>[sudo] permission granted.</span>\nExcellent choice. Opening comms channel… " + (S.links.email ? `<a href="mailto:${esc(S.links.email)}">${esc(S.links.email)}</a>` : "");
        return "<span class='err'>guest is not in the sudoers file. This incident will be reported.</span>\n(hint: try <span class='y'>sudo hire vinir</span>)";
      },
      hire: () => "Try <span class='y'>sudo hire vinir</span> 😉",
      rm: () => "<span class='err'>nice try.</span>",
      exit: () => "there is no escape from VINIR.OS. (but you can scroll)",
    };
    const alias = { "?": "help", man: "help", experience: "quests", projects: "missions", work: "quests", inventory: "skills", game: "play", arcade: "play", resume: "quests", email: "contact", linkedin: "contact", github: "contact", cls: "clear", pilot: "fly" };

    function run(line) {
      const raw = line.trim();
      print(`<span class='prompt'>guest@vinir.os:~$</span> ${esc(raw)}`, "cmd");
      if (!raw) return;
      hist.push(raw); hi = hist.length;
      const [c0, ...rest] = raw.split(/\s+/);
      const name = alias[c0.toLowerCase()] || c0.toLowerCase();
      const fn = cmds[name];
      if (!fn) { print(`<span class='err'>command not found: ${esc(c0)}</span>. Type <span class='y'>help</span>`); return; }
      const res = fn(rest[0], rest.join(" "));
      if (res) print(res);
      unlock("hacker");
    }

    form.addEventListener("submit", (e) => { e.preventDefault(); run(input.value); input.value = ""; });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") { if (hi > 0) input.value = hist[--hi]; e.preventDefault(); }
      else if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault(); }
      else if (e.key === "Tab") {
        e.preventDefault();
        const v = input.value.toLowerCase();
        const match = Object.keys(cmds).filter((k) => k.startsWith(v));
        if (match.length === 1) input.value = match[0] + " ";
        else if (match.length > 1) print(match.join("  "));
      }
    });
    $("#term").addEventListener("click", (e) => { if (!e.target.closest("a")) input.focus({ preventScroll: true }); });

    print(`<span class='ok'>VINIR.OS terminal v3.0</span>. Type <span class='y'>help</span> to list commands. Tab completes, ↑/↓ for history.`);
  }

  /* ───────────── Init ───────────── */
  render();
  updateXP();
  boot();
  const sf = starfield();
  window.VOS.warp = sf.warp;
  typeRoles();
  quests();
  filters();
  tilt();
  mobileNav();
  observe();
  const rm = recruiterMode();
  const pilot = pilotMode();
  konami(sf);
  terminal(sf);
})();
