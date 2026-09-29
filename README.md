# VINIR.OS — Vinir Rai's Interactive Portfolio

A sci‑fi, game‑styled personal website & resume. Pure HTML/CSS/JS — no build step, no framework, no hosting bill. Runs on **GitHub Pages** for free.

## Features
- **Boot sequence** terminal intro (skippable, shown once per session)
- **Warp‑drive starfield** — reacts to your mouse; click space in the hero to warp
- **Player Profile** — RPG character card, animated stat counters and attribute bars
- **Quest Log** — experience as an expandable quest timeline with XP
- **Missions** — filterable project cards with 3D tilt
- **Inventory** — skills as item slots
- **Terminal** — a working command line (`help`, `whoami`, `quests`, `missions`, `sudo hire vinir`, …) with tab‑completion and history
- **Arcade** — *Orbital Debris Dodger*, a mini‑game inspired by CelestiaGrid (keyboard + touch), with a saved high score
- **Achievements & XP bar** — visitors level up by exploring; plus a Konami‑code easter egg
- Responsive down to phone width, keyboard accessible, respects `prefers-reduced-motion`

## Editing your content
**All content lives in [`js/data.js`](js/data.js).** Update jobs, projects, skills, links there — no other file needs to change.

- **Resume download button:** drop a PDF into `assets/` and set `links.resume` to e.g. `"assets/Vinir_Rai_Resume.pdf"`.
- **Project links:** each mission has optional `repo` and `live` fields; empty strings hide the link.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages (free)
1. Merge this branch into `main`.
2. Make the repository **public** (Settings → General → Danger Zone → Change visibility). Pages on private repos requires a paid plan.
3. Settings → **Pages** → *Build and deployment* → Source: **Deploy from a branch** → Branch: **`main`**, folder **`/ (root)`** → Save.
4. After ~1 minute the site is live at **https://vinirrai.github.io/mywebsite/**.

> Want it at `https://vinirrai.github.io/` instead? Rename the repo to `vinirrai.github.io`.

## Structure
```
index.html      page skeleton
css/style.css   all styles (theme tokens at the top)
js/data.js      ← your content
js/main.js      boot, starfield, rendering, achievements, terminal
js/game.js      Orbital Debris Dodger
assets/         put your resume PDF / images here
```
