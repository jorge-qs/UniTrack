"""align models with current ORM (users, courses, student_profiles)

Revision ID: 0002
Revises: 0001
Create Date: 2025-10-29 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.db.models import GUID

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[Sequence[str], None] = None


def upgrade() -> None:
    # users: add password_hash, full_name, is_active, updated_at
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("password_hash", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("full_name", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("is_active", sa.Boolean(), server_default=sa.text("1"), nullable=False))
        batch_op.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            )
        )

    # courses: add semestre, tipo, horas, prerequisitos
    with op.batch_alter_table("courses", schema=None) as batch_op:
        batch_op.add_column(sa.Column("semestre", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("tipo", sa.String(length=10), nullable=True))
        batch_op.add_column(sa.Column("horas", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("prerequisitos", sa.JSON(), nullable=True))

    # student_profiles: new table
    op.create_table(
        "student_profiles",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("user_id", GUID(), nullable=False),
        sa.Column("profile_data", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_student_profiles_user_id"),
    )


def downgrade() -> None:
    # Drop student_profiles
    op.drop_table("student_profiles")

    # courses: drop added columns
    with op.batch_alter_table("courses", schema=None) as batch_op:
        batch_op.drop_column("prerequisitos")
        batch_op.drop_column("horas")
        batch_op.drop_column("tipo")
        batch_op.drop_column("semestre")

    # users: drop added columns
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("updated_at")
        batch_op.drop_column("is_active")
        batch_op.drop_column("full_name")
        batch_op.drop_column("password_hash")

