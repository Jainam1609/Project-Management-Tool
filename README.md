# Project Management System

A multi-tenant project management system with Django (GraphQL) backend and React (TypeScript) frontend.

## Features

- ✅ Multi-tenant architecture (organization-based data isolation)
- ✅ Project management with status tracking
- ✅ Task management feature
- ✅ Task comments and collaboration
- ✅ Project statistics and analytics
- ✅ GraphQL API with type-safe queries
- ✅ Modern React UI with TypeScript
- ✅ Responsive design with TailwindCSS

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL (installed locally)

### Step 1: Setup Database

```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Windows: Download from postgresql.org
# Linux: sudo apt-get install postgresql

# Start PostgreSQL service
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres
CREATE DATABASE project_manager;
\q
```

### Step 2: Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp env.example .env

# Run migrations
python manage.py migrate

# Create admin user (optional)
python manage.py create_admin

# Load sample data (optional)
python manage.py load_sample_data

# Start server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`
GraphQL Playground: `http://localhost:8000/graphql/`

### Step 3: Setup Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start server
npm start
```

Frontend runs at: `http://localhost:3000`

## Default Credentials

**Django Admin:**
- URL: http://localhost:8000/admin/
- Username: `admin`
- Password: `admin123`

To create admin user: `python manage.py create_admin`

## Sample Data

The application comes with sample data:
- **3 Organizations**: Acme Corporation, Tech Startup Inc, Creative Design Agency
- **5 Projects**: Website Redesign, Mobile App Development, etc.
- **11 Tasks**: Various statuses (TODO, IN_PROGRESS, DONE)
- **5 Comments**: On various tasks

To load sample data: `python manage.py load_sample_data`

## Usage

1. **Select an Organization** from the dropdown in the frontend

2. **Use the Frontend**:
   - Select organization from dropdown
   - Create projects
   - Add tasks
   - Add comments

## Project Structure

```
backend/          # Django backend
  core/           # Main app (models, GraphQL schema)
frontend/         # React frontend
  src/
    components/   # React components
    graphql/      # GraphQL queries & mutations
```

## Troubleshooting

**Django Import Error**: Activate virtual environment first
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
```

**Database Connection Error**: Ensure PostgreSQL is running
```bash
psql -U postgres -c "SELECT 1;"
```

**CORS Errors**: Ensure backend runs on port 8000 and frontend on 3000

## Tech Stack

- Backend: Django 4.2.7, Graphene-Django, PostgreSQL
- Frontend: React 18, TypeScript, Apollo Client, TailwindCSS

## Documentation

For detailed architecture, implementation details, and application flow, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

This document explains:
- **PostgreSQL**: Database layer and data models
- **Django**: Backend framework and structure
- **GraphQL**: API layer, queries, and mutations
- **React**: Frontend components and state management
- **Application Flow**: Complete user journey and data flow with code examples
- **Multi-Tenancy**: How data isolation works
- **File Locations**: Where each component is implemented

