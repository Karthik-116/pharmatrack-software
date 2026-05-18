from pydantic import BaseModel
from typing import List, Optional

class GenerateBatchRequest(BaseModel):
    product_id: str
    strip_count: int = 4

class GenerateBatchResponse(BaseModel):
    box_uuid: str
    strip_uuids: List[str]

class ScanTransitRequest(BaseModel):
    item_uuid: str
    scanned_by: str
    location: str

class VerifyRequest(BaseModel):
    item_uuid: str
    scanned_by: str
    location: str

class ChatRequest(BaseModel):
    product_id: str
    query: str

class ChatResponse(BaseModel):
    answer: str

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    email: str
