# Redis Fighter Spec

## Product Goal

Turn every player into a Redis learner while keeping the upstream fighting game hardcore, familiar, and mechanically intact.

## Finalized Implementation Plan

1. Preserve the original combat loop and stage exactly as the production baseline.
2. Ship a complete 12-fighter Redis roster that reuses the existing Ryu and Ken animation sheets as base templates.
3. Reinterpret attacks as Redis commands through UI, naming, palette, portrait, badge, and lightweight VFX only.
4. Add an in-match command feed and small floating command callouts so Redis learning happens through repetition.
5. Replace the old auto-return win flow with a post-match learning card and official docs link.
6. Remove legacy product ambiguity from the user-facing menu, HUD labels, and README.

## Final Roster

| Data Type | Base Sheet | Subtitle | Icon | Identity |
| --- | --- | --- | --- | --- |
| String | Ryu | The Foundation | `<>` | Simple, universal, reliable starter fighter |
| Hash | Ryu | The Structurer | `#` | Tactical field-by-field fighter |
| JSON | Ryu | The Deep Schema | `{}` | Nested structure specialist |
| List | Ken | The Flow Master | `[]` | Push/pop momentum brawler |
| Set | Ryu | The Unique One | `()` | Clean membership and dedup fighter |
| Sorted Set | Ken | The Ranker | `#^` | Score-driven leaderboard champion |
| Stream | Ken | The Event Engine | `~>` | Relentless event-flow aggressor |
| Geospatial | Ken | The Tracker | `@` | Radius and proximity striker |
| Bitmap | Ryu | The Flag Keeper | `01` | Binary efficiency tactician |
| Probabilistic | Ken | The Estimator | `~?` | Approximate-at-scale trickster |
| Vector Set | Ken | The Similarity Hunter | `V*` | Semantic search specialist |
| Time Series | Ken | The Signal Reader | `TS` | Metrics and telemetry fighter |

## Move To Command Mapping

Note:
- The six normal attacks are the canonical teaching surface.
- Existing projectile specials stay mechanically intact and reuse each fighter's heavy-kick signature command label rather than inventing new systems.
- The upstream engine does not expose a true block state, so defensive read mappings are stored in metadata and copy only. No fake block mechanic was added.
- Jump remains a utility/read flourish in the product language and is intentionally omitted from the command feed to avoid noise.

### String

- Light Punch: `SET`
- Medium Punch: `GET`
- Heavy Punch: `DEL`
- Light Kick: `EXPIRE`
- Medium Kick: `STRLEN`
- Heavy Kick: `INCR`
- Defensive Read: `EXISTS`

### Hash

- Light Punch: `HSET`
- Medium Punch: `HGET`
- Heavy Punch: `HDEL`
- Light Kick: `HEXPIRE`
- Medium Kick: `HGETALL`
- Heavy Kick: `HINCRBY`
- Defensive Read: `HEXISTS`

### JSON

- Light Punch: `JSON.SET`
- Medium Punch: `JSON.GET`
- Heavy Punch: `JSON.DEL`
- Light Kick: `JSON.ARRAPPEND`
- Medium Kick: `JSON.TYPE`
- Heavy Kick: `JSON.NUMINCRBY`
- Defensive Read: `JSON.TYPE`

### List

- Light Punch: `LPUSH`
- Medium Punch: `LRANGE`
- Heavy Punch: `LPOP`
- Light Kick: `RPUSH`
- Medium Kick: `LLEN`
- Heavy Kick: `BLPOP`
- Defensive Read: `LINDEX`

### Set

- Light Punch: `SADD`
- Medium Punch: `SMEMBERS`
- Heavy Punch: `SREM`
- Light Kick: `SISMEMBER`
- Medium Kick: `SCARD`
- Heavy Kick: `SINTER`
- Defensive Read: `SISMEMBER`

### Sorted Set

- Light Punch: `ZADD`
- Medium Punch: `ZRANGE`
- Heavy Punch: `ZREM`
- Light Kick: `ZCARD`
- Medium Kick: `ZRANK`
- Heavy Kick: `ZREVRANGE`
- Defensive Read: `ZSCORE`

### Stream

- Light Punch: `XADD`
- Medium Punch: `XRANGE`
- Heavy Punch: `XDEL`
- Light Kick: `XTRIM`
- Medium Kick: `XREAD`
- Heavy Kick: `XREADGROUP`
- Defensive Read: `XINFO`

### Geospatial

