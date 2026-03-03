from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

from app.schemas.menu_schema import Item, Bundle


class AirportBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=10)
    city: str = Field(..., min_length=1, max_length=200)
    is_active: bool = True


class AirportCreate(AirportBase):
    pass


class AirportUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    code: Optional[str] = Field(None, min_length=1, max_length=10)
    city: Optional[str] = Field(None, min_length=1, max_length=200)
    is_active: Optional[bool] = None


# Intermediate schemas that match the ORM relationship structure
class AirportItemRead(BaseModel):
    id: int
    item: Item

    model_config = ConfigDict(from_attributes=True)


class AirportBundleRead(BaseModel):
    id: int
    bundle: Bundle

    model_config = ConfigDict(from_attributes=True)


class AirportRead(AirportBase):
    id: int
    airport_items: List[AirportItemRead] = []
    airport_bundles: List[AirportBundleRead] = []

    model_config = ConfigDict(from_attributes=True)
