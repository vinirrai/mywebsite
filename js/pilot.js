/* VINIR.OS Pilot Mode: fly a ship around a small solar system where every
 * planet is a section of the resume. Fly close to a planet to dock and read it.
 * Loaded on demand (dynamic import) so it costs nothing until someone opens it. */
import * as THREE from "./vendor/three.module.min.js";

const S = window.SITE;
const VOS = window.VOS || { unlock() {}, toast() {} };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PLANETS = [
  { id: "about", label: "Profile", color: 0x00f0ff, r: 4.2, orbit: 34, angle: 0.3 },
  { id: "quests", label: "Quest Log", color: 0x39ff88, r: 5.2, orbit: 56, angle: 1.6 },
  { id: "missions", label: "Missions", color: 0xffe14d, r: 6, orbit: 80, angle: 3.0, ring: true },
  { id: "inventory", label: "Inventory", color: 0x9b8cff, r: 4.6, orbit: 102, angle: 4.3 },
  { id: "arcade", label: "Arcade", color: 0xff2bd6, r: 5.4, orbit: 124, angle: 5.5, moon: true },
  { id: "contact", label: "Comms", color: 0xff9f43, r: 3.8, orbit: 144, angle: 2.3 },
];

function panelHTML(id) {
  const list = (items) => `<ul>${items.join("")}</ul>`;
  switch (id) {
    case "about":
      return `<p>${esc(S.headline)}</p><p class="dim">${esc(S.bio[0])}</p>`;
    case "quests":
      return list(S.quests.slice(0, 5).map((q) => `<li><b>${esc(q.title)}</b><br><span class="dim">${esc(q.org)} · ${esc(q.dates)}</span></li>`));
    case "missions":
      return list(S.missions.slice(0, 6).map((m) => `<li>${m.icon} <b>${esc(m.name)}</b>: <span class="dim">${esc(m.subtitle)}</span></li>`));
    case "inventory":
      return list(Object.entries(S.inventory).map(([g, it]) => `<li><b>${esc(g)}</b><br><span class="dim">${it.slice(0, 6).map(esc).join(", ")}</span></li>`));
    case "arcade":
      return `<p>${window.ARCADE ? ARCADE.games.length : 6} games: ${window.ARCADE ? ARCADE.games.map((g) => g.icon + " " + esc(g.name)).join(", ") : ""}.</p><p class="dim">Best scores are saved on this device.</p>`;
    case "contact":
      return list([
        S.links.email && `<li>✉ <a href="mailto:${esc(S.links.email)}">${esc(S.links.email)}</a></li>`,
        S.links.linkedin && `<li>in <a href="${esc(S.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>`,
        S.links.github && `<li>⌥ <a href="${esc(S.links.github)}" target="_blank" rel="noopener">GitHub</a></li>`,
      ].filter(Boolean));
  }
  return "";
}

let built = null;

export function open() {
  if (!built) built = build();
  built.show();
}

