from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_admin
from app.crud import airport as crud
from app.schemas.airport_schema import AirportCreate, AirportUpdate, AirportRead
from app.schemas.menu_schema import Item, Bundle

router = APIRouter()


# ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────────

@router.get("", response_model=List[AirportRead])
def list_airports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_airports(db, skip=skip, limit=limit)


@router.get("/{airport_id}", response_model=AirportRead)
def get_airport(airport_id: int, db: Session = Depends(get_db)):
    airport = crud.get_airport(db, airport_id)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    return airport


@router.get("/{airport_id}/items", response_model=List[Item])
def list_airport_items(airport_id: int, db: Session = Depends(get_db)):
    if not crud.get_airport(db, airport_id):
        raise HTTPException(status_code=404, detail="Airport not found")
    return crud.get_airport_items(db, airport_id)


@router.get("/{airport_id}/bundles", response_model=List[Bundle])
def list_airport_bundles(airport_id: int, db: Session = Depends(get_db)):
    if not crud.get_airport(db, airport_id):
        raise HTTPException(status_code=404, detail="Airport not found")
    return crud.get_airport_bundles(db, airport_id)


# ── ADMIN ENDPOINTS ───────────────────────────────────────────────────────────

@router.post("", response_model=AirportRead, dependencies=[Depends(require_admin)])
def create_airport(data: AirportCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_airport(db, data)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.patch("/{airport_id}", response_model=AirportRead, dependencies=[Depends(require_admin)])
def update_airport(airport_id: int, data: AirportUpdate, db: Session = Depends(get_db)):
    updated = crud.update_airport(db, airport_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Airport not found")
    return updated


@router.delete("/{airport_id}", dependencies=[Depends(require_admin)])
def delete_airport(airport_id: int, db: Session = Depends(get_db)):
    if not crud.delete_airport(db, airport_id):
        raise HTTPException(status_code=404, detail="Airport not found")
    return {"detail": "Airport deactivated"}


@router.post("/{airport_id}/items/{item_id}", dependencies=[Depends(require_admin)])
def assign_item(airport_id: int, item_id: int, db: Session = Depends(get_db)):
    try:
        crud.assign_item_to_airport(db, airport_id, item_id)
        return {"detail": "Item assigned to airport"}
    except ValueError as e:
        status_code = 409 if "already assigned" in str(e) else 404
        raise HTTPException(status_code=status_code, detail=str(e))


@router.delete("/{airport_id}/items/{item_id}", dependencies=[Depends(require_admin)])
def remove_item(airport_id: int, item_id: int, db: Session = Depends(get_db)):
    if not crud.remove_item_from_airport(db, airport_id, item_id):
        raise HTTPException(status_code=404, detail="Item not assigned to this airport")
    return {"detail": "Item removed from airport"}


@router.post("/{airport_id}/bundles/{bundle_id}", dependencies=[Depends(require_admin)])
def assign_bundle(airport_id: int, bundle_id: int, db: Session = Depends(get_db)):
    try:
        crud.assign_bundle_to_airport(db, airport_id, bundle_id)
        return {"detail": "Bundle assigned to airport"}
    except ValueError as e:
        status_code = 409 if "already assigned" in str(e) else 404
        raise HTTPException(status_code=status_code, detail=str(e))


@router.delete("/{airport_id}/bundles/{bundle_id}", dependencies=[Depends(require_admin)])
def remove_bundle(airport_id: int, bundle_id: int, db: Session = Depends(get_db)):
    if not crud.remove_bundle_from_airport(db, airport_id, bundle_id):
        raise HTTPException(status_code=404, detail="Bundle not assigned to this airport")
    return {"detail": "Bundle removed from airport"}
