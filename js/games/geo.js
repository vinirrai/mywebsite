/* Orbit Geo: a 3D globe trivia game. Spin the Earth, drop a pin where you
 * think a place is, and score by how close you land. Coastlines are
 * Natural Earth 1:110m land data (public domain). */
ARCADE.register({
  id: "geo",
  name: "Orbit Geo",
  icon: "🌍",
  blurb: "Spin a 3D Earth and pin famous places, rocket launch sites and stops on Vinir's map.",
  help: "drag to spin · click / tap to drop your pin",
  create(body, api) {
    const PLACES = {
      vinir: [
        { name: "Chapel Hill, NC", hint: "Home of UNC, where Vinir studies", lat: 35.9049, lon: -79.0469 },
        { name: "Detroit, MI", hint: "Where Vinir interned at AAA", lat: 42.3314, lon: -83.0458 },
        { name: "Bengaluru, India", hint: "Vinir's first web dev internship", lat: 12.9716, lon: 77.5946 },
        { name: "Mumbai, India", hint: "Where BITSoM is based", lat: 19.076, lon: 72.8777 },
      ],
      launch: [
        { name: "Kennedy Space Center", hint: "Rocket launch site in Florida", lat: 28.5729, lon: -80.649 },
        { name: "Baikonur Cosmodrome", hint: "Rocket launch site in Kazakhstan", lat: 45.965, lon: 63.305 },
        { name: "Satish Dhawan Space Centre", hint: "ISRO's launch site at Sriharikota", lat: 13.7199, lon: 80.2304 },
        { name: "Guiana Space Centre", hint: "Europe's launch site at Kourou", lat: 5.239, lon: -52.768 },
        { name: "Tanegashima Space Center", hint: "Japan's main launch site", lat: 30.4, lon: 130.97 },
        { name: "Vandenberg SFB", hint: "Launch site on the California coast", lat: 34.742, lon: -120.5724 },
      ],
      city: [
        { name: "Tokyo", lat: 35.6762, lon: 139.6503 }, { name: "Cairo", lat: 30.0444, lon: 31.2357 },
        { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 }, { name: "Sydney", lat: -33.8688, lon: 151.2093 },
        { name: "London", lat: 51.5074, lon: -0.1278 }, { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
        { name: "Reykjavik", lat: 64.1466, lon: -21.9426 }, { name: "Nairobi", lat: -1.2921, lon: 36.8219 },
        { name: "Lima", lat: -12.0464, lon: -77.0428 }, { name: "Singapore", lat: 1.3521, lon: 103.8198 },
        { name: "Mexico City", lat: 19.4326, lon: -99.1332 }, { name: "Honolulu", lat: 21.3069, lon: -157.8583 },
        { name: "Anchorage", lat: 61.2181, lon: -149.9003 }, { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
        { name: "Dubai", lat: 25.2048, lon: 55.2708 }, { name: "Moscow", lat: 55.7558, lon: 37.6173 },
      ],
    };
    const ROUNDS = 8;
    const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

    body.innerHTML = `
      <div class="geo">
        <div class="geo-stage"><p class="geo-loading mono">Loading Earth…</p></div>
        <div class="geo-bar">
          <p class="geo-q mono" aria-live="polite"></p>
          <button class="btn btn-primary geo-next" hidden>Next ▶</button>
        </div>
      </div>`;
    const stage = body.querySelector(".geo-stage");
    const qEl = body.querySelector(".geo-q");
    const nextBtn = body.querySelector(".geo-next");
    let alive = true, raf = 0, cleanup = () => {};

    const hav = (a, b) => {
      const R = 6371, rad = Math.PI / 180;
      const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };

    Promise.all([
      import(new URL("js/vendor/three.module.min.js", document.baseURI).href),
      fetch(new URL("assets/world-land-110m.json", document.baseURI)).then((r) => r.json()),
    ]).then(([THREE, rings]) => { if (alive) start(THREE, rings); })
      .catch(() => { stage.innerHTML = `<p class="geo-loading mono">This game needs WebGL, which isn't available on this device.</p>`; });

    function start(THREE, rings) {
      stage.innerHTML = "";
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      stage.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
      camera.position.set(0, 0, 4.2);

      const globe = new THREE.Group();
      scene.add(globe);
      const vec = (lat, lon, r = 1) => {
        const p = lat * Math.PI / 180, l = lon * Math.PI / 180;
        return new THREE.Vector3(r * Math.cos(p) * Math.cos(l), r * Math.sin(p), -r * Math.cos(p) * Math.sin(l));
      };

      globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.995, 64, 64), new THREE.MeshBasicMaterial({ color: 0x06102c })));
      // Coastlines
      const seg = [];
      for (const ring of rings) {
        for (let i = 0; i + 3 < ring.length; i += 2) {
          const a = vec(ring[i + 1], ring[i], 1.002), b = vec(ring[i + 3], ring[i + 2], 1.002);
          seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
      const coastGeo = new THREE.BufferGeometry();
      coastGeo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
      globe.add(new THREE.LineSegments(coastGeo, new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 })));
      // Graticule every 30°
      const grat = [];
      for (let lat = -60; lat <= 60; lat += 30) for (let lon = -180; lon < 180; lon += 5) {
        const a = vec(lat, lon, 1.001), b = vec(lat, lon + 5, 1.001); grat.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      for (let lon = -180; lon < 180; lon += 30) for (let lat = -85; lat < 85; lat += 5) {
        const a = vec(lat, lon, 1.001), b = vec(lat + 5, lon, 1.001); grat.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      const gratGeo = new THREE.BufferGeometry();
      gratGeo.setAttribute("position", new THREE.Float32BufferAttribute(grat, 3));
      globe.add(new THREE.LineSegments(gratGeo, new THREE.LineBasicMaterial({ color: 0x1d3a8a, transparent: true, opacity: 0.35 })));
      // Atmosphere rim
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.08, 48, 48), new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 4.0); gl_FragColor = vec4(0.0, 0.8, 1.0, f * 0.7); }`,
        side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })));

      const markers = new THREE.Group();
      globe.add(markers);
      const pin = (lat, lon, color) => {
        const g = new THREE.Group();
        const p = vec(lat, lon, 1);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), new THREE.MeshBasicMaterial({ color }));
        head.position.copy(vec(lat, lon, 1.07));
        const stem = new THREE.BufferGeometry().setFromPoints([p, vec(lat, lon, 1.07)]);
        g.add(head, new THREE.Line(stem, new THREE.LineBasicMaterial({ color })));
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.045, 32), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true }));
        ring.position.copy(vec(lat, lon, 1.003));
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize());
        ring.userData.pulse = true;
        g.add(ring);
        markers.add(g);
      };
      const arc = (a, b) => {
        const va = vec(a.lat, a.lon).normalize(), vb = vec(b.lat, b.lon).normalize();
        const pts = [];
        const angle = va.angleTo(vb);
        for (let i = 0; i <= 64; i++) {
          const t = i / 64;
          const v = new THREE.Vector3().copy(va).multiplyScalar(Math.sin((1 - t) * angle))
            .add(new THREE.Vector3().copy(vb).multiplyScalar(Math.sin(t * angle)))
            .divideScalar(Math.sin(angle) || 1).normalize();
          pts.push(v.multiplyScalar(1.004 + Math.sin(t * Math.PI) * Math.min(0.35, angle * 0.25)));
        }
        markers.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xffe14d, dashSize: 0.03, gapSize: 0.02 })).computeLineDistances());
      };

      // Rotation: yaw (y) then pitch (x). Targets let us glide to the answer.
      let rx = 0.35, ry = -Math.PI / 2 + 1.4, tx = null, ty = null;
      const centerOn = (lat, lon) => {
        tx = lat * Math.PI / 180;
        ty = -Math.PI / 2 - lon * Math.PI / 180;
        // take the short way around
        while (ty - ry > Math.PI) ty -= Math.PI * 2;
        while (ty - ry < -Math.PI) ty += Math.PI * 2;
      };

      // Game state
      let round = 0, score = 0, questions = [], answered = false;
      const hud = () => api.hud(`<span>ROUND <b>${Math.min(round + 1, ROUNDS)}/${ROUNDS}</b></span><span>SCORE <b>${score}</b></span><span>BEST <b>${api.best() ?? 0}</b></span>`);
      function newGame() {
        questions = [...pick(PLACES.vinir, 2), ...pick(PLACES.launch, 2), ...pick(PLACES.city, 4)].sort(() => Math.random() - 0.5);
        round = 0; score = 0;
        ask();
      }
      function ask() {
        answered = false;
        while (markers.children.length) markers.remove(markers.children[0]);
        const q = questions[round];
        qEl.innerHTML = `📍 Find <b>${q.name}</b>${q.hint ? ` <span class="dim">(${q.hint})</span>` : ""}`;
        nextBtn.hidden = true;
        hud();
      }
      function guess(lat, lon) {
        if (answered) return;
        answered = true;
        api.played();
        const q = questions[round];
        const d = hav({ lat, lon }, q);
        const pts = Math.round(1000 * Math.exp(-d / 1500));
        score += pts;
        pin(lat, lon, 0xff2bd6);
        pin(q.lat, q.lon, 0x39ff88);
        arc({ lat, lon }, q);
        centerOn((lat + q.lat) / 2, q.lon);
        qEl.innerHTML = `${d < 300 ? "🎯" : d < 1500 ? "👍" : "🛰️"} <b>${Math.round(d).toLocaleString()} km</b> from ${q.name} · <b>+${pts}</b>`;
        hud();
        nextBtn.hidden = false;
        nextBtn.textContent = round + 1 < ROUNDS ? "Next ▶" : "See score ▶";
        nextBtn.focus({ preventScroll: true });
      }
      nextBtn.addEventListener("click", () => {
        round++;
        if (round < ROUNDS) return ask();
        const best = api.submit(score);
        if (score >= 5000) api.unlock("geo");
        hud();
        api.overlay({
          title: best ? "NEW RECORD!" : "MISSION COMPLETE",
          sub: `You scored <b>${score}</b> / ${ROUNDS * 1000} · Best: <b>${api.best()}</b>${score >= 5000 ? "" : "<br>Score 5,000+ for an achievement"}`,
          button: "↻ New round",
          onStart: newGame,
        });
      });

      // Input: drag to rotate, click to guess
      const canvas = renderer.domElement;
      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      const hitSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({ visible: false }));
      globe.add(hitSphere);
      let drag = null;
      canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; canvas.setPointerCapture(e.pointerId); tx = ty = null; });
      canvas.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        ry += dx * 0.008; rx = Math.max(-1.3, Math.min(1.3, rx + dy * 0.008));
        drag.x = e.clientX; drag.y = e.clientY;
      });
      canvas.addEventListener("pointerup", (e) => {
        if (!drag) return;
        const click = drag.moved < 6;
        drag = null;
        if (!click) return;
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObject(hitSphere, false)[0];
        if (!hit) return;
        const p = globe.worldToLocal(hit.point.clone()).normalize();
        guess(Math.asin(p.y) * 180 / Math.PI, Math.atan2(-p.z, p.x) * 180 / Math.PI);
      });

      const fit = () => {
        const w = stage.clientWidth, h = stage.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.z = w / h < 1 ? 5.2 : 4.2;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(fit); ro.observe(stage); fit();

      let last = performance.now();
      const loop = (now) => {
        if (!alive) return;
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (!api.active() || document.hidden) return;
        if (tx !== null) { rx += (tx - rx) * 0.06; ry += (ty - ry) * 0.06; }
        else if (!drag && !answered) ry += dt * 0.08;
        globe.rotation.set(rx, ry, 0);
        const s = 1 + (Math.sin(now / 250) + 1) * 0.35;
        markers.traverse((o) => { if (o.userData.pulse) o.scale.setScalar(s); });
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);
      cleanup = () => { ro.disconnect(); renderer.dispose(); };

      hud();
      api.overlay({ title: "ORBIT GEO", sub: `${ROUNDS} places · drop a pin as close as you can · Best: <b>${api.best() ?? 0}</b>`, button: "▶ Start", onStart: newGame });
    }

    return { destroy() { alive = false; cancelAnimationFrame(raf); cleanup(); } };
  },
});
