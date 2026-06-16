# 🚀 Render Deployment Guide — Energy Dignity Index
**Built by Kaushik Digital | Measuring Human Progress Through Energy Access**

---

## Overview

This guide deploys 4 services on Render:
| Service | Type | Plan |
|---------|------|------|
| `edi-postgres` | PostgreSQL | Starter (free) |
| `edi-redis` | Redis | Starter (free) |
| `edi-backend` | Web Service (Python) | Starter |
| `edi-frontend` | Web Service (Node) | Starter |

Total free tier cost: **$0/month** to start.

---

## Method 1 — Blueprint (Recommended, 1-click)

### Step 1 — Push to GitHub

```bash
cd edi-platform
git init
git add .
git commit -m "Initial commit — EDI Platform by Kaushik Digital"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/edi-platform.git
git push -u origin main
```

### Step 2 — Create Blueprint on Render

1. Go to [render.com](https://render.com) → Sign in
2. Click **New +** → **Blueprint**
3. Connect your GitHub account → Select `edi-platform` repo
4. Render detects `render.yaml` automatically
5. Click **Apply**

Render will create all 4 services automatically.

### Step 3 — Set Secret Environment Variables

After services are created, go to each service and set these secrets:

**edi-backend → Environment:**
```
SECRET_KEY           = <generate: openssl rand -hex 32>
ANTHROPIC_API_KEY    = sk-ant-...
GOOGLE_CLIENT_ID     = ...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-...
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY   = your-key
CLOUDINARY_API_SECRET = your-secret
SENDGRID_API_KEY     = SG.xxx
```

**edi-frontend → Environment:**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID = ...apps.googleusercontent.com
```

### Step 4 — Deploy

Click **Manual Deploy → Deploy latest commit** on both services.

✅ Done! Your platform is live at:
- Frontend: `https://edi-frontend.onrender.com`
- Backend API: `https://edi-backend.onrender.com`
- API Docs: `https://edi-backend.onrender.com/docs`

---

## Method 2 — Manual Service Creation

### Step 1 — PostgreSQL Database

1. Render Dashboard → **New +** → **PostgreSQL**
2. Settings:
   ```
   Name:     edi-postgres
   Database: edi_db
   User:     edi_user
   Region:   Singapore (closest to India)
   Plan:     Free
   ```
3. Click **Create Database**
4. Copy the **Internal Database URL** — you'll need it for the backend

### Step 2 — Redis

1. **New +** → **Redis**
2. Settings:
   ```
   Name:   edi-redis
   Region: Singapore
   Plan:   Free
   ```
3. Copy the **Internal Redis URL**

### Step 3 — Backend (FastAPI)

1. **New +** → **Web Service**
2. Connect your GitHub repo → select `edi-platform`
3. Settings:
   ```
   Name:         edi-backend
   Region:       Singapore
   Branch:       main
   Root Dir:     backend
   Runtime:      Python 3
   Build Cmd:    pip install -r requirements.txt && python -m app.ml.generate_data && python -m app.ml.train_models
   Start Cmd:    alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
   Plan:         Starter ($7/mo) or Free (spins down after inactivity)
   ```
4. Add Environment Variables:
   ```
   DATABASE_URL         = <Internal URL from edi-postgres>
   REDIS_URL            = <Internal URL from edi-redis>
   SECRET_KEY           = <openssl rand -hex 32>
   ENVIRONMENT          = production
   ANTHROPIC_API_KEY    = sk-ant-...
   GOOGLE_CLIENT_ID     = ...
   GOOGLE_CLIENT_SECRET = ...
   CLOUDINARY_CLOUD_NAME = ...
   CLOUDINARY_API_KEY   = ...
   CLOUDINARY_API_SECRET = ...
   SENDGRID_API_KEY     = ...
   ALLOWED_ORIGINS      = https://edi-frontend.onrender.com
   EDS_WEIGHT_EDUCATION = 0.25
   EDS_WEIGHT_HEALTHCARE = 0.20
   EDS_WEIGHT_ECONOMIC  = 0.20
   EDS_WEIGHT_WOMEN     = 0.15
   EDS_WEIGHT_DIGITAL   = 0.10
   EDS_WEIGHT_CARBON    = 0.10
   ```
5. Click **Create Web Service**

### Step 4 — Frontend (Next.js)

1. **New +** → **Web Service**
2. Settings:
   ```
   Name:         edi-frontend
   Region:       Singapore
   Branch:       main
   Root Dir:     frontend
   Runtime:      Node
   Build Cmd:    npm install && npm run build
   Start Cmd:    npm start
   Plan:         Starter ($7/mo) or Free
   ```
3. Add Environment Variables:
   ```
   NODE_ENV                     = production
   NEXT_PUBLIC_API_URL          = https://edi-backend.onrender.com/api/v1
   NEXT_PUBLIC_APP_URL          = https://edi-frontend.onrender.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID = ...
   ```
4. Click **Create Web Service**

---

## Custom Domain Setup

1. Go to your service → **Settings** → **Custom Domains**
2. Add your domain: `edi.kaushikdigital.com`
3. Add CNAME record in your DNS:
   ```
   Type:  CNAME
   Name:  edi
   Value: edi-frontend.onrender.com
   ```
4. Render auto-provisions SSL via Let's Encrypt

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized origins:
   ```
   https://edi-frontend.onrender.com
   https://edi.kaushikdigital.com
   ```
6. Authorized redirect URIs:
   ```
   https://edi-backend.onrender.com/api/v1/auth/google/callback
   ```
7. Copy Client ID and Secret → paste into Render env vars

---

## Upgrading Plans

When you're ready for production traffic:

| Service | Free Plan Limit | Recommended Upgrade |
|---------|----------------|---------------------|
| PostgreSQL | 256 MB storage | Standard ($20/mo) = 100 GB |
| Redis | 25 MB | Standard ($10/mo) = 100 MB |
| Backend | Spins down after 15min inactivity | Starter ($7/mo) = always on |
| Frontend | Spins down after 15min inactivity | Starter ($7/mo) = always on |

---

## Health Checks

After deployment, verify:

```bash
# Backend health
curl https://edi-backend.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "service": "Energy Dignity Index API",
  "version": "1.0.0",
  "built_by": "Kaushik Digital"
}

# API docs
open https://edi-backend.onrender.com/docs

# Frontend
open https://edi-frontend.onrender.com
```

---

## Render Auto-Deploy

Every `git push` to `main` triggers automatic redeploy:
```bash
git add .
git commit -m "feat: update EDS weights"
git push origin main
# Render auto-deploys in ~3-5 minutes
```

To disable auto-deploy: Service → **Settings** → **Auto-Deploy** → Off

---

## Logs & Monitoring

```
Render Dashboard → Service → Logs (real-time streaming)
```

Set up alerts:
- Service → **Notifications** → Add email/Slack webhook
- Alert on: Deploy failed, Service unavailable

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `SECRET_KEY` | ✅ | JWT signing key (32+ chars) |
| `ANTHROPIC_API_KEY` | ✅ | For AI policy generation |
| `GOOGLE_CLIENT_ID` | ⚡ | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | ⚡ | Google OAuth (optional) |
| `CLOUDINARY_*` | ⚡ | PDF/image storage (optional) |
| `SENDGRID_API_KEY` | ⚡ | Email verification (optional) |
| `ENVIRONMENT` | ✅ | Set to `production` |
| `ALLOWED_ORIGINS` | ✅ | Frontend URL for CORS |

---

*Built by **Kaushik Digital** — Measuring Human Progress Through Energy Access*
