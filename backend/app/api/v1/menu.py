from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_admin
from app.crud import menu as crud
from app.schemas.menu_schema import Item, ItemCreate, ItemUpdate, Bundle, BundleCreate, BundleUpdate

router = APIRouter()


# ── ITEMS (public read, admin write) ──────────────────────────────────────────

@router.get("/items", response_model=List[Item])
def list_items(
    skip: int = 0,
    limit: int = 100,
    category: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
):
    if search:
        return crud.search_item(db, search, skip=skip, limit=limit)
    if category:
        return crud.get_items_by_category(db, category, skip=skip, limit=limit)
    return crud.get_allItems(db, skip=skip, limit=limit)


@router.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/items", response_model=Item, dependencies=[Depends(require_admin)])
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db, item)


@router.patch("/items/{item_id}", response_model=Item, dependencies=[Depends(require_admin)])
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    updated = crud.update_item(db, item_id, item)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated


@router.delete("/items/{item_id}", dependencies=[Depends(require_admin)])
def delete_item(item_id: int, db: Session = Depends(get_db)):
    if not crud.delete_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"detail": "Item deactivated"}


# ── BUNDLES (public read, admin write) ────────────────────────────────────────

@router.get("/bundles", response_model=List[Bundle])
def list_bundles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_bundles(db, skip=skip, limit=limit)


@router.get("/bundles/{bundle_id}", response_model=Bundle)
def get_bundle(bundle_id: int, db: Session = Depends(get_db)):
    bundle = crud.get_bundle(db, bundle_id)
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return bundle


@router.post("/bundles", response_model=Bundle, dependencies=[Depends(require_admin)])
def create_bundle(bundle: BundleCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_bundle(db, bundle)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/bundles/{bundle_id}", response_model=Bundle, dependencies=[Depends(require_admin)])
def update_bundle(bundle_id: int, bundle: BundleUpdate, db: Session = Depends(get_db)):
    updated = crud.update_bundle(db, bundle_id, bundle)
    if not updated:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return updated


@router.delete("/bundles/{bundle_id}", dependencies=[Depends(require_admin)])
def delete_bundle(bundle_id: int, db: Session = Depends(get_db)):
    if not crud.delete_bundle(db, bundle_id):
        raise HTTPException(status_code=404, detail="Bundle not found")
    return {"detail": "Bundle deactivated"}
