"""add bundle pax tiers

Revision ID: c3d8e1f2a456
Revises: bfc43bbe01bf
Create Date: 2026-03-06 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d8e1f2a456'
down_revision: Union[str, Sequence[str], None] = 'bfc43bbe01bf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Bundle pax-based price tiers (price for 2 pax already in 'price' column)
    op.add_column('bundles', sa.Column('price_4',  sa.Float(), nullable=True))
    op.add_column('bundles', sa.Column('price_6',  sa.Float(), nullable=True))
    op.add_column('bundles', sa.Column('price_8',  sa.Float(), nullable=True))
    op.add_column('bundles', sa.Column('price_10', sa.Float(), nullable=True))

    # BundleItem pax-based quantity tiers (qty for 2 pax already in 'def_quality' column)
    op.add_column('bundleitems', sa.Column('qty_4',  sa.Integer(), nullable=True))
    op.add_column('bundleitems', sa.Column('qty_6',  sa.Integer(), nullable=True))
    op.add_column('bundleitems', sa.Column('qty_8',  sa.Integer(), nullable=True))
    op.add_column('bundleitems', sa.Column('qty_10', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('bundleitems', 'qty_10')
    op.drop_column('bundleitems', 'qty_8')
    op.drop_column('bundleitems', 'qty_6')
    op.drop_column('bundleitems', 'qty_4')
    op.drop_column('bundles', 'price_10')
    op.drop_column('bundles', 'price_8')
    op.drop_column('bundles', 'price_6')
    op.drop_column('bundles', 'price_4')
