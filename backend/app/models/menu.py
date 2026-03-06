#Πίνακες Menu_Items, Bundles, Bundle_Items
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Item(Base):

    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    description = Column(String)
    photoUrl = Column(String)
    is_active = Column(Boolean, default=True)
    category = Column(String, index=True)

    #RELATIONSHIPS
    bundles_included = relationship("BundleItem", back_populates="item")
    airports = relationship("AirportItem", back_populates="item")

class BundleItem(Base):

    __tablename__ = "bundleitems"

    id = Column(Integer, primary_key=True, index=True)
    bundle_id = Column(Integer, ForeignKey("bundles.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    def_quality = Column(Integer, nullable=False, default=1)  # qty for 2 pax (legacy/default)
    qty_4  = Column(Integer, nullable=True)  # qty for 4 pax
    qty_6  = Column(Integer, nullable=True)  # qty for 6 pax
    qty_8  = Column(Integer, nullable=True)  # qty for 8 pax
    qty_10 = Column(Integer, nullable=True)  # qty for 10 pax

    #RELATIONSHIPS
    inbundle = relationship("Bundle", back_populates="items_in_bundle")
    item = relationship("Item", back_populates="bundles_included")

class Bundle(Base):

    __tablename__ = "bundles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description =  Column(String)
    price = Column(Float, nullable=False)  # price for 2 pax (legacy/default)
    price_4  = Column(Float, nullable=True)  # price for 4 pax
    price_6  = Column(Float, nullable=True)  # price for 6 pax
    price_8  = Column(Float, nullable=True)  # price for 8 pax
    price_10 = Column(Float, nullable=True)  # price for 10 pax
    is_active = Column(Boolean, default=True)
    photoUrl = Column(String)

    #RELATIONSHIPS
    items_in_bundle = relationship("BundleItem", back_populates="inbundle")
    airports = relationship("AirportBundle", back_populates="bundle")