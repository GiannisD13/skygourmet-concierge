from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.core.security import create_access_token
from app.crud import order as crud
from app.models.user import User
from app.schemas.order_schema import (
    Order, CheckoutCreate, OrderCreate,
    OrderUpdate, OrderItemResponse,
)

router = APIRouter()


# ── GUEST CHECKOUT (δημιουργεί user + order, επιστρέφει JWT) ─────────────────

class CheckoutResponse(Order.__class__):
    pass

from pydantic import BaseModel

class CheckoutResponse(BaseModel):
    order_id: int
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool

#ΔΗΜΙΟΥΡΓΙΑ ΠΑΡΑΓΓΕΛΙΑΣ+ΧΡΗΣΤΗ ΚΑΙ ΕΚΔΟΣΗ TOKEN
@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
def checkout(data: CheckoutCreate, db: Session = Depends(get_db)):
    """Guest ή logged-out user: δημιουργεί account + order σε ένα βήμα."""
    try:
        order, user, is_new_user = crud.create_order_from_checkout(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token = create_access_token(data={"sub": user.id})
    return CheckoutResponse(order_id=order.id, access_token=token, is_new_user=is_new_user)


# ── DRAFT CART (logged-in users) ──────────────────────────────────────────────

@router.get("/draft", response_model=Order)
def get_draft(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = crud.get_active_draft(db, current_user.id)
    if not draft:
        raise HTTPException(status_code=404, detail="No active draft order")
    return draft


@router.post("/draft", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_draft(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return crud.create_draft_order(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/draft/items", response_model=OrderItemResponse)
def add_item(
    item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = crud.get_active_draft(db, current_user.id)
    if not draft:
        raise HTTPException(status_code=404, detail="No active draft order")
    try:
        return crud.add_item_to_order(db, draft.id, item_id, quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/draft/bundles/{bundle_id}", response_model=List[OrderItemResponse])
def add_bundle(
    bundle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = crud.get_active_draft(db, current_user.id)
    if not draft:
        raise HTTPException(status_code=404, detail="No active draft order")
    try:
        return crud.add_bundle_to_order(db, draft.id, bundle_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/draft/items/{order_item_id}", response_model=OrderItemResponse)
def update_item_quantity(
    order_item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return crud.update_order_item_quantity(db, order_item_id, quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/draft/items/{order_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item(
    order_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        crud.remove_item_from_order(db, order_item_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/draft/bundles/{bundle_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_bundle(
    bundle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = crud.get_active_draft(db, current_user.id)
    if not draft:
        raise HTTPException(status_code=404, detail="No active draft order")
    try:
        crud.remove_bundle_from_order(db, draft.id, bundle_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/draft/details", response_model=Order)
def update_draft_details(
    data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = crud.get_active_draft(db, current_user.id)
    if not draft:
        raise HTTPException(status_code=404, detail="No active draft order")
    try:
        return crud.update_order_details(
            db, draft.id,
            tail_number=data.tail_number,
            passenger_count=data.passenger_count,
            flight_date=data.flight_date,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/draft/confirm", response_model=Order)
def confirm_draft(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = crud.get_active_draft(db, current_user.id)
    if not draft:
        raise HTTPException(status_code=404, detail="No active draft order")
    try:
        return crud.confirm_order(db, draft.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── ORDER HISTORY ─────────────────────────────────────────────────────────────

@router.get("/", response_model=List[Order])
def my_orders(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_user_orders(db, current_user.id, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=Order)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = crud.get_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}/cancel", response_model=Order)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = crud.get_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        return crud.cancel_order(db, order_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
