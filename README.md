# best-game-01

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/gabrielm3/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/gabrielm3/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

AURORA — Ride the Light. A neon arcade game: steer a glowing wisp through a flowing aurora, catch the golden motes, dodge the void shards. Chain motes into a combo multiplier up to x8, clear the sky with a nova, survive a hit with a shield, and climb 10 levels as the aurora shifts colour. Three lives, a best score that persists, and a tiny WebAudio synth for every collect, hit and level-up.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no dependencies, no network request. Open `game/index.html` in a desktop browser and it plays.

## How to play

- **Goal:** catch golden motes for points. A mote is worth 10 points times your combo multiplier.
- **Danger:** the dark void shards. One touch costs a life and breaks the combo. Three lives, then the light fades.
- **Combo:** collect motes within 2.5 seconds of each other to climb the chain: x1, x2, x3, x5, x8.
- **Levels:** every 15 motes, the level rises. Shards get faster and more numerous, and the aurora changes colour. 10 levels.
- **Power-ups:** a white nova clears every shard on screen (+25 points each). A cyan shield survives one hit.

## Controls

- **Move:** arrow keys or WASD, or steer with the mouse (the wisp follows the pointer).
- **Start / restart:** Space, Enter, or click.
- **Pause:** P or Esc.
- **Mute:** M.

## The game

- `game/` — the playable game as static files: `index.html` plus ES modules under `game/src/`. Canvas 2D, fixed 1280x720 playfield scaled to the window, fixed 1/60 s steps, seeded random for repeatable runs.
- `main.ts` — the entry program (Node 22, standard library only): copies `game/` and `screenshots/` to the output and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's library, copied unchanged.
- `screenshots/` — 4 real renders of the game's own code: title, mid-game, a high combo, and game over.
- `shots.json` — the four screenshot scenes and their `?shot=` queries.

## Screenshots

The game stages its own screenshots deterministically: `?shot=start|play|combo|end&seed=N` plays the real rules forward with an autopilot and sets `window.__shotReady` when the frame is painted.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kwk9hgxb&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
