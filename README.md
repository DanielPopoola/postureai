# PosturePAI

An AI-powered medical ergonomics coaching system for remote workers. Uses your webcam to monitor posture in real time, classifies your sitting position against ergonomic standards, fires coaching alerts, tracks streaks, and surfaces AI-generated insights via Google Gemini.

> **This is not a medical device.** PosturePAI is a wellness awareness tool — it does not diagnose, treat, or provide clinical guidance.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Pose Detection | MediaPipe Tasks Vision (runs entirely in the browser) |
| Backend | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy (async) + asyncpg |
| Database | PostgreSQL 16 |
| Auth | Custom JWT (python-jose + passlib/bcrypt) |
| AI Insights | Google Gemini API (`gemini-1.5-flash`) |
| Migrations | Alembic |
| Container | Docker Compose (Postgres only) |

---

## Prerequisites

| Tool | Minimum Version | Windows Notes |
|---|---|---|
| Node.js | 18.x | Use [nvm-windows](https://github.com/coreybutler/nvm-windows) or [fnm](https://github.com/Schniz/fnm) |
| Python | 3.11 | Use [python.org installer](https://www.python.org/downloads/windows/) — check "Add to PATH" |
| Docker Desktop | latest | Required for the local Postgres container |
| Git | any | [git-scm.com](https://git-scm.com/download/win) |

---

## Quickstart

### 1. Clone

```bash
git clone https://github.com/DanielPopoola/posturepai.git
cd posturepai
git checkout version-1
```

### 2. Backend

```bash
cd backend

# Windows (Command Prompt or PowerShell)
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
copy .env.example .env   # Windows
# Then edit .env — see Environment Variables section below

# Start Postgres via Docker
docker compose up -d

# Run migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API will be live at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend

npm install

# Copy and fill in environment variables
copy .env.example .env.local   # Windows

# Start the dev server
npm run dev
```

App will be live at `http://localhost:5173`.

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/posturepai
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=posturepai
JWT_SECRET=a-long-random-secret-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GEMINI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
FRONTEND_URL=http://localhost:5173
```

Get a Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey).  
Get a Resend API key at [resend.com](https://resend.com) (used for password-reset emails).

### `frontend/.env.local`

```env
VITE_API_URL=http://localhost:8000
```

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `uvicorn app.main:app --reload` | Start dev server with hot reload |
| `alembic upgrade head` | Apply all pending migrations |
| `alembic revision --autogenerate -m "message"` | Generate a new migration |
| `pytest` | Run test suite |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm test` | Vitest unit tests |

---

## Hardware Requirements

- Webcam (built-in or USB) — required for pose detection
- Minimum 8 GB RAM
- Stable internet connection (for Gemini API calls)
- Good ambient lighting — MediaPipe accuracy degrades in low light

---

## Project Structure

```
posturepai/
├── backend/          # FastAPI app
├── frontend/         # React + Vite app
└── README.md
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a full breakdown of both directories and data flow.  
See [DEVELOPMENT.md](./DEVELOPMENT.md) for contribution guidelines, migration workflow, and coding conventions.