import os
from pathlib import Path

# Database configuration
BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/trello.db")

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:7500",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

# Default user credentials
DEFAULT_USER_EMAIL = "admin@trello.com"
DEFAULT_USER_USERNAME = "admin"
DEFAULT_USER_PASSWORD = "admin123"
DEFAULT_USER_FULLNAME = "Admin User"
