# 一心 ISSHIN

A Castlevania-like samurai homage built with Phaser 4. One playable stage for now.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:8080

## Controls

- `A` / `D` or arrows: move
- `W` or `Space`: jump
- `L` or `J`: slash
- `K`: fireball (uses MP)
- `P`: pause (`R` returns to title)
- Approach the purple plant shrine to refill HP

## Swap art later

Gameplay reads files in `public/assets/` through `src/game/catalog.ts`. Replace those PNGs (same names) or edit the catalog paths.

Placeholder art is [Kenney Platformer Pack Redux](https://kenney.nl) (CC0). See `public/assets/KENNEY-LICENSE.txt`.
