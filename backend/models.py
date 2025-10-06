from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum

Base = declarative_base()

# Enums
class RoleEnum(enum.Enum):
    owner = "owner"
    member = "member"

class InviteStatusEnum(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    expired = "expired"

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owned_boards = relationship("Board", back_populates="owner", foreign_keys="Board.owner_id")
    board_memberships = relationship("BoardMember", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    card_assignments = relationship("CardAssignee", back_populates="user")

class Board(Base):
    __tablename__ = "boards"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    background_color = Column(String, default="#0079bf")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="owned_boards", foreign_keys=[owner_id])
    members = relationship("BoardMember", back_populates="board", cascade="all, delete-orphan")
    lists = relationship("List", back_populates="board", cascade="all, delete-orphan")
    invites = relationship("Invite", back_populates="board", cascade="all, delete-orphan")

class BoardMember(Base):
    __tablename__ = "board_members"
    
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.member)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    board = relationship("Board", back_populates="members")
    user = relationship("User", back_populates="board_memberships")

class List(Base):
    __tablename__ = "lists"
    
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    title = Column(String, nullable=False)
    position = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("lists.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    list = relationship("List", back_populates="cards")
    assignees = relationship("CardAssignee", back_populates="card", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="card", cascade="all, delete-orphan")

class CardAssignee(Base):
    __tablename__ = "card_assignees"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    card = relationship("Card", back_populates="assignees")
    user = relationship("User", back_populates="card_assignments")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    card = relationship("Card", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Invite(Base):
    __tablename__ = "invites"
    
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(InviteStatusEnum), default=InviteStatusEnum.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))
    
    # Relationships
    board = relationship("Board", back_populates="invites")
