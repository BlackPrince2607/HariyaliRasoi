# Hariyali Rasoi

A full-stack cloud kitchen platform for a family-operated home-style Indian food brand.

## Stack

- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS v4, ShadCN-style UI
- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2.0 async, Alembic
- **Database**: PostgreSQL (Supabase or local Docker)
- **Storage**: Supabase Storage
- **Auth**: JWT (single admin user via env vars)

## Quick Start (Local)

### 1. Start PostgreSQL

```bash
cd hariyali-rasoi
docker compose up -d postgres
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your values. Generate admin password hash:

```bash
python scripts/hash_password.py yourpassword
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Viewing the site

| Page | URL |
|------|-----|
| **Customer website** (home, menu, cart) | [http://localhost:3000](http://localhost:3000) |
| **Full menu** | [http://localhost:3000/menu](http://localhost:3000/menu) |
| **Events & catering** (Bhandara, Catering, NGO) | [http://localhost:3000/events](http://localhost:3000/events) |
| **Admin dashboard** | [http://localhost:3000/auth/login](http://localhost:3000/auth/login) → `/admin` |

**Admin credentials** — set in `backend/.env`:
- `ADMIN_EMAIL` (default: `admin@hariyalirasoi.com`)
- `ADMIN_PASSWORD` — bcrypt hash from `python scripts/hash_password.py yourpassword`

The production menu (121 items) loads automatically when the backend starts with an empty database. You can also run `python scripts/import_menu.py --replace` manually.

### 4. Full Docker (optional)

```bash
docker compose up
```

## Supabase Setup

1. Create a Supabase project (free tier)
2. Copy the connection string to `DATABASE_URL` (use `postgresql+asyncpg://...`)
3. Create storage buckets: `menu`, `banners`, `gallery`, `upi`, `payments`
4. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to backend `.env`

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel — set `NEXT_PUBLIC_API_URL` |
| Backend | Railway or Render — set all backend env vars |
| Database | Supabase PostgreSQL |

## Project Structure

```
hariyali-rasoi/
├── frontend/     # Next.js customer + admin UI
├── backend/      # FastAPI REST API
└── docker-compose.yml
```

## Features

- Daily meal ordering (COD + manual UPI)
- Bulk catering & Bhandara bookings
- NGO food donation inquiries
- Admin dashboard with analytics
- Coupon system with server-side validation
- Rate limiting (3 orders/phone/hour)
- WhatsApp order sharing (no Business API needed)

## Default Coupons (seeded)

- `WELCOME10` — 10% off
- `FLAT50` — ₹50 off (min ₹300)
- `BHANDARA` — 15% off (min ₹500)
