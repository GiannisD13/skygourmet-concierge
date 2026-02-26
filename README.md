# Website for vip jet catering service using top notch technologies.
The goal of this project was to build a production-ready API that handles complex business logic with high performance.
## Backend Architecture & Features
Technology Stack
Framework: FastAPI (Python 3.10+)

Database: PostgreSQL (Relational Data Modeling)

ORM: SQLAlchemy (Object-Relational Mapping)

Security: JWT (JSON Web Tokens) & Passlib (bcrypt)

Validation: Pydantic (Data Schemas & Type Hinting)

Frontend: React + Vite (Fully integrated via RESTful API)-built mostly with the help of ai tools

Implemented a stateless OAuth2 authentication flow using JWT.

# Relational Database Design
A structured PostgreSQL schema designed for consistency and speed:
Users & Profiles: Secure management of client data.
Menu & Bundles: Complex relationships between menu items and curated meal packages.
Order Management: Real-time tracking and relational mapping of user requests.

# Modular Router Pattern
The API is built with a clean, layered architecture for maintainability:
app/api/v1/: Versioned endpoints for Auth, Menu, and Orders.
app/crud/: Decoupled business logic from database operations.
app/models/: SQLAlchemy models for DB structure.
app/schemas/: Pydantic models for request/response validation.

 Running Locally Instructions                                                                                                                                                                                                                                                                                                          
  Prerequisites                                                                                                                                               

  - Node.js (v18+) & npm
  - Python 3.11+
  - PostgreSQL running on localhost:5432

  ---
  Backend

  # 1. Create and activate a virtual environment
  cd backend
  python -m venv venv

  # Windows
  venv\Scripts\activate
  # macOS/Linux
  source venv/bin/activate

  # 2. Install dependencies
  pip install -r requirements.txt

  # 3. Create the .env file (copy the example below and fill in your values)

  Create backend/.env:

  DATABASE_URL=postgresql+psycopg2://<user>:<password>@localhost:5432/sky_gourmet
  SECRET_KEY=your-long-random-secret-key
  ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=60

  # 4. Create the database tables
  python init_db.py

  # 5. Create the first admin user
  python create_admin.py

  # 6. Start the server
  python -m uvicorn app.main:app --reload

  API runs at http://127.0.0.1:8000 — Swagger UI at http://127.0.0.1:8000/docs

  ---
  Frontend

  # From the project root
  npm install
  npm run dev

  Frontend runs at http://localhost:8080

  ---
