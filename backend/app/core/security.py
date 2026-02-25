from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path

from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


#========= HASH PASSWORD LOGIC=========
#ΔΗΜΙΟΥΡΓΕΙ ΤΟ HASH ΕΝΟΣ PSWD
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

#ΕΛΕΓΧΕΙ ΑΝ ΕΝΑ PSWD ΥΠΑΡΧΕΙ ΜΕ HASH
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


#========= CREATE/DECODE JWT TOKEN LOGIC=========
#ΔΗΜΙΟΥΡΓΕΙ TOKEN ΓΙΑ ΕΝΑΝ ΧΡΗΣΤΗ
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

#ΞΕΚΛΕΙΔΩΝΕΙ ΤΟ TOKEN ΣΕ ΚΑΘΕ REQUEST ΚΑΙ ΕΛΕΓΧΕΙ ΑΝ ΕΧΕΙ ΛΗΞΕΙ
def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
