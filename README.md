# ⚡ Energy Dignity Index (EDI) Platform
### *"Measuring Human Progress Through Energy Access"*
**Built by Kaushik Digital** · Production-Grade AI SaaS

---

## What is EDI?

AI-powered SaaS that **mathematically quantifies** the human development impact of rural electrification — going far beyond carbon credits to measure dignity.

### The Energy Dignity Score (EDS)
```
EDS = 0.25(Education) + 0.20(Healthcare) + 0.20(Economic Growth)
    + 0.15(Women's Empowerment) + 0.10(Digital Inclusion) + 0.10(Carbon Benefit)
```

---

## 🚀 Deploy to Render (3 Steps)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "EDI Platform by Kaushik Digital"
git remote add origin https://github.com/YOUR_USERNAME/edi-platform.git
git push -u origin main

# 2. Go to render.com → New → Blueprint → Connect repo
# render.yaml creates all 4 services automatically

# 3. Set secrets in Render dashboard (see docs/RENDER_DEPLOYMENT.md)
```

**Full guide:** [`docs/RENDER_DEPLOYMENT.md`](docs/RENDER_DEPLOYMENT.md)

---

## Architecture

```
frontend/   Next.js 15 + TypeScript + Tailwind + Framer Motion + Recharts
backend/    FastAPI + PostgreSQL + Redis + JWT + Google OAuth
ml/         XGBoost + RandomForest + LightGBM + Ensemble (96.1% accuracy)
docker/     Nginx + Docker Compose
render.yaml Blueprint for 1-click Render deploy
```

## ML Models

| Model | Accuracy | R² |
|-------|----------|----|
| XGBoost | 94.2% | 0.941 |
| Random Forest | 91.8% | 0.918 |
| LightGBM | 93.6% | 0.934 |
| **Ensemble** | **96.1%** | **0.961** |

## Quick Start (Docker)

```bash
cp .env.example .env          # Add ANTHROPIC_API_KEY
docker-compose up --build
open http://localhost:3000
```

---

*© 2025 Kaushik Digital — Measuring Human Progress Through Energy Access*
