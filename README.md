# FIFA-Style Soccer Game (Three.js + Vite)

A playable 3D soccer game with:
- 11 vs 11 teams
- Passing, shooting, through-ball, tackling
- Goalkeeper + outfield AI
- Match timer (halftime/fulltime)
- HUD (scoreboard, radar, stamina, shot power)
- Team selection screen

## Run locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Build production files

```bash
npm run build
npm run preview
```

---

## GitHub for beginners (step-by-step)

### 1) Create a GitHub account
1. Go to https://github.com
2. Click **Sign up** and create your account.

### 2) Create a new repository
1. Click the **+** button (top-right) → **New repository**.
2. Name it, for example: `fifa-soccer-game`.
3. Keep it **Public** (required for free GitHub Pages).
4. Click **Create repository**.

### 3) Upload your project
If you have Git installed locally:

```bash
git init
git add .
git commit -m "Initial FIFA 3D soccer game"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

Replace `<YOUR_USERNAME>` and `<YOUR_REPO>` with your real values.

### 4) Enable GitHub Pages (using Actions)
This repo includes `.github/workflows/deploy-pages.yml`.

On GitHub:
1. Open your repo.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**, choose **Source: GitHub Actions**.
4. Push to `main` again (or rerun workflow under **Actions** tab).

### 5) Get your live URL
Your game will be published at:

`https://<YOUR_USERNAME>.github.io/<YOUR_REPO>/`

### 6) Update your game later
Any future push to `main` automatically redeploys Pages:

```bash
git add .
git commit -m "Update gameplay"
git push
```

---

## Optional custom models
Drop files in `public/`:
- `public/stadium.glb`
- `public/player.glb`

Then set in `src/main.js`:
- `STADIUM_CONFIG.useCustomStadium = true`
- `PLAYER_CONFIG.useCustomModel = true`