- Light Punch: `GEOADD`
- Medium Punch: `GEOSEARCH`
- Heavy Punch: `ZREM`
- Light Kick: `GEOHASH`
- Medium Kick: `GEODIST`
- Heavy Kick: `GEOSEARCHSTORE`
- Defensive Read: `GEOPOS`

### Bitmap

- Light Punch: `SETBIT`
- Medium Punch: `GETBIT`
- Heavy Punch: `BITOP`
- Light Kick: `BITCOUNT`
- Medium Kick: `BITPOS`
- Heavy Kick: `BITOP XOR`
- Defensive Read: `GETBIT`

### Probabilistic

- Light Punch: `PFADD`
- Medium Punch: `PFCOUNT`
- Heavy Punch: `PFMERGE`
- Light Kick: `BF.ADD`
- Medium Kick: `BF.EXISTS`
- Heavy Kick: `TOPK.ADD`
- Defensive Read: `BF.EXISTS`

### Vector Set

- Light Punch: `VADD`
- Medium Punch: `VSIM`
- Heavy Punch: `VREM`
- Light Kick: `VDIM`
- Medium Kick: `VINFO`
- Heavy Kick: `KNN`
- Defensive Read: `VINFO`

### Time Series

- Light Punch: `TS.ADD`
- Medium Punch: `TS.RANGE`
- Heavy Punch: `TS.DEL`
- Light Kick: `TS.INCRBY`
- Medium Kick: `TS.GET`
- Heavy Kick: `TS.MRANGE`
- Defensive Read: `TS.GET`

## Docs Mapping

| Fighter | Docs |
| --- | --- |
| String | `https://redis.io/docs/latest/develop/data-types/strings/` |
| Hash | `https://redis.io/docs/latest/develop/data-types/hashes/` |
| JSON | `https://redis.io/docs/latest/develop/data-types/json/` |
| List | `https://redis.io/docs/latest/develop/data-types/lists/` |
| Set | `https://redis.io/docs/latest/develop/data-types/sets/` |
| Sorted Set | `https://redis.io/docs/latest/develop/data-types/sorted-sets/` |
| Stream | `https://redis.io/docs/latest/develop/data-types/streams/` |
| Geospatial | `https://redis.io/docs/latest/develop/data-types/geospatial/` |
| Bitmap | `https://redis.io/docs/latest/develop/data-types/bitmaps/` |
| Probabilistic | `https://redis.io/docs/latest/develop/data-types/probabilistic/` |
| Vector Set | `https://redis.io/docs/latest/develop/data-types/vector-sets/` |
| Time Series | `https://redis.io/docs/latest/develop/data-types/timeseries/` |
| Fallback | `https://redis.io/docs/latest/develop/data-types/` |

## HUD And UI Update Plan

Shipped:

- Start scene is now a fighter-select menu with the full finalized roster.
- `FLUSHALL` is the explicit menu reset action.
- Health bars, timer, hit effects, stage, physics, and controls remain untouched.
- Fighter name tags now render Redis data-type names plus a small icon badge.
- The old center-top placeholder text was replaced with a Redis-aligned header.
- A compact `Command Feed` appears for both players without covering the life bars.
- Floating command labels appear on confirmed hits to reinforce learning.

Not shipped:

- Mid-match modal tutorials.
- Large in-battle text walls.
- New combat states or educational interruptions that would slow pacing.

## Post-Match Card Content Model

Each result card contains:

- Winner portrait generated from the reused base sheet.
- Winner name and subtitle.
- One-to-two sentence explanation of the winning data type.
- One `Did you know?` fact.
- `OPEN DOCS` button linking to the official Redis docs page for that data type.
- `PLAY AGAIN` button for the same selected matchup.
- `CHOOSE FIGHTER` button for returning to roster select.

## Asset Reuse Vs. Light Modification

Reused directly:

- `public/images/Ryu.png`
- `public/images/Ken.png`
- `public/images/hud.png`
- `public/images/decals.png`
- `public/images/kenstage.png`
- Existing hit sounds, attack sounds, land sound, and background music

Lightly modified in code only:

- Fighter palette tinting
- Aura framing
- Portrait treatment
- HUD nameplates
- Command feed panels
- Floating command labels
- Result-card presentation
- Projectile tinting to match fighter identity

Not added:

- New arenas
- New full-body animation sheets
- Story mode
- Deep Redis simulation systems
- Placeholder or undecided character concepts

## Explicit Product Alignment

This repo now ships Redis Fighter as a minimal-change overlay product:

- The original game still feels like Street Fighter.
- Redis learning becomes obvious in the first match through naming, repetition, and post-match reinforcement.
- Every fighter has a final data-type identity.
- No roster entries remain undecided or unassigned.
