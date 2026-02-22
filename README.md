# Customer Onboarding Workflow MVP

**Candidate:** Charan Katkam  
**Company:** Neximprove Pvt. Ltd.  
**Role:** Full-Stack Developer Intern

---

## Overview

A full-stack Customer Onboarding Workflow MVP for customs brokers to register, authenticate, and onboard exporter/importer clients with a broker dashboard.

---

## Architecture

```
┌─────────────────┐      REST API       ┌──────────────────┐      Prisma ORM     ┌──────────────┐
│   Frontend      │  ──────────────►    │   Backend        │  ──────────────►    │  PostgreSQL  │
│   Next.js 14    │  ◄──────────────    │   Express.js     │  ◄──────────────    │  Database    │
│   (App Router)  │      JSON + JWT     │   (Node.js)      │      SQL Queries    │              │
└─────────────────┘                     └──────────────────┘                     └──────────────┘
```

### Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | Next.js 14 (App Router), Tailwind CSS, React Hook Form, Zod, Axios |
| Backend    | Node.js, Express.js, TypeScript           |
| Database   | PostgreSQL with Prisma ORM                |
| Auth       | bcrypt (password hashing), JWT (stateless auth) |
| Security   | Helmet, CORS, express-rate-limit          |

---

## Database Schema

### Users Table
| Column     | Type      | Constraints          |
|------------|-----------|----------------------|
| id         | UUID      | Primary Key          |
| full_name  | String    | Required             |
| email      | String    | Unique, Required     |
| password   | String    | bcrypt hash          |
| created_at | DateTime  | Auto-generated       |

### Customers Table
| Column      | Type      | Constraints                    |
|-------------|-----------|--------------------------------|
| id          | UUID      | Primary Key                    |
| broker_id   | UUID      | Foreign Key → Users            |
| full_name   | String    | Required                       |
| email       | String    | Required                       |
| gstin       | String    | Validated, Uppercase           |
| entity_type | Enum      | EXPORTER / IMPORTER            |
| created_at  | DateTime  | Auto-generated                 |

**Unique Constraint:** (broker_id, gstin) — prevents duplicate GSTIN per broker.

---

## Security Design

| Feature                  | Implementation                          |
|--------------------------|-----------------------------------------|
| Password Hashing         | bcrypt with 10 salt rounds              |
| Authentication           | JWT tokens (7-day expiry)               |
| Authorization            | JWT auth middleware                      |
| Input Validation         | Server: express-validator, Client: Zod  |
| Rate Limiting            | 20 requests/15 min on auth routes       |
| HTTP Headers             | Helmet for secure headers               |
| CORS                     | Restricted to frontend origin           |
| Token Storage            | HTTP cookies (client-side)              |

**Passwords are NEVER stored in plain text.** All passwords are hashed using bcrypt before storage. JWT tokens are verified on every protected route request.

---

## API Endpoints

| Method | Endpoint           | Auth     | Description                   |
|--------|--------------------|----------|-------------------------------|
| POST   | /auth/register     | Public   | Register a new broker         |
| POST   | /auth/login        | Public   | Login and receive JWT         |
| GET    | /customers/stats   | Bearer   | Dashboard statistics          |
| POST   | /customers         | Bearer   | Onboard a new customer        |

---

## Pages & Routes

| Route                   | Access   | Description                |
|-------------------------|----------|----------------------------|
| /                       | Public   | Redirects to /login        |
| /register               | Public   | Broker registration form   |
| /login                  | Public   | Login form                 |
| /dashboard              | Broker   | Dashboard with profile view and stats |
| /dashboard/onboard      | Broker   | Exporter/Importer registration form |

---

## Setup & Running

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (installed and running)
- npm or yarn

### 0. PostgreSQL Database Setup

#### **Option A: Install PostgreSQL Locally (Recommended)**

**First, install PostgreSQL:**
- Windows: Download from https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql@14`
- Linux: `sudo apt install postgresql postgresql-contrib`

**Then create the database:**

```bash
# Option 1: Using psql command line
psql -U postgres
CREATE DATABASE customer_onboarding;
\q

# Option 2: Using PowerShell (one command)
psql -U postgres -c "CREATE DATABASE customer_onboarding;"
```

**Default PostgreSQL credentials:**
- Username: `postgres`
- Password: `postgres` (or the password you set during installation)
- Host: `localhost`
- Port: `5432`

**Note:** If you set a different password during installation, update it in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/customer_onboarding?schema=public"
```

#### **Option B: Use Docker (Alternative)**

If you have Docker installed, run from the project root:

```bash
docker-compose up -d
```

This will automatically create the PostgreSQL database with correct credentials.

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment (.env file already exists)
# Edit .env if you need to change:
#   - PostgreSQL username (default: postgres)
#   - PostgreSQL password (default: postgres)
#   - Database name (default: customer_onboarding)

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

## Features

- **Broker Registration** — Full Name, Email, Password with validation
- **Secure Login** — JWT-based authentication with 7-day token expiry
- **Customer Onboarding** — GSTIN validation, entity type selection, duplicate prevention
- **Broker Dashboard** — Profile summary, stats cards (total, exporters, importers), recent customers table
- **Responsive Design** — Mobile (375px) to Desktop (1440px) with collapsible sidebar
- **Error Handling** — Loading states, validation errors, API errors, empty states, success feedback

---

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # Prisma client
│   │   │   └── env.ts             # Environment config
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT auth middleware
│   │   │   └── validators.ts      # Input validation rules
│   │   ├── routes/
│   │   │   ├── auth.ts            # Register, Login
│   │   │   └── customers.ts       # Create + Stats
│   │   └── index.ts               # Express app entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── onboard/
│   │   │   │   │   └── page.tsx   # Onboarding form
│   │   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   │   └── page.tsx       # Broker dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx       # Registration page
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Root redirect
│   │   │   └── providers.tsx      # Auth + Toast providers
│   │   ├── components/
│   │   │   ├── Icons.tsx          # SVG icon components
│   │   │   ├── ProtectedRoute.tsx # Auth guard component
│   │   │   └── Sidebar.tsx        # Navigation sidebar
│   │   └── lib/
│   │       ├── api.ts             # Axios instance
│   │       └── auth-context.tsx   # Auth context provider
│   ├── .env.local
│   └── package.json
│
└── README.md
```
