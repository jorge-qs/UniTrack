"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2024-07-17 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.db.models import GUID

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_table(
        "courses",
        sa.Column("cod_curso", sa.String(length=32), nullable=False),
        sa.Column("nombre", sa.String(length=255), nullable=False),
        sa.Column("creditos", sa.Integer(), nullable=True),
        sa.Column("familia", sa.String(length=255), nullable=True),
        sa.Column("nivel", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("cod_curso")
    )

    op.create_table(
        "inferences",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("user_id", GUID(), nullable=False),
        sa.Column("cod_curso", sa.String(length=32), nullable=False),
        sa.Column("input", sa.JSON(), nullable=False),
        sa.Column("output", sa.JSON(), nullable=False),
        sa.Column("version", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["cod_curso"], ["courses.cod_curso"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("idx_inferences_user_id_created", "inferences", ["user_id", "created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_inferences_user_id_created", table_name="inferences")
    op.drop_table("inferences")
    op.drop_table("courses")
    op.drop_table("users")
