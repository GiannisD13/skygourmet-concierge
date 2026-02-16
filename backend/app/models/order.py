#ORDER/ORDER_ITEMS TABLES
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime
import uuid

class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    tail_number = Column(String, nullable=False)
    passenger_count = Column(Integer, default=1)
    flight_date = Column(DateTime)
    total_amount = Column(Float, default=0.0)
    status = Column(String, default="pending")  # pending, confirmed, delivered, cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    #RELATIONSHIPS
    owner = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):

    __tablename__ = "orderitems"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    #RELATIONSHIPS
    order = relationship("Order", back_populates="order_items")
    item = relationship("Item")