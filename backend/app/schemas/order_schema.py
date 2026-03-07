# app/schemas/order.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.menu_schema import Item

# ============ ORDER ITEM SCHEMAS ============
class OrderItemBase(BaseModel):
    item_id: int
    quantity: int = Field(..., ge=1)
    unit_price: float = Field(..., gt=0)

class OrderItemCreate(BaseModel):
    item_id: int
    quantity: int = Field(..., ge=1)
    bundle_id: Optional[int] = None  # optional bundle association (for grouping)

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    bundle_id: Optional[int] = None
    item: Item  # nested item details

    class Config:
        from_attributes = True

class OrderItemResponse(BaseModel):
    """Response schema for order items"""
    id: int
    order_id: int
    item_id: int
    quantity: int
    unit_price: float
    bundle_id: Optional[int] = None  # ← NULL = standalone
    item: Item  # Nested item details
    
    class Config:
        from_attributes = True


# ============ ORDER SCHEMAS ============
class OrderBase(BaseModel):
    tail_number: str = Field(..., min_length=1, max_length=20)
    passenger_count: int = Field(..., ge=1, le=50)
    flight_date: datetime

class OrderCreateBase(BaseModel):
    """Base info for creating empty order"""
    tail_number: str
    passenger_count: int
    flight_date: datetime

class OrderCreate(BaseModel):
    tail_number: str = Field(..., min_length=1, max_length=20)
    passenger_count: int = Field(..., ge=1, le=50)
    flight_date: datetime
    bundles: List[int] = []
    custom_items: List[OrderItemCreate] = []


class CheckoutCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    tail_number: str = Field(..., min_length=1, max_length=20)
    passenger_count: int = Field(..., ge=1, le=50)
    flight_date: datetime
    bundles: List[int] = []
    custom_items: List[OrderItemCreate] = []


class OrderUpdate(BaseModel):
    tail_number: Optional[str] = Field(None, min_length=1, max_length=20)
    passenger_count: Optional[int] = Field(None, ge=1, le=50)
    flight_date: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(pending|confirmed|delivered|cancelled)$")

class Order(OrderBase):
    id: int
    user_id: str
    total_amount: float
    status: str
    created_at: datetime
    order_items: List[OrderItem] = []

    class Config:
        from_attributes = True