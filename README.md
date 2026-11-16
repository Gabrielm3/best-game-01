# best-game-01

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/gabrielm3/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/gabrielm3/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Bellwether. Four hill drives before dusk: ring bells to turn the flock, stand on a wolf to turn it, and get the quota into the fold. Meadow, stone pass, storm shelf, night cliff. Stars stick around for a cleaner drive.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no dependencies, no network request. Open `game/index.html` in a desktop browser and it plays.

## How to play

- **Goal:** bring the quota of sheep into the lit fold before the dusk bar empties.
- **Bells:** click, or press Space, to ring. Sheep in the ring run toward it.
- **Wolves:** they take a sheep they catch. Walk onto a wolf and it peels off.
- **Drives:** High Meadow, Stone Pass, Storm Shelf, Night Cliff. Wind, rocks, and a bridge change the line home.
- **Stars:** a clean drive with time left is 3. The best total is kept in the browser.

## Controls

- **Move:** arrow keys or WASD.
- **Ring:** click the ground, or Space (rings ahead of you, toward the fold).
- **Start / restart:** Enter, Space, or click.
- **Pause:** Esc or P.
- **Mute:** M.

## The game

- `game/` — static files, canvas 2D, fixed 1/60 s steps.
- `main.ts` — copies `game/` and `screenshots/` and writes `dossier.json`.
- `screenshots/` — four real renders: the drive, the title, the storm, the fold.
- `shots.json` — `?shot=drive|title|storm|fold&seed=N`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kwk9hgxb&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
