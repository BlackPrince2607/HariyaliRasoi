"""Add tags column to menu_items

Revision ID: 002
Revises: 001
Create Date: 2026-06-09
"""
from typing import Sequence, Union
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'")


def downgrade() -> None:
    op.execute("ALTER TABLE menu_items DROP COLUMN IF EXISTS tags")
