# Mining Cave Pivot

Reskin SolFarm into the side-view "mine shaft" layout from the reference images while preserving all game logic (clicks, managers, unlocks, balances) and the existing neon HUD.

## Scope

**Keep as-is**
- Neon HUD header (`bal-frame`, `hud-pill`, AUTO indicator, NEXT chip)
- Game state, click harvest, manager hiring, unlock flow, toast, localStorage save
- Farmer roster + portraits (they become "miners")

**Remove**
- Warehouse 3D shell: `room-3d`, `wall-back/left/right`, `iso-floor`, `ceiling-beam`, hanging grow-lamps, AC vents/fans, floor-beam dividers, bushes, crates/barrels/batteries/server-racks, all theme-1..5 wall textures

**Add**
- Dirt-cave background with scattered rocks
- Per-floor mine shaft cut-out (carved opening in dirt)
- Solana ore wall on the right of each shaft + miner swinging pickaxe
- SOL storage pile on the left of each shaft
- Continuous vertical elevator shaft on the far left spanning all floors
- Animated elevator cart traveling up/down, "collecting" from each floor
- Surface layer on top: grass strip, Surface Transporter character, Exchange Terminal on the right

## Layout

```text
┌─────────────── HUD (unchanged neon header) ───────────────┐
│ ░░░░grass░░░░  [transporter →]      [Exchange Terminal]  │ surface
├──┬─────────────────────────────────────────────────────────┤
│██│   pile  miner⛏  ▓▓ ore ▓▓        [Lv1 / hire / mgr]  │ shaft 1
│██│   pile  miner⛏  ▓▓ ore ▓▓        [Lv2 / hire / mgr]  │ shaft 2
│██│   pile  miner⛏  ▓▓ ore ▓▓        [LOCKED · unlock]   │ shaft 3
│██│                                                        │
│cart moves up/down full height, stops at each shaft        │
└────────────────────────────────────────────────────────────┘
```

- Main container has a uniform dirt background (CSS gradient + tiled rock SVG noise). No row dividers — the dirt is continuous, only the rectangular shaft cut-outs interrupt it.
- Elevator shaft is one absolutely-positioned column down the left edge of `<main>`, rendered once (not per row).
- Each `FarmRow` becomes a `MineShaft` with three sub-regions: storage pile (left, after elevator), miner sprite (center, existing portrait + pickaxe swing animation), ore wall (right, glowing purple Solana texture). The level/hire/manager controls move into a small panel at the far right of the shaft (like the "LEVEL 25" sign in the reference).

## Animation logic (cosmetic, no state changes)

- Elevator: pure CSS keyframe translating `top` from surface to bottom and back over ~12s, looping.
- When the cart's `top` crosses a shaft's vertical band (computed via JS `requestAnimationFrame` reading the cart's bounding rect, or simpler: a shared timer + index math from shaft count), briefly scale that floor's pile (visual "pickup").
- When cart returns to surface, trigger Transporter walk animation: translateX from elevator → Exchange Terminal, then back. Pure CSS, driven by an `isAtSurface` boolean.
- Miner pickaxe swing: existing `autoTick` / click handler already drives a `picking` / `autoSwingI` state — repurpose to rotate a pickaxe SVG on the miner sprite instead of bouncing a bush.

None of this changes SOL balance math; the cart is decorative narrative for the existing auto-harvest tick.

## Files

**`src/styles.css`**
- Delete unused: `.room-3d`, `.wall-*`, `.iso-floor`, `.ceiling-beam`, `.pipe`, `.grow-lamp`, `.ac-unit`, `.ac-fan-blades`, `.floor-beam`, `.crate`, `.barrel`, `.battery`, `.server-rack`, `.bush-shape`, `.bush-bounce`, `.bush-glow`, `.theme-1`..`.theme-5`, `.terminal-log`
- Add: `.cave-bg` (dirt gradient + rock-speckle SVG), `.surface-strip` (grass + sky band), `.mine-shaft` (carved cut-out with inset shadow + wood-beam frame), `.ore-wall` (purple Solana crystal gradient with pulsing glow), `.sol-pile` (gold coin stack), `.elevator-shaft` (dark vertical column with rail lines), `.elevator-cart` (cart sprite + `@keyframes elevator-loop`), `.pickaxe` + `@keyframes pickaxe-swing`, `.transporter` + `@keyframes transporter-walk`, `.exchange-terminal` (neon kiosk matching HUD style)
- Keep: HUD classes (`hud-pill`, `hud-btn`, `bal-frame`, `live-dot`, `neon-border`, `text-glow*`, `farm-sky`, `stars`, `floater`, `name-tag`, `char-sprite`)

**`src/routes/index.tsx`**
- Replace `<main>` body: render one `<SurfaceLayer/>`, one `<ElevatorShaft cartFloor={...}/>`, then map `BUSHES` to `<MineShaft/>` (renamed `FarmRow`)
- Strip warehouse JSX from `FarmRow`; rebuild as shaft with pile/miner/ore/control-panel
- Add `currentCartFloor` state in `Farm` driven by a `setInterval` cycling 0..BUSHES.length-1 every ~1.2s (cosmetic only)
- Keep all handlers (`harvest`, `unlock`, `hireManager`, `reset`) unchanged
- Reuse `state.managers`, `autoTick`, `picking` to drive pickaxe swing on the miner

## Out of scope

- No changes to wallet/landing screen
- No new assets uploaded — ore/cart/transporter/pickaxe are CSS + inline SVG
- No economy changes (costs, rates, manager pricing untouched)
