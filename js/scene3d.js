/* VINIR.OS — 3D hero: a data-globe with orbiting satellites you can click to
 * navigate the site, plus a debris belt (a nod to CelestiaGrid).
 * Falls back silently to the 2D starfield when WebGL is unavailable,
 * the visitor prefers reduced motion, or Recruiter Mode is on. */
import * as THREE from "./vendor/three.module.min.js";

const host = document.getElementById("hero3d");
const labelLayer = document.getElementById("hero3d-labels");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

if (host && labelLayer && !reduceMotion && webglAvailable()) init();

function init() {
  const VOS = window.VOS || { unlock() {}, warp() {} };
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 1.4, 11);

  // Everything that orbits lives in `world`, so dragging rotates the whole system.
  const world = new THREE.Group();
  scene.add(world);

  /* ── Globe ─────────────────────────────────────────── */
  const R = 2;
  const globe = new THREE.Group();
  globe.rotation.z = THREE.MathUtils.degToRad(23.4);
  world.add(globe);

  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.985, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x050b24 })
  ));

  // Procedural "continents": fibonacci-sphere points kept where a cheap noise field is high.
  const noise = (x, y, z) =>
    Math.sin(x * 1.7 + Math.sin(y * 2.3)) * 0.5 +
    Math.sin(y * 2.9 + z * 1.3) * 0.35 +
    Math.sin(z * 3.9 + x * 2.1) * 0.25 +
    Math.sin((x + y + z) * 5.1) * 0.12;
  const land = [], landColor = [], ocean = [];
  const cyan = new THREE.Color(0x00f0ff), pink = new THREE.Color(0xff2bd6);
  const N = 7000;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    if (noise(x * 1.6, y * 1.6, z * 1.6) > 0.02) {
      land.push(x * R, y * R, z * R);
      const c = cyan.clone().lerp(pink, Math.max(0, Math.min(1, (y + 1) / 2 - 0.25)) * 0.55);
      landColor.push(c.r, c.g, c.b);
    } else if (i % 2 === 0) {
      ocean.push(x * R, y * R, z * R);
    }
  }
  const pts = (arr, colors, size, opacity, color) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    if (colors) g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({
      size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false,
      vertexColors: !!colors, color: colors ? 0xffffff : color,
    }));
  };
  globe.add(pts(land, landColor, 0.045, 0.95));
  globe.add(pts(ocean, null, 0.024, 0.45, 0x3a5cff));

  // Lat/long graticule
  const grat = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(R * 1.002, 24, 16)),
    new THREE.LineBasicMaterial({ color: 0x1d3a8a, transparent: true, opacity: 0.18 })
  );
  globe.add(grat);

  // Fresnel atmosphere
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.12, 48, 48),
    new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(0x00c8ff) } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 4.0);
          gl_FragColor = vec4(c, f * 0.7); }`,
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  world.add(atmosphere);

  /* ── Satellites (one per section) ──────────────────── */
  const SATS = [
    { id: "about", label: "Profile", color: 0x00f0ff, r: 2.8, tilt: 0.35, speed: 0.32, phase: 0.2 },
    { id: "quests", label: "Quest Log", color: 0x39ff88, r: 3.2, tilt: -0.5, speed: 0.26, phase: 2.1 },
    { id: "missions", label: "Missions", color: 0xffe14d, r: 3.6, tilt: 0.9, speed: 0.21, phase: 4.0 },
    { id: "arcade", label: "Arcade", color: 0xff2bd6, r: 4.0, tilt: -0.15, speed: 0.17, phase: 1.1 },
    { id: "contact", label: "Comms", color: 0x9b8cff, r: 4.4, tilt: 0.6, speed: 0.14, phase: 5.3 },
  ];
  const satMeshes = [];
  for (const s of SATS) {
    const orbit = new THREE.Group();
    orbit.rotation.x = s.tilt;
    orbit.rotation.y = s.phase;
    world.add(orbit);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(s.r, 0.004, 4, 160),
      new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.22 })
    );
    ring.rotation.x = Math.PI / 2;
    orbit.add(ring);

    const sat = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: s.color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.22), mat);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8, side: THREE.DoubleSide });
    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.12), panelMat);
    const p2 = p1.clone();
    p1.position.x = 0.27; p2.position.x = -0.27;
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.18, depthWrite: false })
    );
    // Generous invisible hit target so satellites are easy to click
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    sat.add(body, p1, p2, glow, hit);
    orbit.add(sat);

    const btn = document.createElement("button");
    btn.className = "sat-label mono";
    btn.type = "button";
    btn.textContent = s.label;
    btn.style.setProperty("--c", "#" + s.color.toString(16).padStart(6, "0"));
    btn.addEventListener("click", () => go(s.id));
    labelLayer.appendChild(btn);

    satMeshes.push({ ...s, orbit, sat, glow, ring, hit, btn, angle: s.phase * 3 });
  }

  /* ── Debris belt ───────────────────────────────────── */
  const debrisPos = [];
  for (let i = 0; i < 1400; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = 5.0 + (Math.random() - 0.5) * 0.6 + Math.random() * Math.random() * 0.6;
    debrisPos.push(Math.cos(a) * rr, (Math.random() - 0.5) * 0.18, Math.sin(a) * rr);
  }
  const debris = pts(debrisPos, null, 0.03, 0.55, 0xff7ad9);
  debris.rotation.x = 0.28;
  world.add(debris);

  /* ── Interaction ───────────────────────────────────── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  let drag = null;
  let yaw = 0, pitch = 0.12, vYaw = 0.0009, vPitch = 0;
  const mouse = { x: 0, y: 0 };
  let spin = 0;

  function go(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    VOS.unlock("orbit");
  }

  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(satMeshes.map((s) => s.hit), false);
    return hits.length ? satMeshes.find((s) => s.hit === hits[0].object) : null;
  }

  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width - 0.5;
    mouse.y = (e.clientY - r.top) / r.height - 0.5;
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      vYaw = dx * 0.0045;
      vPitch = dy * 0.003;
      drag.x = e.clientX; drag.y = e.clientY;
    } else {
      const s = pick(e);
      setHover(s);
    }
  });
  const end = (e) => {
    if (!drag) return;
    const wasClick = drag.moved < 6;
    drag = null;
    if (wasClick) {
      const s = pick(e);
      if (s) go(s.id);
      else { spin = 1; VOS.warp && VOS.warp(); }
    }
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", () => { drag = null; });
  canvas.addEventListener("pointerleave", () => setHover(null));

  function setHover(s) {
    if (hovered === s) return;
    if (hovered) hovered.btn.classList.remove("hot");
    hovered = s;
    if (s) s.btn.classList.add("hot");
    canvas.style.cursor = s ? "pointer" : "grab";
  }
  canvas.style.cursor = "grab";
  window.addEventListener("vos:warp", () => { spin = 1; });

  /* ── Layout ────────────────────────────────────────── */
  let w = 0, h = 0, wide = true;
  function resize() {
    const r = host.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    wide = w > 980;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // On wide screens the globe sits to the right of the hero text
    camera.setViewOffset(w, h, wide ? -w * 0.24 : 0, wide ? 0 : -h * 0.04, w, h);
    camera.position.z = wide ? 12.5 : 13.5;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  /* ── Render loop (paused when the hero is off-screen) ─ */
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(host);
  const textEl = document.querySelector(".hero-inner");
  let textBox = null;
  const measureText = () => {
    const hr = host.getBoundingClientRect(), tr = textEl.getBoundingClientRect();
    textBox = { l: tr.left - hr.left - 20, r: tr.right - hr.left + 20, t: tr.top - hr.top - 20, b: tr.bottom - hr.top + 20 };
  };
  new ResizeObserver(measureText).observe(textEl);
  const tmp = new THREE.Vector3();
  const globeCenter = new THREE.Vector3();
  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden || document.body.classList.contains("recruiter")) return;

    // inertia + idle spin
    if (!drag) { vYaw += (0.0009 - vYaw) * 0.02; vPitch *= 0.92; }
    spin *= 0.96;
    yaw += vYaw + spin * 0.06;
    pitch = Math.max(-0.6, Math.min(0.7, pitch + vPitch * 0.4));
    world.rotation.y = yaw;
    world.rotation.x = pitch + mouse.y * 0.08;
    globe.rotation.y += dt * 0.05;
    debris.rotation.y -= dt * (0.03 + spin * 0.5);

    const t = now / 1000;
    for (const s of satMeshes) {
      s.angle += dt * s.speed * (1 + spin * 6) * (hovered === s ? 0.25 : 1);
      s.sat.position.set(Math.cos(s.angle) * s.r, 0, Math.sin(s.angle) * s.r);
      s.sat.rotation.y = -s.angle;
      const pulse = hovered === s ? 1.9 : 1 + Math.sin(t * 3 + s.phase) * 0.15;
      s.glow.scale.setScalar(pulse);
      s.ring.material.opacity = hovered === s ? 0.6 : 0.22;
    }

    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    // Position HTML labels; hide the ones behind the globe
    globe.getWorldPosition(globeCenter);
    const camDist = camera.position.distanceTo(globeCenter);
    for (const s of satMeshes) {
      s.sat.getWorldPosition(tmp);
      const behind = camera.position.distanceTo(tmp) > camDist;
      const sp = tmp.clone().project(camera);
      const cp = globeCenter.clone().project(camera);
      const rad = (R * 1.1) / camDist * (h / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const sx = (sp.x * 0.5 + 0.5) * w, sy = (-sp.y * 0.5 + 0.5) * h;
      const cx = (cp.x * 0.5 + 0.5) * w, cy = (-cp.y * 0.5 + 0.5) * h;
      const occluded = behind && Math.hypot(sx - cx, sy - cy) < rad;
      s.btn.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -150%)`;
      const underText = wide && textBox && sx > textBox.l && sx < textBox.r && sy > textBox.t && sy < textBox.b;
      s.btn.classList.toggle("occluded", occluded);
      s.btn.classList.toggle("under-text", !!underText);
      s.btn.tabIndex = occluded ? -1 : 0;
    }
  }
  requestAnimationFrame(frame);
  document.body.classList.add("has-3d");
}
