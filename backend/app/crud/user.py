from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import user as users
from app.schemas import user_schema as schemas
from typing import List, Optional, Tuple

def get_user(db:Session, user_id:str):
   return db.query(users.User).filter(users.User.id == user_id).first()

def get_user_by_phone(db:Session, phone:str):
    return db.query(users.User).filter(users.User.phone == phone).first()

def get_user_by_email(db: Session, email: str) -> Optional[users.User]:
    return db.query(users.User).filter(users.User.email == email).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[users.User]:
    return db.query(users.User).offset(skip).limit(limit).all()

def create_user(db:Session, newuser:schemas.UserCreate):
    existing_phone = get_user_by_phone(db, newuser.phone)
    if existing_phone:
        raise ValueError(f"User with phone '{newuser.phone}' already exists")
    
    # Check if email already exists
    existing_email = get_user_by_email(db, newuser.email)
    if existing_email:
        raise ValueError(f"User with email '{newuser.email}' already exists")
    db_user = users.User(
        **newuser.model_dump()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db:Session, uid:str, user_data:schemas.UserUpdate):
    db_user =  db.query(users.User).filter(users.User.id == uid).first()

    if not db_user:
        return None
    update_data = user_data.model_dump(exclude_unset=True)
    if "phone" in update_data:
        existing = get_user_by_phone(db, update_data["phone"])
        if existing and existing.id != uid:
            raise ValueError(f"Phone '{update_data['phone']}' already in use")
    
    if "email" in update_data:
        existing = get_user_by_email(db, update_data["email"])
        if existing and existing.id != uid:
            raise ValueError(f"Email '{update_data['email']}' already in use")
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: str) -> bool:
    db_user = db.query(users.User).filter(users.User.id == user_id).first()

    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


def get_admins(db: Session) -> List[users.User]:
    return db.query(users.User).filter(users.User.is_admin == True).all()

def set_admin(db: Session, user_id: str, is_admin: bool) -> Optional[users.User]:
    db_user = db.query(users.User).filter(users.User.id == user_id).first()
    if not db_user:
        return None
    db_user.is_admin = is_admin
    db.commit()
    db.refresh(db_user)
    return db_user

def find_or_create_user(
    db: Session, phone: str, email: str, full_name: str
) -> Tuple[users.User, bool]:
    user = db.query(users.User).filter(
        or_(users.User.phone == phone, users.User.email == email)
    ).first()
    if user:
        return user, False

    db_user = users.User(phone=phone, email=email, full_name=full_name)
    db.add(db_user)
    db.flush()
    return db_user, True