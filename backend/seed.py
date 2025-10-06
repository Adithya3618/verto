"""Seed the database with default user and sample data"""
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import User, Board, BoardMember, List as DBList, Card, RoleEnum
from config import DEFAULT_USER_EMAIL, DEFAULT_USER_USERNAME, DEFAULT_USER_PASSWORD, DEFAULT_USER_FULLNAME
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def seed_database():
    # Initialize database
    init_db()
    
    db: Session = SessionLocal()
    
    try:
        # Check if default user exists
        existing_user = db.query(User).filter(User.email == DEFAULT_USER_EMAIL).first()
        if existing_user:
            print(f"✓ Default user already exists: {DEFAULT_USER_EMAIL}")
            return
        
        # Create default user
        default_user = User(
            email=DEFAULT_USER_EMAIL,
            username=DEFAULT_USER_USERNAME,
            password_hash=hash_password(DEFAULT_USER_PASSWORD),
            full_name=DEFAULT_USER_FULLNAME
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        
        print(f"✓ Created default user:")
        print(f"  Email: {DEFAULT_USER_EMAIL}")
        print(f"  Username: {DEFAULT_USER_USERNAME}")
        print(f"  Password: {DEFAULT_USER_PASSWORD}")
        
        # Create sample board
        sample_board = Board(
            title="Welcome Board",
            description="Your first board to get started",
            background_color="#0079bf",
            owner_id=default_user.id
        )
        db.add(sample_board)
        db.commit()
        db.refresh(sample_board)
        
        # Add user as board member
        board_member = BoardMember(
            board_id=sample_board.id,
            user_id=default_user.id,
            role=RoleEnum.owner
        )
        db.add(board_member)
        
        # Create sample lists
        todo_list = DBList(
            board_id=sample_board.id,
            title="To Do",
            position=0
        )
        doing_list = DBList(
            board_id=sample_board.id,
            title="In Progress",
            position=1
        )
        done_list = DBList(
            board_id=sample_board.id,
            title="Done",
            position=2
        )
        
        db.add_all([todo_list, doing_list, done_list])
        db.commit()
        db.refresh(todo_list)
        db.refresh(doing_list)
        db.refresh(done_list)
        
        # Create sample cards
        card1 = Card(
            list_id=todo_list.id,
            title="Welcome to your Trello clone!",
            description="This is a sample card. Click to edit or delete it.",
            position=0
        )
        card2 = Card(
            list_id=todo_list.id,
            title="Create your first board",
            description="Click the 'Create Board' button to start organizing your tasks.",
            position=1
        )
        card3 = Card(
            list_id=doing_list.id,
            title="Explore the features",
            description="Try dragging cards, adding comments, and inviting team members.",
            position=0
        )
        
        db.add_all([card1, card2, card3])
        db.commit()
        
        print(f"✓ Created sample board: {sample_board.title}")
        print(f"✓ Created 3 lists and 3 sample cards")
        print("\n🎉 Database seeded successfully!")
        
    except Exception as e:
        print(f"✗ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
