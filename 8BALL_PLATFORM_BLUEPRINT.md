# Breaking Racks 4 Cash -- Full Platform Blueprint

> Complete specification for wrapping the 8 Ball Pool Phaser game with a full-featured webapp platform.
> **Zero changes to in-game logic, physics, AI, scoring, rules, or rendering.**
> Only the outer shell (UI pages, navigation, backend, payments, admin) is covered.

---

## Table of Contents

1. [What You Have Now](#1-what-you-have-now)
2. [What Gets Built Around It](#2-what-gets-built-around-it)
3. [Tech Stack](#3-tech-stack)
4. [Design Theme: Burning Fire + Cyberpunk](#4-design-theme-burning-fire--cyberpunk)
5. [Page Structure & Navigation](#5-page-structure--navigation)
6. [Home Page](#6-home-page)
7. [Game Modal (Iframe Wrapper)](#7-game-modal-iframe-wrapper)
8. [Tap-to-Earn System](#8-tap-to-earn-system)
9. [Energy System](#9-energy-system)
10. [League System (8 Tiers)](#10-league-system-8-tiers)
11. [VIP / Premium Plans](#11-vip--premium-plans)
12. [Shop Page](#12-shop-page)
13. [Leaderboard Page](#13-leaderboard-page)
14. [Tasks Page](#14-tasks-page)
15. [Friends / Referral Page](#15-friends--referral-page)
16. [Daily Reward System](#16-daily-reward-system)
17. [Wallet & Payment Requests](#17-wallet--payment-requests)
18. [Firestore Data Model](#18-firestore-data-model)
19. [Admin Panel](#19-admin-panel)
20. [Stripe Payment Integration](#20-stripe-payment-integration)
21. [Crypto Payment (TON + EVM)](#21-crypto-payment-ton--evm)
22. [Firestore Security Rules](#22-firestore-security-rules)
23. [Onboarding Flow](#23-onboarding-flow)
24. [What Must NOT Be Changed](#24-what-must-not-be-changed)
25. [Deliverables Summary](#25-deliverables-summary)

---

## 1. What You Have Now

- A **Phaser v2.6.2** billiard game (19 JS files, no build step, pure static HTML/JS)
- Player vs AI mode with 5 difficulty levels, full 8-ball rules
- Custom physics engine, 3D ball rendering via quaternions, spin system
- Scoring: `10 x multiplier` per pot, time bonus, AI level bonus
- `localStorage` for stats (high score, best time, games played)
- A **cyberpunk theme overlay** already applied (neon cyan, hot pink, electric purple, dark purple backgrounds, scanlines, CRT effects)
- Game flow: `BOOT -> LOAD -> MAIN MENU -> PLAY -> GAME OVER -> REPLAY`
- **No backend, no user accounts, no payments, no leaderboard, no shop, no social features**

---

## 2. What Gets Built Around It

A full platform wrapper providing:

- User account system (Firebase/Firestore)
- 5-tab bottom navigation (Tasks, Ranks, Home, Friends, Shop)
- Tap-to-earn mechanic (tap a central button to earn currency)
- Game modal (iframe) that costs "energy" to play and awards currency based on score
- VIP premium tiers (Bronze/Silver/Gold) purchasable via Stripe, TON, or EVM crypto
- League/ranking system (Wood through Elite, 8 tiers based on lifetime currency)
- Seasonal leaderboards with prize pools for top 50
- Daily login rewards (7-day streak)
- Social tasks (follow Twitter, join Telegram, etc.) for currency rewards
- Referral/friends system (invite link, +1000 currency per friend)
- Wallet connection (TON Connect + MetaMask) and payment request/withdrawal system
- Separate admin panel for managing users, payments, seasons, VIP, analytics

The in-game currency is called **CASH**.

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (cyberpunk/fire theme) |
| Icons | Flaticon modern UI icons (no emoji) |
| Backend / Database | Firebase Firestore (NoSQL, client-side SDK, no server needed) |
| Auth (admin) | Firebase Auth (email/password) |
| Auth (players) | Telegram WebApp `initData` or anonymous session |
| Payments -- Card | Stripe Checkout / Payment Intents |
| Payments -- TON | TON Connect (`@tonconnect/ui-react`) |
| Payments -- EVM | Web3Modal + ethers.js (USDT/ETH) |
| Hosting | Netlify or any static host (SPA + `_redirects`) |
| Game embed | Phaser game loads inside a React modal via `<iframe src="/game/index.html">` |
| Animations | Framer Motion |
| Carousel | Swiper.js |

---

## 4. Design Theme: Burning Fire + Cyberpunk

The game already uses a cyberpunk palette. The wrapper UI extends it:

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Neon Cyan | `#00FFF0` | Primary accent -- buttons, highlights, active states |
| Hot Pink | `#FF2D95` | Secondary accent -- energy bars, warnings, power |
| Electric Purple | `#B026FF` | Tertiary -- badges, secondary buttons |
| Dark BG | `#0A0014` | Deep dark purple-black background |
| Mid BG | `#0D0221` | Card backgrounds, panels |
| Gold Accent | `#FFD700` | Warm accents, fire glow |
| Fire Orange | `#FF6B00` | Fire gradient start |
| Fire Red | `#FF1744` | Fire gradient mid |

### UI Elements

| Element | Style |
|---------|-------|
| Background | Deep dark purple-black `#0A0014` with subtle animated fire/ember particles floating upward |
| Cards / Panels | Glassmorphism with `backdrop-blur`, border gradients (cyan-to-pink or cyan-to-purple) |
| Fire elements | Animated gradient borders pulsing orange -> red -> gold, used on premium/VIP cards and CTA buttons |
| Typography | Orbitron (headings), Inter or Poppins (body), monospace for numbers/timers |
| Nav bar | Bottom-fixed, 5-tab, semi-transparent dark purple with blur, top border glowing cyan |
| Loading screen | Dark background with floating embers, dual concentric spinning rings (cyan + pink), pulsing glow center |
| Scrollbars | Hidden (`hide-scrollbar` utility) |
| Scanline overlay | Optional subtle CSS scanline/CRT effect on backgrounds |
| Animations | Framer Motion for page transitions, card reveals, button presses |

---

## 5. Page Structure & Navigation

### Bottom Navigation Bar (5 tabs, always visible except during gameplay)

| Position | Icon (Flaticon) | Label | Page Key |
|----------|----------------|-------|----------|
| 1 | Checklist / tasks icon | Tasks | `tasks` |
| 2 | Trophy / ranking icon | Ranks | `leaderboard` |
| 3 (center, raised) | Game logo in glowing fire-bordered circle | Home | `home` |
| 4 | Users / group icon | Friends | `friends` |
| 5 | Shopping bag icon | Shop | `shop` |

The center Home button is elevated with a circular fire/neon border glow, larger than the others.

### Additional Pages (accessible from within other pages)

| Page | Access Point |
|------|-------------|
| League Slider | Header league badge tap |
| Airdrop / Wallet | Header or Shop link |
| Game Modal | "Play Game" button on Home |

---

## 6. Home Page

The central hub. Layout top-to-bottom:

### Header Bar (top)

- **Left:** League badge -- shows current league icon + name, tappable to open League Slider
- **Right:** Wallet connect button -- shows "Connect Wallet" or truncated address, toggles TON Connect / MetaMask
- **Second row:** VIP badge (if active -- tier with gradient: Bronze = copper, Silver = silver, Gold = gold) + Season info pill ("Season 3 -- 12d left")

### Main Content Area

| Section | Description |
|---------|-------------|
| Currency display | Large number showing user's total CASH with game logo beside it, VIP multiplier badge if active (e.g., "1.15x") |
| Energy + Tap info bar | Remaining energy (e.g., "2/3 [fire icon]") and tap cycle reward ("1000 CASH per cycle") |
| Tap-to-Earn target | Large circular game logo (8-ball or rack image) with 3D tilt on tap, glowing ring, floating "+1" effects. Completes at 1000 taps, awards 1000 CASH bonus, starts 24h cooldown |
| Cooldown timer | "HH:MM:SS" countdown when tap cycle is on cooldown |
| Play Game button | Fire-bordered "PLAY" button with energy cost ("1 [fire icon]"). Opens Game Modal. Disabled if no energy |
| Daily Reward CTA | Button/banner to open the Daily Reward modal |

---

## 7. Game Modal (Iframe Wrapper)

**The Phaser game is NOT modified.** This React component wraps it:

### Start Screen (before game loads)

- Game logo / title art
- Player's CASH balance
- "START GAME" button with energy cost (e.g., "Costs 1 [fire icon]")
- VIP multiplier notice (e.g., "VIP Gold: 1.15x score multiplier active")
- Match duration info
- If no energy: button disabled, "No energy -- resets at midnight"

### During Game

- Phaser game runs full-screen inside `<iframe src="/game/index.html">`
- **Timer overlay** (top-left, outside iframe): React-managed countdown from 60s, turns red at 10s or less. The game's internal timer can be hidden so both don't show simultaneously. **This is the only acceptable in-game touch.**
- **VIP multiplier badge** (top-right, outside iframe): Shows active multiplier

### iframe <-> React Communication (`window.postMessage`)

| Direction | Message | Data |
|-----------|---------|------|
| Game -> Parent | `GAME_SCORE_UPDATE` | `{ score: number }` |
| Game -> Parent | `GAME_OVER` | `{ finalScore: number }` |
| Game -> Parent | `GAME_EXIT` | `{}` |
| Parent -> Game | `GAME_START` | `{ playerName: string, settings: object }` |

### Game Over Overlay (React, on top of iframe)

- Trophy icon
- Score display: "Score: 450" then "x 1.15 VIP = 517 CASH"
- "Continue" button -- saves score to Firebase, closes modal, returns to Home

### Backend Calls

- **On start:** `spendEnergy(userId)` -- deducts 1 energy from Firestore
- **On game over:** `addGameScore(userId, score)` -- applies VIP multiplier server-side, increments `coins` and `seasonCash`, logs transaction

---

## 8. Tap-to-Earn System

A passive earning mechanic independent of playing the actual game:

| Parameter | Value |
|-----------|-------|
| Taps per cycle | 1,000 |
| CASH per tap | 1 |
| Cycle completion bonus | 1,000 CASH |
| Cooldown after cycle | 24 hours |
| VIP tap damage (bar fill speed) | Free = 1x, Bronze = 6x, Silver = 11x, Gold = 16x |

### How It Works

- Each tap gives **+1 CASH** and progresses the tap bar by `tapDamage`
- VIP multiplier makes the bar fill faster (not more CASH per tap)
- When bar fills to 1000: bonus 1000 CASH awarded, 24h cooldown starts
- Cooldown reducible by 12h using a "Tap Cooldown Reset" consumable item
- Taps batched locally, flushed to Firebase every ~500ms for performance

### Firestore Fields (`users/{userId}`)

| Field | Type | Purpose |
|-------|------|---------|
| `tapCycleTaps` | number | Current progress in cycle |
| `tapCycleEndTime` | timestamp | When cooldown started |
| `cooldownResetItems` | number | Inventory count of reset items |

---

## 9. Energy System

Controls how many games a user can play per day:

| League Tier | Max Energy (games/day) |
|-------------|----------------------|
| Wood, Bronze, Silver | 2 |
| Gold, Platinum | 3 |
| Diamond, Master | 5 |
| Elite | 6 |

- Energy resets at **midnight UTC**
- Each "Play Game" costs 1 energy
- Firestore fields: `gameEnergy`, `lastEnergyReset`

---

## 10. League System (8 Tiers)

Users progress through leagues based on total `seasonCash` earned:

| League | Min CASH | Max CASH | Badge Style | Energy/Day |
|--------|----------|----------|-------------|------------|
| Wood | 0 | 4,999 | Brown | 2 |
| Bronze | 5,000 | 49,999 | Copper | 2 |
| Silver | 50,000 | 249,999 | Silver | 2 |
| Gold | 250,000 | 499,999 | Gold | 3 |
| Platinum | 500,000 | 999,999 | Platinum white | 3 |
| Diamond | 1,000,000 | 4,999,999 | Ice blue | 5 |
| Master | 5,000,000 | 9,999,999 | Purple | 5 |
| Elite | 10,000,000+ | Infinity | Fire/red gradient | 6 |

### League Slider Page

- Full-screen swipeable carousel (Swiper.js)
- Each card: league badge icon, name, description, energy/day stat, CASH range
- Current league highlighted with "YOUR LEAGUE" badge
- Navigation arrows + progress dots

---

## 11. VIP / Premium Plans

3 purchasable tiers via **Stripe** (credit card), **TON** (crypto wallet), or **EVM crypto** (USDT/ETH):

| Tier | Price (Card) | Price (TON) | Duration | Tap Speed | Game Multiplier | Cooldown Reset Bonus |
|------|-------------|-------------|----------|-----------|----------------|---------------------|
| Bronze | $5 | 5 TON | 30 days | 6x bar fill | 1.05x | +2 items |
| Silver | $50 | 50 TON | 30 days | 11x bar fill | 1.10x | +5 items |
| Gold | $100 | 100 TON | 30 days | 16x bar fill | 1.15x | +10 items |

### Benefits Summary

- **Tap speed:** VIP makes the tap bar fill faster (doesn't increase CASH per tap)
- **Game multiplier:** Game scores multiplied by 1.05x / 1.10x / 1.15x before crediting
- **Cooldown reset items:** One-time bonus items on purchase (reduce tap cooldown by 12h each)
- **VIP badge:** Visible on profile, leaderboard, and header

### Firestore Fields

| Field | Type | Purpose |
|-------|------|---------|
| `vipTier` | number (0-3) | Current tier (0 = free) |
| `vipExpiresAt` | timestamp | When VIP expires |

---

## 12. Shop Page

Two-tab layout:

### Tab 1: VIP Plans

- Current VIP status banner (if active: tier name, expiry, fire border)
- 3 VIP tier cards, each showing:
  - Tier name + fire/gradient header
  - Price (card + crypto)
  - Benefits list with Flaticon checkmark icons
  - "Subscribe" button with fire gradient
- Payment flow: select tier -> choose method (Card / TON / Crypto) -> process -> update Firestore

### Tab 2: Items

- Inventory banner (owned Cooldown Reset items count + internal balance)
- **Tap Cooldown Reset** item card:
  - Description: "Reduces tap cooldown by 12 hours"
  - Price: $5 / 5 TON
  - "Buy" button (opens payment method selector)
  - "Use from Inventory" button (if owned, consumes 1 item)

---

## 13. Leaderboard Page

Two-tab leaderboard:

### Tab 1: Season Leaderboard

- Season info bar (season number + days remaining)
- Top 50 users ranked by `seasonCash`
- Each entry: avatar (initials circle), username, CASH total, rank (medals for top 3, numbered badges for rest)
- Prize tags for top 50 positions:

| Rank | Prize (TON) |
|------|-------------|
| 1st | 1,000 |
| 2nd | 500 |
| 3rd | 250 |
| 4th | 200 |
| 5th | 150 |
| 6-10 | 120-70 |
| 11-50 | 60-5 |

- Current user's card always visible at top with their rank

### Tab 2: All-Time Leaderboard

- Ranked by total `coins` (lifetime)
- Same layout, no prize tags

### Backend

- `getSeasonLeaderboard(limit)` -- queries `users` ordered by `seasonCash` desc
- `getUserSeasonRank(userId)` -- counts users with higher `seasonCash`
- Cached in `localStorage` with 5-minute expiry

---

## 14. Tasks Page

Quest/mission system for earning CASH:

| Task | Action | Reward |
|------|--------|--------|
| Join Telegram Channel | Open link, wait 5s, claim | 1,000 CASH |
| Follow Twitter/X | Open link, wait 5s, claim | 1,000 CASH |
| Subscribe YouTube | Open link, wait 5s, claim | 1,000 CASH |
| Visit Website | Open link, wait 5s, claim | 1,000 CASH |
| Follow Instagram | Open link, wait 5s, claim | 1,000 CASH |
| Follow TikTok | Open link, wait 5s, claim | 1,000 CASH |
| Join Discord | Open link, wait 5s, claim | 1,000 CASH |
| Connect TON Wallet | Connect via TonConnect | 3,000 CASH |
| Invite 1 Friend | Referral count check | 1,000 CASH |
| Invite 5 Friends | Referral count check | 5,000 CASH |
| Invite 10 Friends | Referral count check | 10,000 CASH |

### Task Card UI

- Flaticon icon (per platform)
- Task title
- Reward amount with CASH icon
- Status button: `GO` -> `Loading...` (5s) -> `Claim` -> `Done`

### Backend

- One-time completions stored in `users/{userId}.tasksCompleted[]` array
- `completeTaskWithReward(userId, taskId, reward)` -- atomically adds to array + increments `coins` and `seasonCash`

---

## 15. Friends / Referral Page

### Layout

- Header: "Earn CASH by inviting friends" + "+1,000 CASH per friend"
- "Share with friends" CTA button with press animation
- 6 direct share buttons: Telegram, WhatsApp, Facebook, Line, Twitter, Copy Link
- Invite link format: `https://t.me/YourBot/YourApp?startapp={userId}` (or web URL equivalent)
- **My Friends** list: each friend shows avatar, username, "+1,000 CASH" badge
- Loading skeleton + empty state

### Auto-Reward Logic

- On page load: fetch invitations count
- If `invitations.length > referrewarded`: credit `(difference x 1000)` CASH, update `referrewarded`

### Backend

- `getInvitations(userId)` -- queries users where `referredBy == userId`
- `updateReferrewarded(userId, count)` -- tracks rewarded count
- On new user creation: if `invitedBy` param exists, both users get 1,000 CASH bonus

---

## 16. Daily Reward System

7-day streak modal:

| Day | Reward |
|-----|--------|
| 1 | 100 CASH |
| 2 | 200 CASH |
| 3 | 300 CASH |
| 4 | 400 CASH |
| 5 | 500 CASH |
| 6 | 600 CASH |
| 7 | 10,000 CASH |

### UI

- Full-screen modal with fire/cyberpunk styling
- 2x3 grid for Days 1-6, full-width card for Day 7
- Active day: fire glow border + highlight
- Claimed days: checkmark icon overlay
- "Claim Reward" button (disabled if already claimed today)

### Rules

- Streak resets if more than 1 calendar day gap
- Loops back to Day 1 after Day 7
- Firestore fields: `dailyRewardDay`, `lastDailyReward`

---

## 17. Wallet & Payment Requests

A page for users to manage their wallet and request CASH withdrawals:

### Sections

| Section | Description |
|---------|-------------|
| CASH Balance card | Shows `points / 10` as "payable amount" (conversion rate: 10 CASH = 1 token) |
| Receiving Wallet | Save/edit wallet address (TON or EVM). Copy button, edit button |
| Request Payment | Minimum 100 CASH, 3-day cooldown between requests. Deducts CASH immediately |
| Payment History | List of past requests: amount, status (Pending / Paid / Rejected), date |
| Info modal | Explains CASH token, conversion rate, manual processing |

### Backend

- `createPaymentRequest(userId, amount)` -- validates balance, cooldown, wallet; creates `paymentRequests` doc; deducts CASH
- `getUserPaymentRequests(userId)` -- fetches user's history
- Admin manually sends real money/crypto, marks as Paid in admin panel

---

## 18. Firestore Data Model

### Collection: `users/{telegramId}`

```
odl_id                 string       Telegram user ID
odl_first_name         string       First name
odl_last_name          string       Last name
odl_username           string       Username
odl_photo_url          string       Avatar URL
coins                  number       Lifetime CASH balance
level                  number       Mining level
stars                  number       Star currency
energy                 number       Tap energy
maxEnergy              number       Max tap energy
lastEnergyUpdate       timestamp
referralCode           string       Unique invite code (e.g., "BR4C_ABC123")
referredBy             string|null  ID of referring user
createdAt              timestamp
updatedAt              timestamp
dailyRewardDay         number       Current streak day (1-7)
lastDailyReward        timestamp|null
tasksCompleted         string[]     Array of completed task IDs
claimedtotal           number       Legacy tap counter
dailycombotime         number       Legacy daily reset timestamp
referrewarded          number       How many referrals already rewarded
walletAddress          string|null  TON or EVM wallet address
vipTier                number       0=Free, 1=Bronze, 2=Silver, 3=Gold
vipExpiresAt           timestamp|null
seasonCash             number       CASH earned this season
gameEnergy             number|null  Game plays remaining today
lastEnergyReset        timestamp|null
tapCycleTaps           number       Tap progress (0-1000)
tapCycleEndTime        number|null  Cooldown start timestamp
tonBalance             number       Internal (non-withdrawable) TON balance
cooldownResetItems     number       Owned reset consumables
```

### Collection: `transactions/{autoId}`

```
odl_id       string    User ID
type         string    "earn" | "spend" | "reward" | "task" | "referral" | "game" | "withdrawal"
amount       number    CASH amount
description  string    Human-readable description
status       string    "pending" | "completed" | "failed"
createdAt    timestamp
```

### Collection: `seasons/{autoId}`

```
seasonNumber  number
startDate     timestamp
endDate       timestamp
isActive      boolean
createdAt     timestamp
```

### Collection: `paymentRequests/{autoId}`

```
odl_id           string
username         string
walletAddress    string
requestedAmount  number    CASH amount
payableAmount    number    CASH / 10
status           string    "pending" | "paid" | "rejected"
createdAt        timestamp
processedAt      timestamp|null
processedBy      string|null    Admin email
```

### Collection: `vipPurchases/{autoId}`

```
userId        string
tier          number
amountTON     number    (or amountUSD for Stripe)
purchasedAt   timestamp
expiresAt     timestamp
txHash        string    (or stripeSessionId)
status        string    "pending" | "confirmed" | "expired"
```

### Collection: `cooldownPurchases/{autoId}`

```
userId        string
amountTON     number
purchasedAt   timestamp
txHash        string
type          string
```

### Collection: `adminActions/{autoId}`

```
adminEmail     string
action         string
userId         string
previousValue  any
newValue       any
note           string
createdAt      timestamp
```

---

## 19. Admin Panel

Separate React + Tailwind + Firebase app:

### Authentication

- Firebase email/password login
- Hardcoded admin bootstrap (auto-creates account on first login)

### Pages

| Page | Features |
|------|----------|
| **Dashboard** | Stat cards (Total Users, Total CASH, Pending Payments, Total Paid), Revenue section (from VIP + item sales), Recent 10 transactions |
| **Users** | Searchable/filterable table, per-user: View details (profile + transaction history), Edit CASH balance, Edit TON balance. All edits logged to `adminActions` |
| **Transactions** | Last 200 transactions, filterable by type (earn/spend/reward/task/game/withdrawal), searchable |
| **Payments** | All payment requests, filterable by status. Actions: Mark as Paid, Reject (refunds CASH back to user) |
| **Seasons** | Create new season (30-day), End active season, Reset season, Bulk reset all users' `seasonCash` to 0, Season leaderboard with prize tiers, VIP purchase log, Cooldown purchase log |
| **VIP Manager** | VIP distribution stats (Free/Bronze/Silver/Gold counts), Edit any user's VIP tier/duration, VIP change audit log |
| **Admin Actions** | Full audit log of all admin actions, filterable by type, searchable by user ID or admin email |

---

## 20. Stripe Payment Integration

### Products

| Product | Price (USD) |
|---------|-------------|
| VIP Bronze | $5 |
| VIP Silver | $50 |
| VIP Gold | $100 |
| Cooldown Reset Item | $5 |

### Flow

```
User selects item in Shop
  -> Chooses "Pay with Card"
  -> Frontend creates Stripe Checkout Session (via Firebase Cloud Function)
  -> User redirected to Stripe hosted payment page
  -> On success: Stripe webhook fires
  -> Cloud Function updates Firestore (sets VIP tier, grants items, logs purchase)
  -> On cancel: user returns to shop, nothing changes
```

### Firebase Cloud Functions Needed

| Function | Purpose |
|----------|---------|
| `createCheckoutSession` | Creates Stripe session with line items, success/cancel URLs |
| `stripeWebhook` | Listens for `checkout.session.completed`, updates user Firestore doc |

### Alternative: Stripe Payment Intents (client-side)

- Embed Stripe Elements in a modal
- Confirm payment client-side
- On confirmation: update Firestore directly (less secure but fully serverless)

---

## 21. Crypto Payment (TON + EVM)

### TON Payment

- Library: `@tonconnect/ui-react`
- Flow: user selects "Pay with TON" -> TonConnect wallet popup -> sends transaction to admin TON wallet address -> on tx confirmation -> record `txHash` in Firestore, update VIP/items

### EVM Payment (USDT / ETH)

- Libraries: `@rainbow-me/rainbowkit`, `@web3modal/ethers`, `ethers`
- Flow: user selects "Pay with Crypto" -> chooses USDT or ETH -> Web3Modal connects MetaMask or WalletConnect -> sends transaction to admin EVM wallet -> on tx confirmation -> record `txHash` in Firestore, update VIP/items

### Dual-Path Logic

For each purchase, check internal TON balance first:
1. If user has sufficient internal TON balance -> deduct from Firestore balance (instant, no gas)
2. If not -> fall through to on-chain wallet transaction

---

## 22. Firestore Security Rules

Current (development -- open):
```
allow read, write: if true;
```

Production-ready:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null
                   || resource == null
                   || request.resource.data.odl_id == userId;
    }

    match /transactions/{txId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }

    match /seasons/{seasonId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /paymentRequests/{paymentId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.auth != null;
    }

    match /vipPurchases/{purchaseId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.auth != null;
    }

    match /cooldownPurchases/{purchaseId} {
      allow read: if true;
      allow create: if true;
    }

    match /adminActions/{actionId} {
      allow read, write: if request.auth != null;
    }

    match /vipAdminChanges/{changeId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 23. Onboarding Flow

When a new user opens the app for the first time:

| Step | Screen | Description |
|------|--------|-------------|
| 1 | Loading Screen | Dark background, floating embers, dual spinning rings (cyan + pink), "Loading..." text |
| 2 | Welcome Banner | Full-screen overlay: game logo, "Welcome to Breaking Racks 4 Cash!", "Start Playing" button |
| 3 | Account Check | 4 animated progress bars: Account Age Verified, Activity Level, Premium Status, OG Status |
| 4 | Reward Screen | Shows initial bonus based on account age (`years x 100 CASH` + 250 if premium user) |
| 5 | Claim | "Claim" button -> enters Home page, onboarding complete |

Subsequent visits skip directly to Loading Screen -> Home Page.

---

## 24. What Must NOT Be Changed

The following are **off-limits** -- zero modifications:

- The entire Phaser game engine (all 19 JS files)
- Ball physics, collision detection, pocketing logic
- AI difficulty system, shot selection algorithm
- Spin system (topspin, backspin, english)
- 8-ball rules enforcement
- Scoring formula (`10 x multiplier` per pot)
- Responsive canvas orientation handling
- Tutorial system (17 stages)
- Sound effects and audio management
- The cyberpunk theme overlay (`00cyberpunk.js`)
- Asset loading and spritesheet rendering
- Input system (mouse aim, touch power bar, spin wheel)
- Ball rendering (quaternion rotation, stripe sheets)
- Table geometry (cushions, vertices, pockets)
- Canvas layer order / z-depth structure
- SDK integration files

**The only acceptable in-game touch:** The match timer display can optionally be hidden/replaced by the external React timer overlay on top of the iframe, so both timers don't show simultaneously.

---

## 25. Deliverables Summary

| # | Deliverable | Type |
|---|-------------|------|
| 1 | React + TypeScript + Vite project wrapping the Phaser game | Frontend |
| 2 | Tailwind CSS cyberpunk/fire theme (matching game palette) | Styling |
| 3 | 5-tab bottom navigation (Tasks, Ranks, Home, Friends, Shop) | UI |
| 4 | Home page with tap-to-earn, currency display, Play Game button | Page |
| 5 | Game Modal (iframe wrapper with timer overlay, score capture, energy spend) | Component |
| 6 | Leaderboard page (Season + All-Time tabs) | Page |
| 7 | Tasks page (social tasks + invite tasks) | Page |
| 8 | Friends page (referral system, share buttons, friend list) | Page |
| 9 | Shop page (VIP Plans tab + Items tab) | Page |
| 10 | League Slider (8-tier swipeable carousel) | Page |
| 11 | Daily Reward modal (7-day streak) | Component |
| 12 | Wallet / Airdrop page (balance, wallet address, payment requests) | Page |
| 13 | Welcome Banner + Onboarding flow | Component |
| 14 | Loading Screen (fire/cyberpunk themed) | Component |
| 15 | Firebase Firestore backend (users, transactions, seasons, payments, VIP) | Backend |
| 16 | Firebase services layer (all CRUD, game scoring, energy, taps, VIP, payments) | Backend |
| 17 | TON Connect wallet integration | Payment |
| 18 | Stripe payment integration (Checkout Sessions + webhooks) | Payment |
| 19 | EVM crypto payment (USDT/ETH via Web3Modal + ethers.js) | Payment |
| 20 | Admin Panel (Dashboard, Users, Transactions, Payments, Seasons, VIP, Audit Log) | Admin |
| 21 | Firestore security rules (production-ready) | Security |
| 22 | UserContext (React context for global state management) | State |

---

*The 8 Ball Pool game stays untouched as a standalone HTML/JS bundle. Everything above wraps around it as the outer platform.*
