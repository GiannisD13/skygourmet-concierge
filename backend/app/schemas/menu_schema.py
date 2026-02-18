
from pydantic import BaseModel, Field
from typing import Optional, List

# ============ ITEM SCHEMAS ============
class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., gt=0)
    description: Optional[str] = None
    photoUrl: Optional[str] = None
    category: str 
    is_active: bool = True

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    photoUrl: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True


# ============ BUNDLE ITEM SCHEMAS ============
class BundleItemBase(BaseModel):
    item_id: int
    def_quality: int = Field(default=1, ge=1)  

class BundleItemCreate(BundleItemBase):
    pass

class BundleItem(BundleItemBase):
    id: int
    bundle_id: int
    item: Item  # nested item info

    class Config:
        from_attributes = True

class BundleItemAdd(BaseModel):
    item_id: int
    def_quality: int = Field(default=1, ge=1)
    
class BundleItemQuantityUpdate(BaseModel):
    def_quality: int = Field(..., ge=1)


# ============ BUNDLE SCHEMAS ============
class BundleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    photoUrl: Optional[str] = None
    is_active: bool = True

class BundleCreate(BundleBase):
    items: List[BundleItemCreate] = []  # τα items που περιλαμβάνει

class BundleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    photoUrl: Optional[str] = None
    is_active: Optional[bool] = None

class Bundle(BundleBase):
    id: int
    items_in_bundle: List[BundleItem] = []  # με nested items

    class Config:
        from_attributes = True