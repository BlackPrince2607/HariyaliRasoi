# Hariyali Rasoi — Production Deployment Guide

Deploy the **frontend** (Next.js), **backend** (FastAPI), and **database/storage** (Supabase). Your GoDaddy domain points DNS to Vercel + Railway.

## Architecture

```
yourdomain.com          → Vercel (frontend)
www.yourdomain.com      → Vercel
api.yourdomain.com      → Railway (backend API)
Database + file storage → Supabase
```

---

## 1. Supabase (do this first)

1. Create a project at [supabase.com](https://supabase.com)
2. **Database** → Connection string → Session pooler → copy URL  
   Use format: `postgresql+asyncpg://postgres.PROJECT:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres?ssl=require`
3. **Storage** → Create buckets: `menu`, `banners`, `gallery`, `upi`, `payments` (all public read for images)
4. Copy **Project URL** and **service_role key** (Settings → API)

Run migrations locally against production DB once:
```bash
cd backend
alembic upgrade head
```

---

## 2. Backend (Railway)

1. New project → Deploy from GitHub → set **Root Directory** to `hariyali-rasoi/backend`
2. Railway detects `Dockerfile` and `railway.toml`
3. Add environment variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Supabase pooler URL |
| `SECRET_KEY` | Random 32+ char string |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | bcrypt hash from `python scripts/hash_password.py` |
| `SUPABASE_URL` | https://xxx.supabase.co |
| `SUPABASE_SERVICE_KEY` | service role key |
| `WHATSAPP_NUMBER` | 917439890089 |
| `ENVIRONMENT` | **production** |
| `APP_URL` | https://api.yourdomain.com |
| `CORS_ORIGINS` | https://yourdomain.com,https://www.yourdomain.com |

4. **Settings → Networking → Custom Domain** → `api.yourdomain.com`
5. Verify: `https://api.yourdomain.com/health` → `{"status":"ok"}`

---

## 3. Frontend (Vercel)

1. Import repo → **Root Directory:** `hariyali-rasoi/frontend`
2. Environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | https://api.yourdomain.com |
| `API_INTERNAL_URL` | https://api.yourdomain.com |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | 917439890089 |
| `NEXT_PUBLIC_APP_URL` | https://yourdomain.com |

3. **Domains** → Add `yourdomain.com` and `www.yourdomain.com`

---

## 4. GoDaddy DNS

In GoDaddy → DNS Management:

| Type | Name | Value |
|------|------|--------|
| CNAME | `api` | Railway hostname (from Railway dashboard) |
| A or CNAME | `@` | Vercel records (from Vercel domain setup) |
| CNAME | `www` | `cname.vercel-dns.com` (or Vercel instructions) |

**Tip:** Easiest option is to point GoDaddy nameservers to Vercel for the main domain.

Wait 15 min–24 hrs for DNS propagation.

---

## 5. Post-deploy checklist

- [ ] Admin login: `https://yourdomain.com/auth/login`
- [ ] **Admin → Settings:** store name, WhatsApp, UPI QR, address, delivery fees
- [ ] **Admin → Menu:** verify items and images
- [ ] Place test order (COD) on phone
- [ ] WhatsApp opens with order details
- [ ] Admin gets order alarm → Accept/Reject
- [ ] Customer confirmation page shows status update
- [ ] Change default admin password
- [ ] `ENVIRONMENT=production` on backend (hides API docs)

---

## 6. Local development

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
| Menu empty / API errors | Check `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS` |
| CORS error in browser | Add exact frontend URLs to `CORS_ORIGINS` on Railway, or redeploy frontend (uses `/api` proxy) |
| WhatsApp wrong number | Admin → Settings + `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Images not loading | Create Supabase buckets; check bucket is public |
| Order "menu not available" | Clear cart; re-add items after menu import |
