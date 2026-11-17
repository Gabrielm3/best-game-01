# best-game-01

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/gabrielm3/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/gabrielm3/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Cutwater. Four reaches of one river: hook a cable to the posts, cut a log off the line, and land the crates before the fog. Mill Race, Reed Bend, the Sluice, Night Lock. Later reaches stay shut until the wharf is made.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no dependencies, no network request. Open `game/index.html` in a desktop browser and it plays.

## How to play

- **Goal:** land the quota of crates on the wharf before the fog bar empties.
- **Cable:** click a post to hook. The line pulls the punt. Space cuts a log off the cable; wait and the line snaps, and a crate goes over.
- **Reaches:** Mill Race, Reed Bend, the Sluice, Night Lock. The next reach opens when this one is landed.
- **Stars:** a clean reach with fog left is 3. The best total is kept in the browser.

## Controls

- **Steer:** arrow keys or WASD.
- **Hook:** click a post.
- **Cut:** Space.
- **Start / restart:** Enter, Space, or click.
- **Pause:** Esc or P.
- **Mute:** M.

## The game

- `game/` — static files, canvas 2D, fixed 1/60 s steps.
- `main.ts` — copies `game/` and `screenshots/` and writes `dossier.json`.
- `screenshots/` — four real renders: the reach, the map, the sluice, the ledger.
- `shots.json` — `?shot=reach|map|sluice|ledger&seed=N`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kwk9hgxb&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
