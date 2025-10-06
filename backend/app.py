from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import List
import bcrypt
import secrets
from datetime import datetime

from database import get_db, init_db
from models import (
    User, Board, BoardMember, List as DBList, Card, 
    Comment, Invite, CardAssignee, RoleEnum, InviteStatusEnum
)
from domain import (
    UserCreate, UserLogin, BoardCreate, BoardUpdate,
    ListCreate, ListUpdate, CardCreate, CardUpdate,
    CommentCreate, InviteCreate, AssigneeCreate,
    UserResponse, AuthResponse
)
from config import ALLOWED_ORIGINS

app = FastAPI(title="Trello Clone API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat()
    }

# Mock authentication - returns first user
def get_current_user(db: Session = Depends(get_db)) -> User:
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# Health check
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Trello Clone API is running"}

# Auth endpoints
@app.post("/api/auth/signup", response_model=AuthResponse)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"user": serialize_user(user), "token": f"token_{user.id}"}

@app.post("/api/auth/login", response_model=AuthResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"user": serialize_user(user), "token": f"token_{user.id}"}

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)

# Board endpoints
@app.get("/api/boards")
def get_boards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    boards = db.query(Board).filter(Board.owner_id == current_user.id).all()
    return [{"id": b.id, "title": b.title, "description": b.description, 
             "background_color": b.background_color, "owner_id": b.owner_id,
             "created_at": b.created_at.isoformat(), "updated_at": b.updated_at.isoformat()} 
            for b in boards]

@app.post("/api/boards")
def create_board(board_data: BoardCreate, db: Session = Depends(get_db), 
                current_user: User = Depends(get_current_user)):
    board = Board(**board_data.dict(), owner_id=current_user.id)
    db.add(board)
    db.commit()
    db.refresh(board)
    
    # Add owner as member
    member = BoardMember(board_id=board.id, user_id=current_user.id, role=RoleEnum.owner)
    db.add(member)
    db.commit()
    
    return {"id": board.id, "title": board.title, "description": board.description,
            "background_color": board.background_color, "owner_id": board.owner_id,
            "created_at": board.created_at.isoformat(), "updated_at": board.updated_at.isoformat()}

@app.get("/api/boards/{board_id}")
def get_board(board_id: int, db: Session = Depends(get_db)):
    board = db.query(Board).options(
        joinedload(Board.members).joinedload(BoardMember.user)
    ).filter(Board.id == board_id).first()
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    return {
        "id": board.id,
        "title": board.title,
        "description": board.description,
        "background_color": board.background_color,
        "owner_id": board.owner_id,
        "created_at": board.created_at.isoformat(),
        "updated_at": board.updated_at.isoformat(),
        "members": [{"id": m.id, "board_id": m.board_id, "user_id": m.user_id, 
                     "role": m.role.value, "joined_at": m.joined_at.isoformat(),
                     "user": serialize_user(m.user)} for m in board.members]
    }

