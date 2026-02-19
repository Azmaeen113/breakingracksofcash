# Breaking Racks 4 Cash — Firebase & Deployment Setup Guide

## Table of Contents
1. [Firebase Project Setup](#1-firebase-project-setup)
2. [Enable Firestore Database](#2-enable-firestore-database)
3. [Enable Firebase Authentication](#3-enable-firebase-authentication)
4. [Firestore Security Rules](#4-firestore-security-rules)
5. [Environment Variables](#5-environment-variables)
6. [Copy Game Files](#6-copy-game-files)
7. [Install & Run Locally](#7-install--run-locally)
8. [Create Admin Account](#8-create-admin-account)
9. [Deploy to Netlify](#9-deploy-to-netlify)
10. [Deploy Admin Panel](#10-deploy-admin-panel)
11. [Payment Integration](#11-payment-integration)
12. [Post-Launch Checklist](#12-post-launch-checklist)

---

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Name it: `breaking-racks-4-cash`
4. Disable Google Analytics (optional) → **Create project**
5. Once created, click the **Web** icon (`</>`) to add a web app
6. Register with nickname: `br4c-frontend`
7. **Copy the config object** — you'll need these values:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "breaking-racks-4-cash.firebaseapp.com",
     projectId: "breaking-racks-4-cash",
     storageBucket: "breaking-racks-4-cash.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

---

## 2. Enable Firestore Database

1. In Firebase Console → **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your preferred region (e.g., `us-central1` or `europe-west1`)
5. Click **Enable**

### Required Collections
These are auto-created when the app runs, but here's the schema:

| Collection | Document Fields |
|---|---|
| `users` | `odl_id`, `odl_first_name`, `odl_username`, `cashBalance`, `tokenBalance`, `seasonCash`, `gamesPlayed`, `gameEnergy`, `highScore`, `totalScore`, `tapCount`, `tapCycleProgress`, `tapCooldownUntil`, `cooldownResets`, `vipTier`, `vipExpiresAt`, `dailyRewardDay`, `lastDailyReward`, `completedTasks`, `referredBy`, `referralCount`, `walletAddress`, `createdAt`, `updatedAt`, `lastEnergyReset` |
| `paymentRequests` | `userId`, `amount`, `walletAddress`, `status`, `createdAt`, `processedAt`, `adminNote` |
| `seasons` | `name`, `startDate`, `endDate`, `status`, `createdAt` |
| `transactions` | `userId`, `type`, `amount`, `description`, `createdAt` |
| `adminActions` | `action`, `details`, `adminId`, `createdAt` |

---

## 3. Enable Firebase Authentication

1. In Firebase Console → **Build** → **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

This is used for admin panel login only.

---

## 4. Firestore Security Rules

Go to **Firestore Database** → **Rules** tab and paste:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - allow read/write for all (anonymous platform users)
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Payment requests - allow read/write for all
    match /paymentRequests/{requestId} {
      allow read, write: if true;
    }
    
    // Seasons - allow read for all, write for authenticated (admin)
    match /seasons/{seasonId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Transactions - allow read/write for all
    match /transactions/{txId} {
      allow read, write: if true;
    }
    
    // Admin actions - only authenticated users
    match /adminActions/{actionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> **Security Note:** For production, you should restrict writes to use Cloud Functions or validate `request.resource.data` fields. The rules above are permissive for initial development.

Click **Publish**.

---

## 5. Environment Variables

### Platform (frontend) — `platform/.env`

Create `platform/.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=breaking-racks-4-cash.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=breaking-racks-4-cash
VITE_FIREBASE_STORAGE_BUCKET=breaking-racks-4-cash.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Admin Panel — `admin/.env`

Create `admin/.env` with the **same** Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=breaking-racks-4-cash.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=breaking-racks-4-cash
VITE_FIREBASE_STORAGE_BUCKET=breaking-racks-4-cash.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Replace the values above with your actual Firebase config from Step 1.

---

## 6. Copy Game Files

The platform loads the Phaser game inside an iframe from `/game/index.html`.

Copy your game files into the platform's public directory:

```powershell
# From the project root:
mkdir platform\public\game
xcopy /E /I index.html platform\public\game\
xcopy /E /I assets platform\public\game\assets
xcopy /E /I html5games platform\public\game\html5games
copy sdk_interface.js platform\public\game\
copy crazygames-sdk-v2.js platform\public\game\
copy famobi.json platform\public\game\
```

Or if you prefer a simpler approach, copy the entire game root folder contents into `platform/public/game/`.

---

## 7. Install & Run Locally

### Platform (port 3000)

```powershell
cd platform
npm install
npm run dev
```

Open http://localhost:3000

### Admin Panel (port 3001)

```powershell
cd admin
npm install
npm run dev
```

Open http://localhost:3001

---

## 8. Create Admin Account

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Authentication** → **Users**
2. Click **Add user**
3. Enter:
   - Email: `admin@breakingracks.com` (or your email)
   - Password: `YourSecurePassword123!`
4. Click **Add user**

Now use these credentials to log into the admin panel at `localhost:3001`.

---

## 9. Deploy to Netlify

### Platform Frontend

1. Push `platform/` to a GitHub repository
2. Go to [Netlify](https://app.netlify.com/)
3. Click **Add new site** → **Import an existing project**
4. Connect your GitHub repo
5. Configure build settings:
   - **Base directory:** `platform`
   - **Build command:** `npm run build`
   - **Publish directory:** `platform/dist`
6. Add environment variables (from Step 5) in **Site settings** → **Environment variables**
7. Deploy!

The `_redirects` file is already included for SPA routing.

---

## 10. Deploy Admin Panel

Deploy the admin panel to a separate Netlify site:

1. Push `admin/` to GitHub (same or separate repo)
2. Create a new Netlify site
3. Configure:
   - **Base directory:** `admin`
   - **Build command:** `npm run build`
   - **Publish directory:** `admin/dist`
4. Add the same environment variables
5. Deploy

> **Tip:** Use a custom domain like `admin.breakingracks.com`

### Admin Panel `_redirects`

Create `admin/public/_redirects`:
```
/*    /index.html   200
```

---

## 11. Payment Integration

### Stripe (Card Payments)

1. Create a [Stripe account](https://stripe.com)
2. Get your publishable key from Dashboard → Developers → API keys
3. Add to `platform/.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. For production, implement a backend Cloud Function to create Stripe checkout sessions

### TON Connect (TON Wallet)

1. Follow [TON Connect docs](https://docs.ton.org/develop/dapps/ton-connect/)
2. Create a `tonconnect-manifest.json` in `platform/public/`:
   ```json
   {
     "url": "https://breakingracks.com",
     "name": "Breaking Racks 4 Cash",
     "iconUrl": "https://breakingracks.com/icon.png"
   }
   ```
3. The TON Connect UI components are already imported in the project

### EVM Wallets (ETH/USDT/BNB)

1. The project includes `ethers.js` and `@web3modal/ethers`
2. Get a WalletConnect project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
3. Add to `platform/.env`:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

> **Important:** Payment processing (Stripe) should use Firebase Cloud Functions as a backend to securely handle transactions. The current frontend implementation includes placeholder flows that simulate payments for development.

---

## 12. Post-Launch Checklist

- [ ] Update social task links in `platform/src/config/tasks.ts`
- [ ] Replace placeholder URLs in task config
- [ ] Set up Firestore indexes (Firebase may prompt you — check console errors for auto-generated index links)
- [ ] Create your first Season in the admin panel
- [ ] Tighten Firestore security rules for production
- [ ] Set up Firebase Cloud Functions for:
  - Payment processing (Stripe webhooks)
  - Token distribution
  - Anti-cheat validation
- [ ] Configure custom domains
- [ ] Set up monitoring & alerts in Firebase
- [ ] Test referral flow end-to-end
- [ ] Test VIP purchase flow
- [ ] Run through daily reward streak cycle
- [ ] Verify game iframe communication (score reporting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 PLATFORM (React)                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Home │ Tasks │ Leaderboard │ Friends    │   │
│  │  Shop │ Wallet │ Game Modal              │   │
│  └──────────────────────────────────────────┘   │
│       │                    │                     │
│  UserContext          GameModal (iframe)          │
│       │                    │                     │
│  Firebase Firestore    Phaser 8-Ball Pool        │
│  (NoSQL Database)      (Original Game)           │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│  ADMIN PANEL (React) │
│  Dashboard, Users,   │
│  Payments, Seasons,  │
│  VIP, Transactions   │
│  (Firebase Auth)     │
└─────────────────────┘
```

---

## Need Help?

- Firebase Docs: https://firebase.google.com/docs
- Vite Docs: https://vitejs.dev/guide/
- Tailwind CSS: https://tailwindcss.com/docs
- React Router: https://reactrouter.com/en/main
- TON Connect: https://docs.ton.org/develop/dapps/ton-connect/

