# VINIR.OS: Vinir Rai's Interactive Portfolio

A space-themed personal website and resume with games. It is plain HTML, CSS and JavaScript with no build step and no framework, and it runs on **GitHub Pages** for free.

Live site: https://vinirrai.github.io/mywebsite/

## Features
- **3D globe hero** built with Three.js. Satellites orbit the globe and each one opens a section of the site. Drag to spin it.
- **Pilot mode**: fly a ship around a small solar system. Each planet is a section of the resume, and flying close to one docks and shows its details. Works with a keyboard or with on-screen buttons on phones.
- **Recruiter mode**: one click (or the link `?mode=recruiter`) turns off the 3D, animations and games and shows a plain resume with every role expanded.
- **Profile, experience, projects and skills** presented as a game: a player card, a quest log, mission cards and an inventory.
- **Terminal** with real commands such as `help`, `whoami`, `games`, `play geo`, `fly`, `recruiter` and `sudo hire vinir`.
- **Arcade with six games**. Best scores are saved on each visitor's device.
  - 🛰️ Debris Dodger: dodge orbital debris
  - 🐛 Bug Breaker: Breakout where every brick is a classic bug
  - 🧠 Stack Match: a memory game built from the real tech stack
  - ⌨️ Hyper Typer: a typing test using real lines of project code
  - 🤖 Minimax Tic-Tac-Toe: play an AI that cannot lose
  - 🌍 Orbit Geo: spin a 3D Earth and pin cities and rocket launch sites
- **21 achievements** and an XP bar, plus a Konami code easter egg.
- Works on phones, supports keyboard navigation, respects reduced motion settings and falls back to 2D when WebGL is not available.

## Editing your content
All content lives in [`js/data.js`](js/data.js). Update jobs, projects, skills and links there. No other file needs to change.

## Run locally
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages
1. Make the repository public.
2. Go to Settings, then Pages. Choose "Deploy from a branch", pick `main` and `/ (root)`, then save.
3. The site goes live at https://vinirrai.github.io/mywebsite/ about a minute later.

## Structure
```
index.html                 page layout
css/style.css              all styles
js/data.js                 your content
js/main.js                 boot screen, starfield, achievements, recruiter mode, terminal
js/scene3d.js              3D globe hero
js/pilot.js                pilot mode (loads only when opened)
js/arcade.js               arcade hub
js/games/                  the six games
js/vendor/                 Three.js (MIT license)
assets/world-land-110m.json  world coastlines from Natural Earth (public domain)
```
