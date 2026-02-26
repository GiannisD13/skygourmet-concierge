from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user, require_admin
from app.crud import user as crud
from app.models.user import User
from app.schemas.user_schema import User as UserSchema, UserUpdate

router = APIRouter()


# ── PROFILE (ο logged-in user βλέπει/αλλάζει τα δικά του) ────────────────────

@router.get("/me", response_model=UserSchema)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserSchema)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        updated = crud.update_user(db, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return updated


# ── ADMIN: διαχείριση όλων των users ─────────────────────────────────────────

@router.get("/", response_model=List[UserSchema], dependencies=[Depends(require_admin)])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_users(db, skip=skip, limit=limit)


@router.get("/admins", response_model=List[UserSchema], dependencies=[Depends(require_admin)])
def list_admins(db: Session = Depends(get_db)):
    return crud.get_admins(db)


@router.get("/{user_id}", response_model=UserSchema, dependencies=[Depends(require_admin)])
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/admin", response_model=UserSchema, dependencies=[Depends(require_admin)])
def set_admin(user_id: str, is_admin: bool, db: Session = Depends(get_db)):
    user = crud.set_admin(db, user_id, is_admin)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", dependencies=[Depends(require_admin)])
def delete_user(user_id: str, db: Session = Depends(get_db)):
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}
