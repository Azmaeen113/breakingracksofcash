# Breaking Racks 4 Cash — Complete System Documentation

## Game Engine & Tech Stack
- **Engine:** Phaser v2.6.2 (Canvas 2D renderer)
- **Physics:** Custom billiard physics engine (not Phaser's built-in p2.js)
- **3D Ball Rendering:** Quaternion-based rotation mapped to 2D sprites
- **SDK:** Famobi game API v1 + CrazyGames SDK v2
- **Hosting:** Static HTML/JS — no build step, no server needed

---

## Game Flow
```
BOOT → LOAD (assets) → MAIN MENU → PLAY → GAME OVER → MENU or REPLAY
```

---

## Game Modes
| Mode | Description |
|------|-------------|
| **Player vs AI** | 1P vs computer, scoring + timer, AI difficulty 1-5 |
| **Player vs Player** | Local 2P on same device, no scoring (currently hidden) |
| **Tutorial** | Guided walkthrough with animated hand/mouse demo, auto-shown first time |

---

## UI Screens

### 1. Loading Screen
- Title image, rack image, animated progress bar

### 2. Main Menu
- Title, rack decoration, Play/Stats/Help/Settings buttons

### 3. Stats Window
- High score, best time (MM:SS), games played

### 4. Settings Window
- Guide line toggle, sound toggle, AI difficulty 1-5

### 5. In-Game HUD
- Score, multiplier, timer, turn arrows, player icons
- Ball racks (solids/stripes), spin setter, power bar (touch)
- Aiming guide, pause button, target ball markers

### 6. Game Over Panel
- Winner display, animated score counting, time/AI bonuses, quit/replay buttons

### 7. Pause Popup
- Resume, mute, replay, quit

### 8. Foul Display
- Shows illegal contact diagrams, wrong ball, scratch, no cushion

---

## Physics System
- Ball-ball elastic collisions (restitution 0.94)
- Ball-cushion reflections (restitution 0.6)
- Ball-vertex (corner tips) collisions
- Ball-pocket detection (radius 2250 units)
- Linear friction (1.5 units/frame), minimum velocity threshold (2 units)
- Grip system — violent collisions cause brief sliding
- Up to 20 collision iterations per frame for accuracy

### Physics Constants
| Constant | Value |
|----------|-------|
| `adjustmentScale` | 2.3 |
| `ballRadius` | 2300 |
| `physScale` | 0.01 |
| `friction` | 1.5 |
| `cushionRestitution` | 0.6 |
| `ballRestitution` | 0.94 |
| `maxPower` | 5000 |
| `pocketRadius` | 2250 |
| `minVelocity` | 2 |

---

## Spin System
- **Topspin/Backspin (screw):** Y-axis on spin wheel → follow-through or draw shot
- **English (sidespin):** X-axis on spin wheel → altered cushion deflection angle + curved ball path
- **Y-Spin curve:** Lateral force creates visible ball curve, decays over time

---

## 8-Ball Rules Implemented
- Open table until first pot assigns ball type (solids/stripes)
- Must hit own ball type first
- At least 1 ball must hit a cushion after contact
- Break requires 2+ balls hitting cushions
- Pot all your balls, then legally pot the 8-ball to win
- **Fouls:** wrong ball first, scratch, 8-ball potted early, no cushion, illegal break
- Ball-in-hand after foul (full table or kitchen on break)

---

## AI System (5 Difficulty Levels)

### Shot Selection Algorithm
1. Finds all target balls with clear line to pockets
2. Computes aim positions behind target balls
3. Checks for bank shots (1-cushion reflection) if no direct shots
4. Runs **trial physics simulations** of each candidate shot
5. Rates shots: +0.1 per pot, +1.0 clear table, -1.0 foul, -1.5 early 8-ball
6. Falls back to random shots if no good calculated shot found
7. Accuracy error: Rating 1 = ~80 units offset, Rating 5 = near-perfect
8. Strategic ball-in-hand placement aligned with pocket angles

### Difficulty Levels
| Rating | Trial Shots | Random Error |
|--------|-------------|--------------|
| 1 | 10 | ~80 units |
| 2 | 20 | ~60 units |
| 3 | 30 | ~40 units |
| 4 | 40 | ~20 units |
| 5 | 50 | ~0 units |

---

## Scoring (vs AI Mode)
- **10 × multiplier** per potted ball (multiplier increments each pot, resets on miss)
- **Time bonus:** 180 − seconds elapsed
- **AI level bonus:** 100 × AI rating
- Best score saved to localStorage

---

## Input System
| Platform | Aiming | Power | Spin |
|----------|--------|-------|------|
| **Desktop** | Mouse position relative to cue ball | Click-drag distance (exponential curve) | Click spin wheel, drag spot |
| **Touch** | Drag on table rotates cue (progressive sensitivity) | Drag down on power bar (left side) | Tap spin wheel, drag spot |

---

## Responsive Design
- **Landscape:** 1920×1080
- **Portrait:** 1080×1920 (canvas rotated -90°)
- Dynamic orientation switching with full GUI repositioning
- `Phaser.ScaleManager.SHOW_ALL` — maintains aspect ratio

---

## Assets Summary
| Type | Count | Details |
|------|-------|---------|
| **Images** | ~85 | Balls (7 stripe sheets × 41 frames, 1 solid sheet × 9 frames), table, cue, GUI panels, buttons, icons, fouls, effects |
| **Audio** | 7 | Ball hit, cushion hit, pocket, cue strike, shimmer, ding, cheer (.wav + .mp3) |
| **Fonts** | 6 | Bitmap fonts for scores, UI text, bonuses, tutorial |

---

## Cyberpunk Theme (Overlay System)

Applied **non-destructively** via function wrapping — intercepts state creation and applies post-processing.

### CSS Layer
- Dark purple gradients, animated scanlines, CRT vignette
- Neon canvas border, Orbitron font
- Brightness/glow pulse animations

### Sprite Tints
| Element | Color |
|---------|-------|
| Pockets | Dark purple (0x150825) |
| Cue | Cool blue-white (0xCCDDFF) |
| Cue shadow | Purple (0x4400AA) |
| Ball shadows | Purple (0x3300AA) |
| GUI panels | Deep purple (0x1A0A40) |
| Turn arrow P1 | Neon cyan (0x00FFF0) |
| Turn arrow P2 | Hot pink (0xFF2D95) |
| Human icon | Neon cyan |
| AI icon | Hot pink |
| Spin setter | Neon cyan |
| Power bar base | Hot pink |
| Power bar top | Neon cyan |
| Game over panels | Dark purple (0x120830) |
| Play button | Neon cyan |
| Stats/Help buttons | Electric purple (0xB026FF) |
| Settings button | Hot pink |

### Untinted Elements
- Cloth and table top — show replacement images as-is
- Title and rack images — show custom art as-is

### Hidden Elements
- PvP button (logic preserved)
- Copyright/famobi branding

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| `NEON_CYAN` | 0x00FFF0 | Primary accent — guide lines, highlights |
| `HOT_PINK` | 0xFF2D95 | Secondary accent — power, energy |
| `ELECTRIC_PURPLE` | 0xB026FF | Tertiary accent |
| `NEON_GREEN` | 0x39FF14 | Success, loader bar |
| `DARK_BG` | 0x0A0014 | Deep dark purple-black |
| `MID_BG` | 0x0D0221 | Dark purple |
| `GOLD_ACCENT` | 0xFFD700 | Warm accents |

---

## Persisted Data (localStorage)
| Key | Purpose |
|-----|---------|
| `guideOn` | Aiming guide toggle (0/1) |
| `aiRating` | AI difficulty (1-5) |
| `bestScore` | Highest score achieved |
| `bestTime` | Fastest win time |
| `numGames` | Total games played |
| `showTutorial` | Tutorial shown flag |

---

## File Architecture (19 JS Files — Loaded Sequentially)
| File | Role |
|------|------|
| `01phaser.js` | Game engine (Phaser v2.6.2) |
| `02Ball.js` | 3D ball rendering with quaternions |
| `03contactListener.js` | Collision event handler, scoring, pocketing |
| `04billiardPhysics.js` | Custom collision detection & resolution engine |
| `05levelData.js` | Ball rack positions for all level configs |
| `06maths.js` | Math utilities, Point class, line/circle intersections |
| `07vector2d.js` | 2D vector math class |
| `08render.js` | Frame-by-frame ball position/rotation rendering |
| `09sound.js` | Audio manager with master/slave mute |
| `10effects.js` | Particle stars + floating bonus text |
| `11timer.js` | Game clock management |
| `12load.js` | Asset loading with progress bar |
| `13mainMenu.js` | Main menu + stats/settings sub-screens |
| `14setup.js` | Play state setup — table, balls, GUI, physics |
| `15gameController.js` | Game loop, input, AI, rules, game over |
| `16boot.js` | Boot state — initializes Phaser + state machine |
| `00cyberpunk.js` | Cyberpunk theme overlay (loaded last) |
| `sdk_interface.js` | CrazyGames SDK integration |
| `v1.js` | Famobi game API bootstrap |

---

## Tutorial System (17 Stages)
| Stage | Action |
|-------|--------|
| 0-1 | Show hand/mouse, fade in |
| 2-3 | Move pointer to aim at target ball, cue follows |
| 4-5 | Transition (touch: fade out, desktop: skip to stage 96) |
| 6-7 | Show pointer at power bar area |
| 8 | Animate drag gesture for setting power |
| 9-11 | Execute strike with calculated power |
| 12 | Ball hits, shot runs |
| 13-14 | Fade out, end tutorial |
| 96-104 | Desktop only — mouse click tutorial with left/right click frames, drag demo |

---

## Ball System
- **16 balls total:** 0 = cue, 1-7 = solids, 8 = eight ball, 9-15 = stripes
- **Solids:** Single spritesheet (48×48, 9 frames), rotated by angle
- **Stripes:** Individual spritesheets per ball (50×50, 41 frames for rotation)
- **Layers per ball:** Main sprite, number spot overlay, shade overlay, shadow sprite, marker ring
- **Quaternion rotation:** Velocity → quaternion increments → Euler angles → sprite frame + spot position

---

## Table Geometry
- 6 pockets with positions, drop positions, star positions (for particle effects)
- 20 cushion line segments (named A-X) forming the table rails
- 12 vertices at cushion corners
- Each line has pre-computed: direction normal, offset lines at ballRadius distance

---

## Canvas Layer Order (Z-depth)
```
bgCanvas
  └── guiBaseCanvas
        └── gameCanvas
              ├── tableCanvas (cloth, pockets, tableTop)
              ├── ballCanvas (all balls + shadows)
              ├── cueBaseCanvas (cue + cue shadow)
              ├── guideCanvas (aiming lines)
              └── tutCanvas (tutorial elements)
        └── guiCanvas (HUD, panels, buttons)
```

---

## SDK Integration
- **CrazyGames SDK v2:** Interstitial ads (enabled), rewarded ads (disabled), gameplay start/stop tracking
- **Famobi API v1:** localStorage namespacing, orientation handling, feature flags, analytics, ad state machine, menu overlay, i18n support
- **Fenster module:** Adjusted viewport dimensions accounting for SDK banners/overlays
