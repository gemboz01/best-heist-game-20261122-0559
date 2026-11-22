# best-heist-game-20261122-0559

[![best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/gemboz01/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/gemboz01/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

**Brass Fox Heist** — a top-down stealth game. You are Brass, a fox with one job: slip through the Meridian Vault, past patrolling guards and sweeping security cameras, steal the glowing Meridian Diamond, and reach the green exit before the alarm hits 100%.

The vault gives you three ways in: creep left past the crates, thread the middle between the display cases, or risk the right side under the cameras. Two tools help, each at a price: a smoke bomb that blinds every cone for a few seconds, and an EMP pulse that freezes the cameras. Getting spotted is not instant failure — a short grace window and a climbing alarm meter give you a fair chance to break line of sight and cool down. Grab the diamond and the getaway pays off the planning, with a score for loot, time, and the tools you spent.

Everything is drawn on one canvas with plain JavaScript and WebAudio bleeps; no files are fetched over the network.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `game/` and `screenshots/` into `out/` and writes `out/dossier.json`. To play it in a browser, serve `game/` with any static server and open `game/index.html`: move with WASD or the arrow keys, hold Shift to sneak, Space for smoke, Q for EMP, and R to restart after a catch or a clean getaway.

---

Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards
