from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import menu as models
from app.schemas import menu_schema as schemas
from typing import List, Optional

def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id, models.Item.is_active==True).first()

def search_item(db:Session, query:str, skip: int = 0, limit: int = 100):
    return db.query(models.Item).filter(
        models.Item.is_active==True,
        or_(models.Item.name.ilike(f"%{query}%"),
         models.Item.description.ilike(f"%{query}%")
        )
    ).offset(skip).limit(limit).all()
    

def get_allItems(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).filter(models.Item.is_active==True).offset(skip).limit(limit).all()

def get_items_by_category(db: Session, category: str, skip: int = 0, limit: int = 100):
    return db.query(models.Item).filter(
        models.Item.category == category,
        models.Item.is_active == True 
    ).offset(skip).limit(limit).all()

def create_item(db:Session, item:schemas.ItemCreate):
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item) # Παίρνουμε πίσω το ID που δημιουργήθηκε
    return db_item

def update_item(db: Session, item_id: int, item_data: schemas.ItemUpdate):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    
    if not db_item:
        return None
    update_data = item_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item

#SOFT DELETE
def delete_item(db: Session, item_id: int):
    
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    
    if db_item:
        db_item.is_active = False  
        db.commit()
        return True
    return False

def delete_item_perm(db: Session, item_id: int):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

 #---BUNDLES CRUD---

def get_bundle(db: Session, id: int):
    return db.query(models.Bundle).filter(models.Bundle.id == id, models.Bundle.is_active==True).first()

def get_all_bundles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Bundle).filter(models.Bundle.is_active==True).offset(skip).limit(limit).all()

def create_bundle(db:Session, bundle:schemas.BundleCreate):
    existing = db.query(models.Bundle).filter(models.Bundle.name==bundle.name).first()
    if existing:
        raise ValueError(f"Bundle '{bundle.name}' already exists")
    db_bundle = models.Bundle(
        name = bundle.name,
        description=bundle.description,
        price=bundle.price,
        photoUrl=bundle.photoUrl,
        is_active=bundle.is_active
    )
    db.add(db_bundle)
    db.flush()

    for item_in in bundle.items:
        item_exists = db.query(models.Item).filter(models.Item.id == item_in.item_id).first()
        if not item_exists:
            db.rollback()
            raise ValueError(f"Item with id {item_in.item_id} does not exist")
        
        db_bundle_item = models.BundleItem(
            bundle_id=db_bundle.id,
            item_id=item_in.item_id,
            def_quality=item_in.def_quality
        )
        db.add(db_bundle_item)
    
    db.commit()
    db.refresh(db_bundle)
    return db_bundle

def update_bundle(db:Session, bundle_id: int, bundle_data:schemas.BundleUpdate):
    db_bundle = db.query(models.Bundle).filter(models.Bundle.id == bundle_id).first()
    if not db_bundle:
        return None
    update_data = bundle_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_bundle, key, value)
    
    db.commit()
    db.refresh(db_bundle)
    return db_bundle

#SOFT DELETE
def delete_bundle(db: Session, bundle_id: int) -> bool:
    db_bundle = db.query(models.Bundle).filter(models.Bundle.id == bundle_id).first()
    
    if db_bundle:
        db_bundle.is_active = False
        db.commit()
        return True
    return False

# --- CRUD για Bundle Items (Προσθήκη/Αφαίρεση items από bundle) ---

def add_item_to_bundle(db: Session, bundle_id: int, item_id: int, def_quality: int = 1) -> models.BundleItem:
    """Add an item to an existing bundle"""
    bundle = db.query(models.Bundle).filter(models.Bundle.id == bundle_id).first()
    if not bundle:
        raise ValueError(f"Bundle {bundle_id} not found")
    
    # Check if item exists
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise ValueError(f"Item {item_id} not found")
    
    # Check if item already in bundle
    existing = db.query(models.BundleItem).filter(
        models.BundleItem.bundle_id == bundle_id,
        models.BundleItem.item_id == item_id
    ).first()
    if existing:
        raise ValueError(f"Item {item_id} already in bundle {bundle_id}")
    
    # Add item to bundle
    db_bundle_item = models.BundleItem(
        bundle_id=bundle_id,
        item_id=item_id,
        def_quality=def_quality
    )
    db.add(db_bundle_item)
    db.commit()
    db.refresh(db_bundle_item)
    return db_bundle_item

def remove_item_from_bundle(db: Session, bundle_id: int, item_id: int) -> bool:
    """Remove an item from a bundle"""
    db_bundle_item = db.query(models.BundleItem).filter(
        models.BundleItem.bundle_id == bundle_id,
        models.BundleItem.item_id == item_id
    ).first()
    
    if db_bundle_item:
        db.delete(db_bundle_item)
        db.commit()
        return True
    return False

def update_bundle_item_quantity(db: Session, bundle_id: int, item_id: int, new_quantity: int) -> Optional[models.BundleItem]:
    """Update the default quantity of an item in a bundle"""
    db_bundle_item = db.query(models.BundleItem).filter(
        models.BundleItem.bundle_id == bundle_id,
        models.BundleItem.item_id == item_id
    ).first()
    
    if not db_bundle_item:
        return None
    
    db_bundle_item.def_quality = new_quantity
    db.commit()
    db.refresh(db_bundle_item)
    return db_bundle_item

def get_bundle_items(db: Session, bundle_id: int) -> List[models.BundleItem]:
    """Get all items in a bundle with details"""
    return db.query(models.BundleItem).filter(
        models.BundleItem.bundle_id == bundle_id
    ).all()

def replace_bundle_items(db: Session, bundle_id: int, new_items: List[schemas.BundleItemCreate]) -> models.Bundle:
    """Replace all items in a bundle (useful for bulk updates)"""
    bundle = db.query(models.Bundle).filter(models.Bundle.id == bundle_id).first()
    if not bundle:
        raise ValueError(f"Bundle {bundle_id} not found")
    
    # Delete all existing bundle items
    db.query(models.BundleItem).filter(
        models.BundleItem.bundle_id == bundle_id
    ).delete()
    
    # Add new items
    for item_in in new_items:
        item_exists = db.query(models.Item).filter(models.Item.id == item_in.item_id).first()
        if not item_exists:
            db.rollback()
            raise ValueError(f"Item with id {item_in.item_id} does not exist")
        
        db_bundle_item = models.BundleItem(
            bundle_id=bundle_id,
            item_id=item_in.item_id,
            def_quality=item_in.def_quality
        )
        db.add(db_bundle_item)
    
    db.commit()
    db.refresh(bundle)
    return bundle