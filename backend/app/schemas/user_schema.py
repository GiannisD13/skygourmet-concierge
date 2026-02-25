from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# Base
class UserBase(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr

# NO ID NO CREATED AT
class UserCreate(UserBase):
    pass

# ALL OPTIONAL
class UserUpdate(BaseModel):
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None

# EVERYTHING(FOR RESPONSES)
class User(UserBase):
    id: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True  # για SQLAlchemy compatibility