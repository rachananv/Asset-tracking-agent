from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class Asset(BaseModel):
    id: str
    type: str
    brand: str
    model: str
    assigned_to: Optional[str] = None
    purchase_date: str
    status: str  # Active / Assigned / Damaged / Available

class AssetCreate(BaseModel):
    type: str
    brand: str
    model: str
    assigned_to: Optional[str] = None
    purchase_date: str
    status: str

class AssetUpdate(BaseModel):
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    assigned_to: Optional[str] = None
    purchase_date: Optional[str] = None
    status: Optional[str] = None

class Assignment(BaseModel):
    asset_id: str
    employee_id: str

class StatusUpdate(BaseModel):
    asset_id: str
    status: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
