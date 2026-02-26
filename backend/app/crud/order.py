from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Tuple
import datetime as dt

from app.models.order import Order, OrderItem
from app.models.menu import Bundle, BundleItem, Item
from app.models.user import User
from app.schemas.order_schema import CheckoutCreate, OrderCreate, OrderItemCreate
from app.crud.user import find_or_create_user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _recalculate_order_total(db: Session, order_id: int) -> float:
    total = (
        db.query(func.sum(OrderItem.quantity * OrderItem.unit_price))
        .filter(OrderItem.order_id == order_id)
        .scalar()
    ) or 0.0
    order = db.query(Order).filter(Order.id == order_id).first()
    order.total_amount = round(total, 2)
    db.flush()
    return total


def _validate_draft(order: Order) -> None:
    if order.status != "draft":
        raise ValueError(f"Order {order.id} is not editable (status: {order.status})")


def _expand_bundle(db: Session, order_id: int, bundle_id: int, passenger_count: int) -> List[OrderItem]:
    bundle = db.query(Bundle).filter(
        Bundle.id == bundle_id, Bundle.is_active == True
    ).first()
    if not bundle:
        raise ValueError(f"Bundle {bundle_id} not found or inactive")

    bundle_items = db.query(BundleItem).filter(BundleItem.bundle_id == bundle_id).all()
    if not bundle_items:
        raise ValueError(f"Bundle {bundle_id} has no items")

    created = []
    for bi in bundle_items:
        item = db.query(Item).filter(
            Item.id == bi.item_id, Item.is_active == True
        ).first()
        if not item:
            raise ValueError(f"Item {bi.item_id} in bundle {bundle_id} not found or inactive")
        oi = OrderItem(
            order_id=order_id,
            item_id=bi.item_id,
            bundle_id=bundle_id,
            quantity=bi.def_quality * passenger_count,
            unit_price=item.price,
        )
        db.add(oi)
        created.append(oi)
    return created


def _add_custom_items(db: Session, order_id: int, custom_items: List[OrderItemCreate]) -> List[OrderItem]:
    created = []
    for ci in custom_items:
        item = db.query(Item).filter(
            Item.id == ci.item_id, Item.is_active == True
        ).first()
        if not item:
            raise ValueError(f"Item {ci.item_id} not found or inactive")
        oi = OrderItem(
            order_id=order_id,
            item_id=ci.item_id,
            bundle_id=None,
            quantity=ci.quantity,
            unit_price=item.price,
        )
        db.add(oi)
        created.append(oi)
    return created


# ---------------------------------------------------------------------------
# Guest checkout flow
# ---------------------------------------------------------------------------

def create_order_from_checkout(
    db: Session,
    checkout_data: CheckoutCreate,
    user_id: Optional[str] = None,
) -> Tuple[Order, User, bool]:
    if not checkout_data.bundles and not checkout_data.custom_items:
        raise ValueError("Order must contain at least one bundle or custom item")
    if checkout_data.flight_date < dt.datetime.now(dt.timezone.utc):
        raise ValueError("Flight date must be in the future")

    try:
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError(f"User {user_id} not found")
            is_new_user = False
        else:
            user, is_new_user = find_or_create_user(
                db,
                phone=checkout_data.phone,
                email=checkout_data.email,
                full_name=checkout_data.full_name,
                password=checkout_data.password,
            )

        db_order = Order(
            user_id=user.id,
            tail_number=checkout_data.tail_number.strip(),
            passenger_count=checkout_data.passenger_count,
            flight_date=checkout_data.flight_date,
            status="pending",
            total_amount=0.0,
        )
        db.add(db_order)
        db.flush()

        for bundle_id in checkout_data.bundles:
            _expand_bundle(db, db_order.id, bundle_id, checkout_data.passenger_count)

        _add_custom_items(db, db_order.id, checkout_data.custom_items)

        db.flush()
        _recalculate_order_total(db, db_order.id)
        db.commit()
        db.refresh(db_order)
        return db_order, user, is_new_user

    except Exception:
        db.rollback()
        raise


# ---------------------------------------------------------------------------
# Logged-in user draft flow
# ---------------------------------------------------------------------------

def get_active_draft(db: Session, user_id: str) -> Optional[Order]:
    return (
        db.query(Order)
        .filter(Order.user_id == user_id, Order.status == "draft")
        .order_by(Order.created_at.desc())
        .first()
    )