@app.put("/api/boards/{board_id}")
def update_board(board_id: int, updates: BoardUpdate, db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(board, key, value)
    
    db.commit()
    db.refresh(board)
    return {"id": board.id, "title": board.title, "description": board.description,
            "background_color": board.background_color, "owner_id": board.owner_id,
            "created_at": board.created_at.isoformat(), "updated_at": board.updated_at.isoformat()}

@app.delete("/api/boards/{board_id}")
def delete_board(board_id: int, db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db.delete(board)
    db.commit()
    return {"message": "Board deleted"}

# List endpoints
@app.get("/api/boards/{board_id}/lists")
def get_lists(board_id: int, db: Session = Depends(get_db)):
    lists = db.query(DBList).options(
        joinedload(DBList.cards)
    ).filter(DBList.board_id == board_id).order_by(DBList.position).all()
    
    return [{
        "id": l.id,
        "board_id": l.board_id,
        "title": l.title,
        "position": l.position,
        "created_at": l.created_at.isoformat(),
        "updated_at": l.updated_at.isoformat(),
        "cards": [{"id": c.id, "list_id": c.list_id, "title": c.title, "description": c.description,
                   "position": c.position, "due_date": c.due_date.isoformat() if c.due_date else None,
                   "created_at": c.created_at.isoformat(), "updated_at": c.updated_at.isoformat()} 
                  for c in sorted(l.cards, key=lambda x: x.position)]
    } for l in lists]

@app.post("/api/lists")
def create_list(list_data: ListCreate, db: Session = Depends(get_db)):
    new_list = DBList(**list_data.dict())
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return {"id": new_list.id, "board_id": new_list.board_id, "title": new_list.title,
            "position": new_list.position, "created_at": new_list.created_at.isoformat(),
            "updated_at": new_list.updated_at.isoformat()}

@app.put("/api/lists/{list_id}")
def update_list(list_id: int, updates: ListUpdate, db: Session = Depends(get_db)):
    list_obj = db.query(DBList).filter(DBList.id == list_id).first()
    if not list_obj:
        raise HTTPException(status_code=404, detail="List not found")
    
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(list_obj, key, value)
    
    db.commit()
    db.refresh(list_obj)
    return {"id": list_obj.id, "board_id": list_obj.board_id, "title": list_obj.title,
            "position": list_obj.position, "created_at": list_obj.created_at.isoformat(),
            "updated_at": list_obj.updated_at.isoformat()}

@app.delete("/api/lists/{list_id}")
def delete_list(list_id: int, db: Session = Depends(get_db)):
    list_obj = db.query(DBList).filter(DBList.id == list_id).first()
    if not list_obj:
        raise HTTPException(status_code=404, detail="List not found")
    db.delete(list_obj)
    db.commit()
    return {"message": "List deleted"}

# Card endpoints
@app.post("/api/cards")
def create_card(card_data: CardCreate, db: Session = Depends(get_db)):
    card = Card(**card_data.dict())
    db.add(card)
    db.commit()
    db.refresh(card)
    return {"id": card.id, "list_id": card.list_id, "title": card.title, "description": card.description,
            "position": card.position, "due_date": card.due_date.isoformat() if card.due_date else None,
            "created_at": card.created_at.isoformat(), "updated_at": card.updated_at.isoformat()}

@app.get("/api/cards/{card_id}")
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).options(
        joinedload(Card.assignees).joinedload(CardAssignee.user),
        joinedload(Card.comments).joinedload(Comment.user)
    ).filter(Card.id == card_id).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return {
        "id": card.id,
        "list_id": card.list_id,
        "title": card.title,
        "description": card.description,
        "position": card.position,
        "due_date": card.due_date.isoformat() if card.due_date else None,
        "created_at": card.created_at.isoformat(),
        "updated_at": card.updated_at.isoformat(),
        "assignees": [{"id": a.id, "card_id": a.card_id, "user_id": a.user_id,
                       "assigned_at": a.assigned_at.isoformat(), "user": serialize_user(a.user)} 
                      for a in card.assignees],
        "comments": [{"id": c.id, "card_id": c.card_id, "user_id": c.user_id, "content": c.content,
                      "created_at": c.created_at.isoformat(), "updated_at": c.updated_at.isoformat(),
                      "user": serialize_user(c.user)} for c in card.comments]
    }

@app.put("/api/cards/{card_id}")
def update_card(card_id: int, updates: CardUpdate, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(card, key, value)
    
    db.commit()
    db.refresh(card)
    return {"id": card.id, "list_id": card.list_id, "title": card.title, "description": card.description,
            "position": card.position, "due_date": card.due_date.isoformat() if card.due_date else None,
            "created_at": card.created_at.isoformat(), "updated_at": card.updated_at.isoformat()}

@app.delete("/api/cards/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()
    return {"message": "Card deleted"}

# Comment endpoints
@app.post("/api/comments")
def create_comment(comment_data: CommentCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    comment = Comment(**comment_data.dict(), user_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return {"id": comment.id, "card_id": comment.card_id, "user_id": comment.user_id,
            "content": comment.content, "created_at": comment.created_at.isoformat(),
            "updated_at": comment.updated_at.isoformat(), "user": serialize_user(current_user)}

@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}

# Board members endpoints
@app.get("/api/boards/{board_id}/members")
def get_board_members(board_id: int, db: Session = Depends(get_db)):
    members = db.query(BoardMember).options(
        joinedload(BoardMember.user)
    ).filter(BoardMember.board_id == board_id).all()
    
    return [{"id": m.id, "board_id": m.board_id, "user_id": m.user_id, "role": m.role.value,
             "joined_at": m.joined_at.isoformat(), "user": serialize_user(m.user)} for m in members]

@app.post("/api/boards/{board_id}/members")
def add_board_member(board_id: int, data: dict, db: Session = Depends(get_db)):
    member = BoardMember(board_id=board_id, user_id=data["user_id"], role=RoleEnum.member)
    db.add(member)
    db.commit()
    db.refresh(member)
    return {"id": member.id, "board_id": member.board_id, "user_id": member.user_id,
            "role": member.role.value, "joined_at": member.joined_at.isoformat()}

@app.delete("/api/boards/{board_id}/members/{member_id}")
def remove_board_member(board_id: int, member_id: int, db: Session = Depends(get_db)):
    member = db.query(BoardMember).filter(
        BoardMember.id == member_id, 
        BoardMember.board_id == board_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member removed"}

# Card assignee endpoints
@app.post("/api/cards/{card_id}/assignees")
def assign_card(card_id: int, data: AssigneeCreate, db: Session = Depends(get_db)):
    assignee = CardAssignee(card_id=card_id, user_id=data.user_id)
    db.add(assignee)
    db.commit()
    db.refresh(assignee)
    return {"id": assignee.id, "card_id": assignee.card_id, "user_id": assignee.user_id,
            "assigned_at": assignee.assigned_at.isoformat()}

@app.delete("/api/cards/{card_id}/assignees/{assignee_id}")
def unassign_card(card_id: int, assignee_id: int, db: Session = Depends(get_db)):
    assignee = db.query(CardAssignee).filter(
        CardAssignee.id == assignee_id,
        CardAssignee.card_id == card_id
    ).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    db.delete(assignee)
    db.commit()
    return {"message": "Assignee removed"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Trello Clone API server...")
    print("API will be available at: http://localhost:8000")
    print("API docs available at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
