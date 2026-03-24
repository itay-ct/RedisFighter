# Redis Fighter

Redis Fighter is a Redis-learning overlay built on top of the upstream canvas fighting game by Mayank Jain. The combat engine, controls, hitboxes, physics, camera, stage, and pace stay intact; the shipped change set only layers Redis semantics onto the existing match flow.

Credit: forked from the original StreetFighter project by Mayank Jain at [github.com/Mayank-Jain-1/StreetFighter](https://github.com/Mayank-Jain-1/StreetFighter).

## What Shipped

- A finalized 12-fighter Redis roster covering: Strings, Hashes, JSON, Lists, Sets, Sorted Sets, Streams, Geospatial, Bitmaps, Probabilistic, Vector Sets, and Time Series.
- Full roster metadata in code: subtitle, icon, color identity, docs link, learning copy, and move-to-command mapping for every fighter.
- A fighter-select start scene with `FLUSHALL` reset and persistent player picks.
- HUD relabeling with Redis fighter names, icons, palette identity, and a compact `Command Feed`.
- Floating command callouts on confirmed hits.
- A post-match `Did you know?` card with winner learning copy, official Redis docs link, `Play Again`, and `Choose Fighter`.

## Source Of Truth

- [`src/config/redisRoster.js`](/Users/itay.tevel/RedisIcons/RedisFighter/src/config/redisRoster.js)
  Final roster, move mappings, docs URLs, subtitles, color identity, and learning text.
- [`src/scenes/StartScene.js`](/Users/itay.tevel/RedisIcons/RedisFighter/src/scenes/StartScene.js)
  Fighter-select menu and `FLUSHALL` reset flow.
- [`src/scenes/BattleScene.js`](/Users/itay.tevel/RedisIcons/RedisFighter/src/scenes/BattleScene.js)
  Redis HUD overlay, command logging, floating command text, and post-match card.
- [`docs/redis-fighter-spec.md`](/Users/itay.tevel/RedisIcons/RedisFighter/docs/redis-fighter-spec.md)
  Final shipped product spec and asset-reuse notes.

## Run

Serve the repo as a static site and open it in a browser:

```bash
cd /Users/itay.tevel/RedisIcons/RedisFighter
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Asset Strategy

- Reused as-is: `public/images/Ryu.png`, `public/images/Ken.png`, `public/images/hud.png`, `public/images/decals.png`, `public/images/kenstage.png`, plus the existing audio set.
- Lightly modified in code only: nameplates, palette tinting, fighter badges, portrait treatment, aura framing, command feed UI, floating command text, and post-match card layout.
- Not added: new arenas, bespoke full-animation sprite sets, story mode, or a fake Redis simulation layer.

## Non-Goals

- No combat redesign.
- No new move states, hitboxes, or physics systems.
- No undecided or placeholder fighters.
- No custom full-body art pipeline beyond overlays and palette-driven presentation.