def create_draft_order(db: Session, user_id: str) -> Order:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    existing = get_active_draft(db, user_id)
    if existing:
        raise ValueError(f"User {user_id} already has a draft order ({existing.id})")

    db_order = Order(
        user_id=user_id,
        tail_number="",
        passenger_count=1,
        flight_date=None,
        status="draft",
        total_amount=0.0,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def add_item_to_order(
    db: Session, order_id: int, item_id: int, quantity: int
) -> OrderItem:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError(f"Order {order_id} not found")
    _validate_draft(order)

    if quantity < 1:
        raise ValueError("Quantity must be at least 1")

    item = db.query(Item).filter(Item.id == item_id, Item.is_active == True).first()
    if not item:
        raise ValueError(f"Item {item_id} not found or inactive")

    order_item = OrderItem(
        order_id=order_id,
        item_id=item_id,
        bundle_id=None,
        quantity=quantity,
        unit_price=item.price,
    )
    db.add(order_item)
    db.flush()
    _recalculate_order_total(db, order_id)
    db.commit()
    db.refresh(order_item)
    return order_item


def add_bundle_to_order(
    db: Session, order_id: int, bundle_id: int
) -> List[OrderItem]:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError(f"Order {order_id} not found")
    _validate_draft(order)

    created = _expand_bundle(db, order_id, bundle_id, order.passenger_count)

    db.flush()
    _recalculate_order_total(db, order_id)
    db.commit()
    for oi in created:
        db.refresh(oi)
    return created


def update_order_item_quantity(
    db: Session, order_item_id: int, new_quantity: int
) -> OrderItem:
    order_item = db.query(OrderItem).filter(OrderItem.id == order_item_id).first()
    if not order_item:
        raise ValueError(f"OrderItem {order_item_id} not found")

    order = db.query(Order).filter(Order.id == order_item.order_id).first()
    _validate_draft(order)

    if new_quantity < 1:
        raise ValueError("Quantity must be at least 1")

    order_item.quantity = new_quantity
    db.flush()
    _recalculate_order_total(db, order_item.order_id)
    db.commit()
    db.refresh(order_item)
    return order_item


def remove_item_from_order(db: Session, order_item_id: int) -> None:
    order_item = db.query(OrderItem).filter(OrderItem.id == order_item_id).first()
    if not order_item:
        raise ValueError(f"OrderItem {order_item_id} not found")

    order = db.query(Order).filter(Order.id == order_item.order_id).first()
    _validate_draft(order)

    order_id = order_item.order_id
    db.delete(order_item)
    db.flush()
    _recalculate_order_total(db, order_id)
    db.commit()


def remove_bundle_from_order(db: Session, order_id: int, bundle_id: int) -> int:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError(f"Order {order_id} not found")
    _validate_draft(order)

    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order_id, OrderItem.bundle_id == bundle_id)
        .all()
    )
    if not items:
        raise ValueError(f"No items with bundle_id {bundle_id} in order {order_id}")

    count = len(items)
    for oi in items:
        db.delete(oi)

    db.flush()
    _recalculate_order_total(db, order_id)
    db.commit()
    return count


def update_order_details(
    db: Session,
    order_id: int,
    tail_number: Optional[str] = None,
    passenger_count: Optional[int] = None,
    flight_date: Optional[dt.datetime] = None,
) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError(f"Order {order_id} not found")
    _validate_draft(order)

    if tail_number is not None:
        order.tail_number = tail_number.strip()

    if flight_date is not None:
        if flight_date < dt.datetime.now(dt.timezone.utc):
            raise ValueError("Flight date must be in the future")
        order.flight_date = flight_date

    if passenger_count is not None:
        if passenger_count < 1 or passenger_count > 50:
            raise ValueError("Passenger count must be between 1 and 50")
        if passenger_count != order.passenger_count:
            old_count = order.passenger_count or 1
            order.passenger_count = passenger_count
            bundle_items = (
                db.query(OrderItem)
                .filter(OrderItem.order_id == order_id, OrderItem.bundle_id != None)
                .all()
            )
            for oi in bundle_items:
                bi = db.query(BundleItem).filter(
                    BundleItem.bundle_id == oi.bundle_id,
                    BundleItem.item_id == oi.item_id,
                ).first()
                if bi:
                    oi.quantity = bi.def_quality * passenger_count
            db.flush()
            _recalculate_order_total(db, order_id)

    db.commit()
    db.refresh(order)
    return order


def confirm_order(db: Session, order_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError(f"Order {order_id} not found")
    if order.status != "draft":
        raise ValueError(f"Order {order_id} cannot be confirmed (status: {order.status})")
    if not order.order_items:
        raise ValueError(f"Order {order_id} has no items")
    if not order.tail_number or not order.flight_date:
        raise ValueError(f"Order {order_id} missing flight info")

    order.status = "pending"
    db.commit()
    db.refresh(order)
    return order


# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------

def cancel_order(db: Session, order_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError(f"Order {order_id} not found")
    if order.status in ("delivered", "cancelled"):
        raise ValueError(f"Order {order_id} cannot be cancelled (status: {order.status})")

    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    return order


def get_order(db: Session, order_id: int) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()


def get_user_orders(
    db: Session, user_id: str, skip: int = 0, limit: int = 100
) -> List[Order]:
    return (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
