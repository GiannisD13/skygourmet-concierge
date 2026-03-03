from pydantic import BaseModel, Field
from typing import Optional, List
from models import Item, Bundle


class AirportBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=10)
    city: str = Field(..., min_length=1, max_length=200)
    is_active : bool = True

class AirportCreate(AirportBase):
    pass

class AirportUpdate(BaseModel):
    name: Optional[str] = Field(..., min_length=1, max_length=200)
    code: Optional[str] = Field(..., min_length=1, max_length=10)
    city: Optional[str] = Field(..., min_length=1, max_length=200)
    is_active : Optional[bool] = True

class AirportRead(AirportBase):
    id : int 

    items: List[Item]
    bundles: List[Bundle]