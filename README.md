# Trello Clone

A full-featured Trello-like kanban board application built with Next.js and Python FastAPI with SQLAlchemy.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, SQLAlchemy
- **Database**: SQLite

## Getting Started

### 1. Install Python Dependencies

\`\`\`bash
pip install fastapi uvicorn sqlalchemy bcrypt pydantic[email]
\`\`\`

### 2. Initialize the Database

\`\`\`bash
python scripts/database.py
\`\`\`

This will create a `trello.db` SQLite database file with all the necessary tables.

### 3. Start the Python API Server

\`\`\`bash
python scripts/api_server.py
\`\`\`

The API server will run on `http://localhost:8000`

### 4. Start the Next.js Development Server

In a separate terminal:

\`\`\`bash
npm install
npm run dev
\`\`\`

The frontend will run on `http://localhost:3000`

## Environment Variables

Create a `.env.local` file:

\`\`\`
PYTHON_API_URL=http://localhost:8000/api
\`\`\`

## Features

- User authentication (signup/login)
- Create and manage boards
- Create lists within boards
- Create and manage cards
- Drag and drop cards between lists
- Card details with descriptions and due dates
- Comments on cards
- Assign members to cards
- Invite members to boards
- Role-based permissions (owner/member)

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities and API client
├── scripts/
│   ├── database.py        # SQLAlchemy models and database setup
│   └── api_server.py      # FastAPI backend server
└── trello.db              # SQLite database (created after init)
