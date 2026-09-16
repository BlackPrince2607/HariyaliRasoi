# Hariyali Rasoi — Render Deployment Guide

Deploy **frontend** (Next.js) and **backend** (FastAPI) as two Render web services.
Keep **database + storage** on Supabase.

## Architecture

```
yourdomain.com          → Render (frontend / Next.js)
www.yourdomain.com      → Render (frontend)
api.yourdomain.com      → Render (backend / FastAPI)
Database + file storage → Supabase
```

Free web services **sleep after ~15 minutes** of idle traffic; the first request can take 30–60s (cold start).

### Keep-awake during open hours (optional)

A GitHub Action (`.github/workflows/render-keepalive.yml`) pings the API + web every 12 minutes from **7:00 AM – midnight IST**, so free-tier instances stay warm while you are open.

- Runs automatically on `main` after you push the workflow
- You can trigger it manually: GitHub → **Actions** → **Render keep-awake** → **Run workflow**
- Optional repo Secrets if you use custom domains: `RENDER_API_URL`, `RENDER_WEB_URL`

Outside those hours the services can sleep again (saves free-tier quota). For always-on, upgrade Render to a paid plan.

---

## Option A — Blueprint (recommended)

1. Push this repo to GitHub
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Select the repo  
   - Repo root is `HR` → uses root `render.yaml` (paths already include `hariyali-rasoi/…`)  
   - Or set Root Directory to `hariyali-rasoi` and use `hariyali-rasoi/render.yaml`
4. Fill in the **sync: false** env vars (see tables below), then apply
5. After both services have public URLs, set cross-service URLs and **redeploy**

---

## Option B — Manual services

### 1. Supabase (do this first)

1. Create a project at [supabase.com](https://supabase.com)
2. **Database** → Connect → **Session pooler** → copy URI  
   Convert to:
   `postgresql+asyncpg://postgres.PROJECT:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres?ssl=require`
3. **Storage** → Create public buckets: `menu`, `banners`, `gallery`, `upi`, `payments`
4. Copy **Project URL** and **service_role** key

Migrations run automatically on backend start (`alembic upgrade head`).

### 2. Backend (Web Service)

1. **New** → **Web Service** → connect GitHub repo
2. Settings:

| Field | Value |
|-------|--------|
| Root Directory | `hariyali-rasoi/backend` |
| Runtime | **Docker** |
| Dockerfile Path | `./Dockerfile` (default) |
| Instance type | Free |
| Health Check Path | `/health` |

3. **Environment** → add:

| Variable | Example / notes |
|----------|-----------------|
| `DATABASE_URL` | Supabase pooler URL (`postgresql+asyncpg://` + `?ssl=require`) |
| `SECRET_KEY` | Random 32+ character string (or use Generate) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD_B64` | **Preferred** — see below |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | service role key |
| `WHATSAPP_NUMBER` | `917439890089` |
| `ENVIRONMENT` | `production` |
| `APP_URL` | `https://hariyali-rasoi-api.onrender.com` (update after first deploy) |
| `CORS_ORIGINS` | Frontend URL(s), comma-separated |

4. Deploy → open `https://<api-service>.onrender.com/health` → `{"status":"ok"}`

### Admin password on Render

Use a **bcrypt hash**, not the plain password. `$` in env values can break hashes — prefer base64:

```bash
cd backend
python scripts/hash_password.py YourPassword
python scripts/encode_password_b64.py '$2b$12$...paste-hash...'
```

Set **`ADMIN_PASSWORD_B64`** and leave `ADMIN_PASSWORD` empty.

### 3. Frontend (Web Service)

1. **New** → **Web Service** → same repo
2. Settings:

| Field | Value |
|-------|--------|
| Root Directory | `hariyali-rasoi/frontend` |
| Runtime | **Docker** |
| Health Check Path | `/` |
| Instance type | Free |

3. **Environment** (set **before** build — `NEXT_PUBLIC_*` are baked in at image build):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://hariyali-rasoi-api.onrender.com` |
| `API_INTERNAL_URL` | Same as above (runtime `/api` proxy target — required on Render) |
| `NEXT_PUBLIC_APP_URL` | `https://hariyali-rasoi-web.onrender.com` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `917439890089` |

4. Deploy → open the frontend URL
5. Update backend `CORS_ORIGINS` with the frontend URL (and custom domain if any), then **Manual Deploy** the API

Browser calls stay same-origin (`/api/*`); the Next server rewrites to the API.

---

## Custom domain

In each Render service → **Settings → Custom Domains**, then point DNS:

| Type | Name | Value |
|------|------|--------|
| CNAME | `api` | Backend `.onrender.com` hostname |
| CNAME | `www` | Frontend `.onrender.com` hostname |
| A / ALIAS | `@` | Per Render custom-domain docs |

Then set `APP_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`, and `CORS_ORIGINS` to the real domains and **redeploy both** (frontend must rebuild for `NEXT_PUBLIC_*`).

---

## Post-deploy checklist

- [ ] `https://…api…/health` returns ok (wait through cold start on free tier)
- [ ] Site loads; menu shows items (seeded when DB is empty)
- [ ] Admin login at `/auth/login`
- [ ] **Admin → Settings:** store name, WhatsApp, UPI QR, address, fees
- [ ] Test COD order + WhatsApp share
- [ ] `ENVIRONMENT=production` (API docs hidden)

---

## Local development

```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open http://localhost:3000

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Free tier “waking up” | First request after sleep is slow; hit `/health` and wait |
| Backend deploy failed / health timeout | Check `DATABASE_URL` (`asyncpg` + `ssl=require`). First menu seed can take a few minutes |
| `tenant/user postgres.xxx not found` | Supabase project is **paused/deleted**, or pooler host/username is wrong. In dashboard: **Resume** project → **Connect** → Session pooler → copy URI. User must be `postgres.<project-ref>`, host must match the dashboard (often `aws-1-…` not `aws-0-…`). Convert scheme to `postgresql+asyncpg://` and keep `?ssl=require`. Redeploy. |
| `ADMIN_PASSWORD is not set` | Set `ADMIN_PASSWORD_B64` on the API service (see above), then redeploy |
| Admin login fails | Use `ADMIN_PASSWORD_B64`; hash from `scripts/hash_password.py` |
| Menu empty / API errors | Confirm API is awake; check `API_INTERNAL_URL` / `NEXT_PUBLIC_API_URL` |
| CORS error | Add exact frontend origin to `CORS_ORIGINS`, redeploy API |
| Frontend still points at old API | Change `NEXT_PUBLIC_*`, then **Clear build cache & deploy** |
| Images broken | Create Supabase buckets with public read |
| `$` breaks bcrypt in env | Use `ADMIN_PASSWORD_B64` only |
