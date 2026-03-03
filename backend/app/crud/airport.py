from sqlalchemy.orm import Session
from typing import List

from app.models import airport as models
from app.models import menu as menu_models
from app.schemas.airport_schema import AirportCreate, AirportUpdate


# ── AIRPORT CRUD ──────────────────────────────────────────────────────────────

def get_airport(db: Session, airport_id: int):
    return db.query(models.Airport).filter(
        models.Airport.id == airport_id,
        models.Airport.is_active == True
    ).first()


def get_airport_by_code(db: Session, code: str):
    return db.query(models.Airport).filter(models.Airport.code == code).first()


def get_all_airports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Airport).filter(
        models.Airport.is_active == True
    ).offset(skip).limit(limit).all()


def create_airport(db: Session, data: AirportCreate):
    existing = get_airport_by_code(db, data.code)
    if existing:
        raise ValueError(f"Airport with code '{data.code}' already exists")
    db_airport = models.Airport(**data.model_dump())
    db.add(db_airport)
    db.commit()
    db.refresh(db_airport)
    return db_airport


def update_airport(db: Session, airport_id: int, data: AirportUpdate):
    db_airport = db.query(models.Airport).filter(models.Airport.id == airport_id).first()
    if not db_airport:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_airport, key, value)
    db.commit()
    db.refresh(db_airport)
    return db_airport


def delete_airport(db: Session, airport_id: int) -> bool:
    db_airport = db.query(models.Airport).filter(models.Airport.id == airport_id).first()
    if db_airport:
        db_airport.is_active = False
        db.commit()
        return True
    return False


# ── AIRPORT ITEMS ─────────────────────────────────────────────────────────────

def get_airport_items(db: Session, airport_id: int) -> List:
    airport_items = db.query(models.AirportItem).filter(
        models.AirportItem.airport_id == airport_id
    ).all()
    return [ai.item for ai in airport_items if ai.item and ai.item.is_active]


def assign_item_to_airport(db: Session, airport_id: int, item_id: int) -> models.AirportItem:
    airport = get_airport(db, airport_id)
    if not airport:
        raise ValueError(f"Airport {airport_id} not found")

    item = db.query(menu_models.Item).filter(
        menu_models.Item.id == item_id,
        menu_models.Item.is_active == True
    ).first()
    if not item:
        raise ValueError(f"Item {item_id} not found or inactive")

    existing = db.query(models.AirportItem).filter(
        models.AirportItem.airport_id == airport_id,
        models.AirportItem.item_id == item_id
    ).first()
    if existing:
        raise ValueError(f"Item {item_id} already assigned to airport {airport_id}")

    db_ai = models.AirportItem(airport_id=airport_id, item_id=item_id)
    db.add(db_ai)
    db.commit()
    db.refresh(db_ai)
    return db_ai


def remove_item_from_airport(db: Session, airport_id: int, item_id: int) -> bool:
    db_ai = db.query(models.AirportItem).filter(
        models.AirportItem.airport_id == airport_id,
        models.AirportItem.item_id == item_id
    ).first()
    if db_ai:
        db.delete(db_ai)
        db.commit()
        return True
    return False


# ── AIRPORT BUNDLES ───────────────────────────────────────────────────────────

def get_airport_bundles(db: Session, airport_id: int) -> List:
    airport_bundles = db.query(models.AirportBundle).filter(
        models.AirportBundle.airport_id == airport_id
    ).all()
    return [ab.bundle for ab in airport_bundles if ab.bundle and ab.bundle.is_active]


def assign_bundle_to_airport(db: Session, airport_id: int, bundle_id: int) -> models.AirportBundle:
    airport = get_airport(db, airport_id)
    if not airport:
        raise ValueError(f"Airport {airport_id} not found")

    bundle = db.query(menu_models.Bundle).filter(
        menu_models.Bundle.id == bundle_id,
        menu_models.Bundle.is_active == True
    ).first()
    if not bundle:
        raise ValueError(f"Bundle {bundle_id} not found or inactive")

    existing = db.query(models.AirportBundle).filter(
        models.AirportBundle.airport_id == airport_id,
        models.AirportBundle.bundle_id == bundle_id
    ).first()
    if existing:
        raise ValueError(f"Bundle {bundle_id} already assigned to airport {airport_id}")

    db_ab = models.AirportBundle(airport_id=airport_id, bundle_id=bundle_id)
    db.add(db_ab)
    db.commit()
    db.refresh(db_ab)
    return db_ab


def remove_bundle_from_airport(db: Session, airport_id: int, bundle_id: int) -> bool:
    db_ab = db.query(models.AirportBundle).filter(
        models.AirportBundle.airport_id == airport_id,
        models.AirportBundle.bundle_id == bundle_id
    ).first()
    if db_ab:
        db.delete(db_ab)
        db.commit()
        return True
    return False
