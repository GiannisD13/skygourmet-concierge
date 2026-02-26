from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.user import User

# ===========
# DB SESSION
# ===========

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===========
# JWT AUTH
# ===========

#ΒΡΙΣΚΕΙ ΤΟ TOKEN ΣΤΟ REQUEST
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

#ΕΠΙΣΤΡΕΦΕΙ ΤΟΝ ΧΡΗΣΤΗ ΜΕΣΩ ΤΟΥ TOKEN AN ΠΑΕΙ ΚΑΛΑ ΤΟ DECODE ΑΛΛΙΩΣ ΠΕΤΑΕΙ EXCEPTION
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

#ΕΛΕΞΧΕΙ ΑΝ Ο ΧΡΗΣΤΗΣ ΕΙΝΑΙ ADMIN ΑΝ ΝΑΙ ΤΟΝ ΕΠΙΣΤΡΕΦΕΙ
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
