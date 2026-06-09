# Hariyali Rasoi — Backend API

FastAPI REST API for the Hariyali Rasoi cloud kitchen platform.

## Setup

```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env
python scripts/hash_password.py yourpassword
alembic upgrade head
python scripts/import_menu.py --replace   # load Hariyali Rasoi production menu
uvicorn app.main:app --reload
```

## Menu Seed & Import

The production menu lives in `seed/menu.json` (121 items across 16 categories). Regenerate from the PDF with:

```bash
python scripts/generate_menu_seed.py
```

Import into the database:

```bash
python scripts/import_menu.py              # merge/upsert by slug
python scripts/import_menu.py --replace    # wipe and reimport
python scripts/import_menu.py --file path/to/menu.json
```

Admins can also import via **Admin → Menu → Bulk Menu Import** (production seed or JSON upload).

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment Variables

See `.env.example` for all required variables.

## Key Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/orders` | Public | Place order (prices calculated server-side) |
| `POST /api/auth/login` | Public | Admin JWT login |
| `GET /api/menu` | Public | List menu items |
| `GET /api/analytics/*` | Admin | Dashboard analytics |

## Migrations

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```
