# Trello Clone Backend

SQLAlchemy + FastAPI backend for the Trello clone application.

## Default Login Credentials

\`\`\`
Email: admin@trello.com
Username: admin
Password: admin123
\`\`\`

## Project Structure

\`\`\`
backend/
├── models.py      # SQLAlchemy database models
├── domain.py      # Pydantic request/response schemas
├── config.py      # Configuration and environment variables
├── database.py    # Database connection and session management
├── app.py         # FastAPI application and API endpoints
├── seed.py        # Database seeding script
└── README.md      # This file
\`\`\`

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
pip install fastapi uvicorn sqlalchemy bcrypt pydantic[email]
\`\`\`

### 2. Initialize and Seed Database

\`\`\`bash
cd backend
python seed.py
\`\`\`

This will:
- Create all database tables
- Create a default admin user
- Create a sample board with lists and cards

### 3. Start the API Server

\`\`\`bash
python app.py
\`\`\`

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### 4. Start the Next.js Frontend

In a separate terminal:

\`\`\`bash
cd ..
npm install
npm run dev
\`\`\`

The frontend will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create board
- `GET /api/boards/{id}` - Get board details
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board

### Lists
- `GET /api/boards/{id}/lists` - Get board lists
- `POST /api/lists` - Create list
- `PUT /api/lists/{id}` - Update list
- `DELETE /api/lists/{id}` - Delete list

### Cards
- `POST /api/cards` - Create card
- `GET /api/cards/{id}` - Get card details
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card

### Comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/{id}` - Delete comment

### Members
- `GET /api/boards/{id}/members` - Get board members
- `POST /api/boards/{id}/members` - Add member
- `DELETE /api/boards/{id}/members/{member_id}` - Remove member

### Assignees
- `POST /api/cards/{id}/assignees` - Assign user to card
- `DELETE /api/cards/{id}/assignees/{assignee_id}` - Unassign user

## Environment Variables

Create a `.env` file in the backend directory (optional):

\`\`\`env
DATABASE_URL=sqlite:///./trello.db
SECRET_KEY=your-secret-key-here
\`\`\`

## Database

The application uses SQLite by default. The database file `trello.db` will be created in the `backend` directory.

To reset the database:

\`\`\`bash
rm trello.db
python seed.py
