from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Airport(Base):
    __tablename__ = "airports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    city = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    #RELATIONSHIPS
    airport_items = relationship("AirportItem", back_populates="airport", cascade="all, delete-orphan")
    airport_bundles = relationship("AirportBundle", back_populates="airport", cascade="all, delete-orphan")

class AirportItem(Base):
    __tablename__ = "airport_items"

    id = Column(Integer, primary_key=True, index=True)
    airport_id = Column(Integer, ForeignKey="airports.id", nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)

    #RELATIONSHIPS
    airport = relationship("Airport", back_populates="airport_items")
    item = relationship("Item", back_populates="airports")

class AirportBundle(Base):
     __tablename__ = "airport_bundles"
     id = Column(Integer, primary_key=True, index=True)
     airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
     bundle_id = Column(Integer, ForeignKey("bundles.id"), nullable=False)
     airport = relationship("Airport", back_populates="airport_bundles")
     bundle = relationship("Bundle", back_populates="airports")