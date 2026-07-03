"""Add whatsapp_greeting to store_settings

Revision ID: 003
Revises: 002
Create Date: 2026-06-09
"""
from typing import Sequence, Union
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS whatsapp_greeting VARCHAR"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE store_settings DROP COLUMN IF EXISTS whatsapp_greeting")