function glowTexture(color) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, color);
  grd.addColorStop(0.25, color.replace("1)", "0.55)"));
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function build() {
  /* ── DOM ─────────────────────────────────────────── */
  const root = document.createElement("div");
  root.id = "pilot";
  root.className = "pilot";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Pilot mode: fly between planets to explore the resume");
  root.tabIndex = -1;
  root.innerHTML = `
    <div class="pilot-labels"></div>
    <div class="pilot-hud mono">
      <div><b>PILOT MODE</b> · <span class="pilot-visited">0/${PLANETS.length}</span> planets visited</div>
      <div class="dim">SPEED <b class="pilot-speed">0</b></div>
    </div>
    <button class="pilot-exit btn" aria-label="Exit pilot mode">✕ Exit <span class="dim">(Esc)</span></button>
    <aside class="pilot-panel card" hidden>
      <h3></h3>
      <div class="pilot-body"></div>
      <button class="btn btn-primary pilot-open">Open full section ↗</button>
    </aside>
    <p class="pilot-help mono">W/↑ thrust · A D/← → steer · S/↓ brake · Shift boost · fly close to a planet to dock</p>
    <div class="pilot-touch" aria-hidden="true">
      <button data-k="left">◀</button><button data-k="thrust">▲</button><button data-k="right">▶</button>
    </div>`;
  document.body.appendChild(root);
  const labels = root.querySelector(".pilot-labels");
  const panel = root.querySelector(".pilot-panel");
  const visitedEl = root.querySelector(".pilot-visited");
  const speedEl = root.querySelector(".pilot-speed");

  /* ── Scene ───────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x03040c, 1);
  root.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03040c, 0.0016);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);

  scene.add(new THREE.AmbientLight(0x6070a0, 0.55));
  const sunLight = new THREE.PointLight(0xfff1d0, 2.4, 0, 0.6);
  scene.add(sunLight);

  // Stars
  const starPos = [];
  for (let i = 0; i < 4000; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(400 + Math.random() * 500);
    starPos.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false, fog: false })));

  // Sun
  const sun = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffd36e }));
  scene.add(sun);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,190,90,1)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sunGlow.scale.setScalar(34);
  sunGlow.material.opacity = 0.75;
  scene.add(sunGlow);

  // Planets
  const planets = PLANETS.map((p) => {
    const group = new THREE.Group();
    group.position.set(Math.cos(p.angle) * p.orbit, 0, Math.sin(p.angle) * p.orbit);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.r, 48, 48),
      new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.75, metalness: 0.1, emissive: p.color, emissiveIntensity: 0.12 })
    );
    group.add(mesh);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(`rgba(${(p.color >> 16) & 255},${(p.color >> 8) & 255},${p.color & 255},1)`), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.45 }));
    halo.scale.setScalar(p.r * 4.2);
    group.add(halo);
    if (p.ring) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(p.r * 1.4, p.r * 2.1, 64), new THREE.MeshBasicMaterial({ color: 0xffe9a0, side: THREE.DoubleSide, transparent: true, opacity: 0.35 }));
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);
    }
    let moon = null;
    if (p.moon) {
      moon = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 24), new THREE.MeshStandardMaterial({ color: 0xc8c8d8, roughness: 1 }));
      group.add(moon);
    }
    // Faint orbit path around the sun
    const pts = [];
    for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit)); }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: p.color, transparent: true, opacity: 0.12 })));
    scene.add(group);

    const label = document.createElement("button");
    label.className = "pilot-label mono";
    label.style.setProperty("--c", "#" + p.color.toString(16).padStart(6, "0"));
    label.addEventListener("click", () => { target = planets.find((x) => x.id === p.id); });
    labels.appendChild(label);
    return { ...p, group, mesh, moon, label, visited: false };
  });
  let target = null;

  // Ship
  const ship = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xe6f1ff, metalness: 0.6, roughness: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.6 });
  const hull = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4, 12), hullMat);
  hull.rotation.x = -Math.PI / 2; // cone tip points forward (-Z)
  const wing = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 1.4), accentMat);
  wing.position.z = 0.8;
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 1.2), accentMat);
  fin.position.set(0, 0.6, 1.2);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff2bd6, emissive: 0xff2bd6, emissiveIntensity: 0.4, roughness: 0.2 }));
  cockpit.position.set(0, 0.35, -0.3);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,180,60,1)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  flame.position.z = 2.4;
  ship.add(hull, wing, fin, cockpit, flame);
  const shipLight = new THREE.PointLight(0x9fdfff, 1.2, 30);
  ship.add(shipLight);
  scene.add(ship);

  /* ── Flight model (2.5D: flies in the orbital plane) ─ */
  const state = { pos: new THREE.Vector3(0, 0, 0), heading: 0, vel: new THREE.Vector3(), bank: 0 };
  const keys = {};
  const camPos = new THREE.Vector3();
  let chase = { back: 18, up: 7.5 };
  let running = false, raf = 0, last = 0, docked = null;

  function reset() {
    // Start just outside the sun, facing the first planet
    const p0 = planets[0];
    state.pos.set(0, 0, 0).add(new THREE.Vector3(Math.cos(p0.angle + 0.9), 0, Math.sin(p0.angle + 0.9)).multiplyScalar(22));
    state.heading = Math.atan2(p0.group.position.x - state.pos.x, p0.group.position.z - state.pos.z);
    state.vel.set(0, 0, 0);
    const fwd0 = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading));
    camPos.copy(state.pos).addScaledVector(fwd0, -chase.back).add(new THREE.Vector3(0, chase.up, 0));
  }

  function step(dt, t) {
    const turn = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
    const thrust = keys.thrust ? 1 : 0;
    const brake = keys.brake ? 1 : 0;
    const boost = keys.boost ? 2.2 : 1;
    state.heading += turn * dt * 2.1;
    state.bank += ((turn * 0.55) - state.bank) * Math.min(1, dt * 6);
    const fwd = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading));
    state.vel.addScaledVector(fwd, thrust * 38 * boost * dt);
    state.vel.multiplyScalar(Math.pow(brake ? 0.15 : 0.55, dt));
    const max = 34 * boost;
    if (state.vel.length() > max) state.vel.setLength(max);
    state.pos.addScaledVector(state.vel, dt);

    // Stay inside the system
    const R = state.pos.length();
    if (R > 175) state.pos.setLength(175);
    // Don't fly through the sun or planets
    const bodies = [{ p: sun.position, r: 12 }, ...planets.map((p) => ({ p: p.group.position, r: p.r + 2 }))];
    for (const b of bodies) {
      const d = state.pos.distanceTo(b.p);
      if (d < b.r) {
        const n = state.pos.clone().sub(b.p).normalize();
        state.pos.copy(b.p).addScaledVector(n, b.r);
        state.vel.addScaledVector(n, -state.vel.dot(n));
      }
    }

    ship.position.set(state.pos.x, Math.sin(t * 2) * 0.25, state.pos.z);
    ship.rotation.set(0, state.heading + Math.PI, 0);
    ship.rotateZ(state.bank);
    const speed = state.vel.length();
    flame.scale.setScalar(1.2 + thrust * (2.4 + Math.random() * 1.2) * boost * 0.6);
    flame.material.opacity = 0.4 + thrust * 0.6;
    speedEl.textContent = Math.round(speed * 10);

    // Chase camera
    const behind = state.pos.clone().addScaledVector(fwd, -chase.back).add(new THREE.Vector3(0, chase.up, 0));
    camPos.lerp(behind, 1 - Math.pow(0.02, dt));
    camera.position.copy(camPos);
    camera.lookAt(state.pos.x + fwd.x * 10, 0, state.pos.z + fwd.z * 10);

    // Docking
    let near = null;
    for (const p of planets) {
      const d = state.pos.distanceTo(p.group.position);
      if (d < p.r + 9) near = p;
      p.group.rotation.y += dt * 0.15;
      if (p.moon) p.moon.position.set(Math.cos(t * 0.8) * (p.r + 3), 0.6, Math.sin(t * 0.8) * (p.r + 3));
    }
    if (near !== docked) dock(near);
  }

  function dock(p) {
    docked = p;
    if (!p) { panel.hidden = true; return; }
    panel.hidden = false;
    panel.style.setProperty("--c", "#" + p.color.toString(16).padStart(6, "0"));
    panel.querySelector("h3").textContent = p.labelName;
    panel.querySelector(".pilot-body").innerHTML = panelHTML(p.id);
    if (!p.visited) {
      p.visited = true;
      const n = planets.filter((x) => x.visited).length;
      visitedEl.textContent = `${n}/${planets.length}`;
      if (n === planets.length) VOS.unlock("fly-all");
    }
    if (target === p) target = null;
  }

  /* ── Labels (projected planet names with distance) ─ */
  const tmp = new THREE.Vector3();
  function labelsUpdate(w, h) {
    for (const p of planets) {
      tmp.copy(p.group.position);
      tmp.y += p.r + 2.5;
      const v = tmp.project(camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2;
      const d = Math.round(state.pos.distanceTo(p.group.position));
      p.label.innerHTML = `${p.visited ? "✓ " : ""}${p.labelName} <span class="dim">${d}</span>`;
      p.label.style.transform = `translate(${((v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%, -100%)`;
      p.label.classList.toggle("off", !visible);
      p.label.classList.toggle("target", target === p);
    }
  }
  planets.forEach((p) => { p.labelName = PLANETS.find((x) => x.id === p.id).label; });

  // Autopilot hint: if a target is picked, steer toward it
  function autopilot(dt) {
    if (!target || keys.left || keys.right) return;
    const want = Math.atan2(target.group.position.x - state.pos.x, target.group.position.z - state.pos.z);
    let diff = want - state.heading;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    state.heading += Math.max(-1, Math.min(1, diff * 3)) * dt * 2.1;
    keys.autoThrust = Math.abs(diff) < 0.6;
  }

  /* ── Loop & sizing ───────────────────────────────── */
  let w = 1, h = 1;
  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 72 : 60;
    chase = w < h ? { back: 26, up: 11 } : { back: 18, up: 7.5 };
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", () => { if (running) resize(); });

  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    autopilot(dt);
    const userThrust = keys.thrust;
    if (keys.autoThrust && target) keys.thrust = true;
    step(dt, t);
    keys.thrust = userThrust;
    sun.rotation.y += dt * 0.05;
    renderer.render(scene, camera);
    labelsUpdate(w, h);
  }

  /* ── Input ───────────────────────────────────────── */
  const map = { ArrowUp: "thrust", w: "thrust", W: "thrust", ArrowDown: "brake", s: "brake", S: "brake", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", Shift: "boost" };
  const kd = (e) => {
    if (!running) return;
    if (e.key === "Escape") { hide(); return; }
    const k = map[e.key];
    if (k) {
      keys[k] = true;
      if (k === "left" || k === "right") target = null; // manual steering cancels autopilot
      e.preventDefault();
    }
  };
  const ku = (e) => { const k = map[e.key]; if (k) keys[k] = false; };
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);
  root.querySelectorAll(".pilot-touch button").forEach((b) => {
    const k = b.dataset.k;
    const on = (e) => { e.preventDefault(); keys[k] = true; if (k !== "thrust") target = null; };
    const off = () => { keys[k] = false; };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointerleave", off);
    b.addEventListener("pointercancel", off);
  });
  root.querySelector(".pilot-exit").addEventListener("click", () => hide());
  root.querySelector(".pilot-open").addEventListener("click", () => {
    const id = docked && docked.id;
    hide();
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  });

  let returnFocus = null;
  function show() {
    returnFocus = document.activeElement;
    resize();
    reset();
    planets.forEach((p) => { p.visited = false; });
    visitedEl.textContent = `0/${planets.length}`;
    docked = null; target = null; panel.hidden = true;
    Object.keys(keys).forEach((k) => (keys[k] = false));
    root.classList.add("open");
    document.body.classList.add("pilot-open");
    resize();
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
    root.focus({ preventScroll: true });
    VOS.unlock("fly");
  }
  function hide() {
    running = false;
    cancelAnimationFrame(raf);
    root.classList.remove("open");
    document.body.classList.remove("pilot-open");
    if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
  }

  return { show };
}
