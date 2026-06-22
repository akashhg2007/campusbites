# Campus Bites Backend — Free Hosting Options (Ranked)

## 🥇 Option 1: Koyeb (RECOMMENDED — Always On, No Cold Start)

**Why:** Free tier with always-on services, no spin-down, WebSocket support.

### Deploy Steps:
1. Go to https://app.koyeb.com and sign up with GitHub
2. Click "Create Service" → Select "Git" → Pick your repo
3. Configure:
   - **Name:** campus-bites-api
   - **Region:** US or Asia
   - **Instance:** Free (Nano)
   - **Build Command:** `cd campus-bites/server && npm install`
   - **Start Command:** `cd campus-bites/server && node index.js`
   - **Port:** 8080
4. Add env vars: MONGO_URI, JWT_SECRET, etc.
5. Click Deploy

**Result:** Backend always online, ~2-5s response time.

---

## 🥈 Option 2: Fly.io (Always On, Free 3 Shared VMs)

**Why:** Near-zero cold starts, Docker-based, WebSocket support.

### Deploy Steps:
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# From project root (campusbites/)
fly launch --copy-config --name campus-bites-api
fly secrets set MONGO_URI=your_uri JWT_SECRET=your_secret
fly deploy
```

**Result:** Always on, 2-5s response.

---

## 🥉 Option 3: Railway ($5/mo Free Credit)

**Why:** Fast deploys, good DX, free $5/month credit covers hobby usage.

### Deploy Steps:
1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo, set root directory to `campus-bites/server`
4. Railway auto-detects Node.js
5. Add env vars in Settings
6. Click Deploy

**Result:** $5/mo free = ~500 hours. Fast cold starts.

---

## ⚠️ Option 4: Render (Current — Has Cold Start Issues)

Free tier spins down after 15min. Each visit = 30-60s wait.

**Fix:** Enable "Always On" in Render dashboard (requires paid plan $7/mo).

---

## My Recommendation

**Deploy to Koyeb now** — it's the closest to a free always-on service:
1. Push the Dockerfile commit to GitHub
2. Sign up at koyeb.com
3. Deploy in 5 minutes
4. Set env vars
5. Update VITE_API_URL in Vercel to point to Koyeb URL
