"""Probe Supabase Session Pooler regions for this project (uses backend/.env via app.config).

Run from backend folder:
  python scripts/find_pooler_region.py
"""
import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings

PROJECT_REF = "akanygriqwozjjtfmogq"
REGIONS = [
    "ap-south-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
    "ap-northeast-2",
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-west-2",
    "eu-west-3",
    "eu-central-1",
    "eu-central-2",
    "eu-north-1",
    "sa-east-1",
    "ca-central-1",
]

url = settings.database_url
m = re.search(r"://postgres(?:\.[^:]+)?:([^@]+)@", url)
password = m.group(1) if m else ""

if not password:
    print("Set DATABASE_URL with password in backend/.env")
    sys.exit(1)


async def try_host(host: str) -> str:
    import asyncpg

    user = f"postgres.{PROJECT_REF}"
    try:
        conn = await asyncio.wait_for(
            asyncpg.connect(
                host=host,
                port=5432,
                user=user,
                password=password,
                database="postgres",
                ssl="require",
            ),
            timeout=8,
        )
        version = await conn.fetchval("SELECT version()")
        await conn.close()
        return f"OK — {version[:60]}..."
    except Exception as e:
        return f"FAIL — {type(e).__name__}: {e}"


async def main() -> None:
    print(f"Project ref: {PROJECT_REF}\n")
    for region in REGIONS:
        for prefix in ("aws-0", "aws-1"):
            host = f"{prefix}-{region}.pooler.supabase.com"
            result = await try_host(host)
            label = f"{prefix}-{region}"
            print(f"{label:28} {result}")
            if result.startswith("OK"):
                print(f"\n>>> Working host: {host}")
                print(
                    f"DATABASE_URL=postgresql+asyncpg://postgres.{PROJECT_REF}:"
                    f"<password>@{host}:5432/postgres?ssl=require"
                )
                return


if __name__ == "__main__":
    asyncio.run(main())
