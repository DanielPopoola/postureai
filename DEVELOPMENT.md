# PosturePAI — Development Guide

## Windows Setup (Detailed)

This section covers every step from a clean Windows machine.

### 1. Install Prerequisites

**Python 3.11+**
- Download from [python.org](https://www.python.org/downloads/windows/)
- During installation: check **"Add Python to PATH"** and **"Install pip"**
- Verify: open a new terminal and run `python --version`

**Node.js 18+**
- Recommended: install [fnm](https://github.com/Schniz/fnm) (Fast Node Manager for Windows)
  ```powershell
  winget install Schniz.fnm
  # Restart terminal, then:
  fnm install 18
  fnm use 18
  ```
- Alternative: download directly from [nodejs.org](https://nodejs.org/en/download)
- Verify: `node --version` and `npm --version`

**Docker Desktop**
- Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- Enable WSL 2 backend when prompted (required for Linux containers)
- After install, start Docker Desktop and wait for the whale icon to stop animating
- Verify: `docker --version`

**Git**
- Download from [git-scm.com/download/win](https://git-scm.com/download/win)
- During install: choose "Git from the command line and also from 3rd-party software"

### 2. Clone the Repository

```powershell
git clone https://github.com/DanielPopoola/posturepai.git
cd posturepai
git checkout version-1
```

### 3. Backend Setup

Open a terminal in the `backend/` directory.

**Create and activate a virtual environment:**

```powershell
# PowerShell
python -m venv .venv
.venv\Scripts\Activate.ps1

# If you get an execution policy error in PowerShell:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then re-run the activate command
```

```cmd
# Command Prompt (alternative)
python -m venv .venv
.venv\Scripts\activate.bat
```

Your prompt will change to show `(.venv)` when the environment is active.

**Install dependencies:**

```powershell
pip install -r requirements.txt
```

**Configure environment variables:**

```powershell
copy .env.example .env
notepad .env   # or use VS Code: code .env
```

Fill in all values — see the Environment Variables section in README.md.

**Start Postgres:**

```powershell
docker compose up -d
```

Verify it's running:
```powershell
docker compose ps
```
You should see `posturepai-db-1` with status `Up`.

**Run migrations:**

```powershell
alembic upgrade head
```

**Start the API:**

```powershell
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Frontend Setup

Open a **new** terminal in the `frontend/` directory.

```powershell
npm install

copy .env.example .env.local
notepad .env.local
```

Set `VITE_API_URL=http://localhost:8000`, then:

```powershell
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

---

## Development Workflow

### Running Both Services

You need two terminals running simultaneously:

- Terminal 1 (backend): `uvicorn app.main:app --reload --port 8000` (with `.venv` active)
- Terminal 2 (frontend): `npm run dev`

### Stopping Everything

```powershell
# Stop the Postgres container when you're done
cd backend
docker compose down

# To also delete the database volume (start fresh):
docker compose down -v
```

---

## Database Migrations (Alembic)

### Create a new migration after changing a model

```bash
cd backend
alembic revision --autogenerate -m "describe what changed"
```

Review the generated file in `alembic/versions/` before applying — autogenerate sometimes misses things like index changes or custom types.

```bash
alembic upgrade head
```

### Common Alembic commands

```bash
alembic current          # show current migration version
alembic history          # list all migrations
alembic downgrade -1     # roll back one migration
alembic downgrade base   # roll back everything (dangerous)
```

### Windows path note

Alembic reads `DATABASE_URL` from your `.env`. If you get a connection error, confirm Docker is running and the credentials in `.env` match `docker-compose.yml`.

---

## Backend Conventions

### Adding a new endpoint

1. Create or edit the appropriate router in `app/routers/`
2. Add request/response schemas in `app/schemas/`
3. If the route needs business logic beyond a simple DB read/write, put it in `app/services/`
4. Register the router in `app/main.py` if it's a new file
5. Add a model in `app/models/` if new tables are needed, then generate a migration

### Route pattern

Every protected route uses the same dependency injection pattern:

```python
@router.get("/resource")
async def get_resource(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # All queries must filter by user.id
    result = await db.scalars(select(MyModel).where(MyModel.user_id == user.id))
    return result.all()
```

Do not skip the `user_id` filter — ownership is enforced at the query level, not middleware.

### Service layer

Services in `app/services/` receive `AsyncSession` and model data. They do not import `Request` or any FastAPI types. This keeps business logic testable independently of HTTP.

---

## Frontend Conventions

### API calls

All network requests go through `lib/api.ts`. Never import `fetch` directly in a hook or component.

```typescript
// ✅ correct
import { api } from "@/lib/api";
const sessions = await api.get("/sessions");

// ❌ wrong
const sessions = await fetch("http://localhost:8000/sessions");
```

### Hooks structure

- Hooks in `hooks/` handle data fetching and state — no rendering logic
- Components receive data as props where possible
- `usePoseDetection.ts` and `postureAnalysis.ts` are pure browser/math code — never call the API from either

### Adding a new page

1. Create `src/pages/MyPage.tsx`
2. Add a route in `App.tsx`
3. If it requires auth, wrap it with the protected route pattern (check `useAuth` and redirect if no user)

---

## Testing

### Backend

```bash
cd backend
pytest                        # run all tests
pytest tests/test_sessions.py  # run a specific file
pytest -v                     # verbose output
```

Tests use `httpx.AsyncClient` with an in-memory SQLite DB (or a test Postgres — check `tests/conftest.py`).

### Frontend

```bash
cd frontend
npm test           # vitest (single run)
npm run test:watch # watch mode
```

Tests use `@testing-library/react` + `jsdom`.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Full async Postgres URL: `postgresql+asyncpg://user:pass@host:5432/db` |
| `POSTGRES_USER` | Yes | Postgres username (used by docker-compose) |
| `POSTGRES_PASSWORD` | Yes | Postgres password (used by docker-compose) |
| `POSTGRES_DB` | Yes | Database name |
| `JWT_SECRET` | Yes | Random string ≥32 chars — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_ALGORITHM` | Yes | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | `30` recommended |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Yes | `7` recommended |
| `GEMINI_API_KEY` | Yes | From [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `RESEND_API_KEY` | Yes | From [resend.com](https://resend.com) (password reset emails) |
| `FRONTEND_URL` | Yes | `http://localhost:5173` in development |

**Windows tip:** Never quote values in `.env` files (e.g. write `JWT_SECRET=abc123` not `JWT_SECRET="abc123"`). Python's `pydantic-settings` reads them unquoted.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:8000` in development |

Variables must be prefixed with `VITE_` to be accessible in browser code via `import.meta.env.VITE_API_URL`.

---

## Troubleshooting

### `uvicorn: command not found` (Windows)

Your virtual environment is not activated. Run `.venv\Scripts\Activate.ps1` (PowerShell) or `.venv\Scripts\activate.bat` (Command Prompt) from the `backend/` directory.

### `Error: connect ECONNREFUSED 127.0.0.1:8000`

The backend is not running. Start it with `uvicorn app.main:app --reload --port 8000`.

### `asyncpg.exceptions.ConnectionRefusedError`

Postgres container is not running. Run `docker compose up -d` from the `backend/` directory.

### Alembic `Target database is not up to date`

Run `alembic upgrade head` to apply pending migrations.

### PowerShell script execution policy error

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Webcam not detected / blank video

- Check browser permissions (click the camera icon in the address bar)
- Confirm no other application (Teams, Zoom) is holding the webcam
- Ensure you're accessing the app via `http://localhost` — webcam APIs require a secure context (localhost qualifies, but arbitrary IPs do not)

### MediaPipe model fails to load

MediaPipe downloads WASM/model files from a CDN on first load. Ensure you have an internet connection and the browser dev tools Network tab shows the `.task` file loading successfully.

---

## Common Pitfalls

- **Do not commit `.env` files.** They contain real secrets. `.env` is in `.gitignore` — keep it that way.
- **Docker must be running before `docker compose up`.** Docker Desktop must be open and the engine started.
- **Activate the venv before every backend session.** If `import fastapi` fails, you forgot to activate.
- **`DATABASE_URL` and `docker-compose.yml` must agree.** If you change the Postgres password in one place, change it in both.
- **Port conflicts.** If `8000` or `5173` is in use, kill the process or change the port in `uvicorn` / `vite.config.ts` and update `FRONTEND_URL` / `VITE_API_URL` accordingly.