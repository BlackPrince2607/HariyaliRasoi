"""Set store hours to 8:00–22:00

Revision ID: 004
Revises: 003
Create Date: 2026-08-07
"""
from typing import Sequence, Union

from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE store_settings
        SET opening_time = '08:00',
            closing_time = '22:00',
            dinner_end = '22:00'
        """
    )
    op.execute(
        """
        ALTER TABLE store_settings
        ALTER COLUMN opening_time SET DEFAULT '08:00',
        ALTER COLUMN closing_time SET DEFAULT '22:00'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE store_settings
        ALTER COLUMN opening_time SET DEFAULT '09:00',
        ALTER COLUMN closing_time SET DEFAULT '21:00'
        """
    )
    op.execute(
        """
        UPDATE store_settings
        SET opening_time = '09:00',
            closing_time = '21:00'
        """
    )
