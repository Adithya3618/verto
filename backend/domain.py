from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Request models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class BoardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    background_color: Optional[str] = "#0079bf"

class BoardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    background_color: Optional[str] = None

class ListCreate(BaseModel):
    board_id: int
    title: str
    position: int

class ListUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[int] = None

class CardCreate(BaseModel):
    list_id: int
    title: str
    position: int
    description: Optional[str] = None

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    list_id: Optional[int] = None
    due_date: Optional[datetime] = None

class CommentCreate(BaseModel):
    card_id: int
    content: str

class InviteCreate(BaseModel):
    board_id: int
    email: EmailStr

class AssigneeCreate(BaseModel):
    user_id: int

# Response models
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
