# PosturePAI — Architecture

## High-Level Overview

```
Browser
  │
  ├── MediaPipe (pose detection — runs entirely client-side, ~100ms/frame)
  ├── postureAnalysis.ts (joint angle math, posture classification)
  │
  ▼
FastAPI Backend (http://localhost:8000)
  ├── /auth          → JWT register/login/refresh/password-reset
  ├── /sessions      → start, end, list posture sessions
  ├── /snapshots     → create and list per-session posture snapshots
  ├── /alerts        → create and list posture alerts
  ├── /gamification  → streaks and badge state
  └── /insights      → Gemini AI coaching endpoint
  │
  ▼
PostgreSQL 16
  └── Tables: users, posture_sessions, posture_snapshots, posture_alerts,
              user_streaks, user_badges
```

MediaPipe never leaves the browser — it is CPU-heavy per-frame work that has no benefit from a round trip. Everything else (persistence, auth, AI) lives in the backend.

---

## Backend Directory Structure

```
backend/
├── app/
│   ├── main.py               # FastAPI app factory, CORS, router registration, lifespan
│   ├── config.py             # pydantic-settings: reads .env into a Settings object
│   ├── database.py           # async SQLAlchemy engine + session factory, init_db()
│   ├── dependencies.py       # get_db (AsyncSession), get_current_user (JWT decode)
│   │
│   ├── models/               # SQLAlchemy ORM models (declarative, async)
│   │   ├── __init__.py       # re-exports all models so Base.metadata is fully populated
│   │   ├── user.py           # User: id (UUID), email, hashed_password, created_at
│   │   ├── session.py        # PostureSession: started_at, ended_at, avg_posture_score, status
│   │   ├── snapshot.py       # PostureSnapshot: captured_at, posture metrics, pose landmarks
│   │   ├── alert.py          # PostureAlert: alert_type, severity, message, dismissed
│   │   └── gamification.py   # UserStreak + UserBadge
│   │
│   ├── schemas/              # Pydantic v2 request/response models
│   │   ├── auth.py           # RegisterRequest, LoginRequest, TokenResponse
│   │   ├── session.py        # SessionResponse, EndSessionRequest
│   │   ├── snapshot.py       # SnapshotCreate, SnapshotResponse
│   │   ├── alert.py          # AlertCreate, AlertResponse
│   │   ├── gamification.py   # StreakResponse, BadgeResponse, GamificationResponse
│   │   └── insights.py       # InsightsRequest, InsightsResponse
│   │
│   ├── routers/              # One file per resource; each uses APIRouter with prefix
│   │   ├── auth.py           # POST /auth/register, /auth/login, /auth/refresh, /auth/reset-password
│   │   ├── sessions.py       # POST /sessions, POST /sessions/{id}/end, GET /sessions, GET /sessions/{id}
│   │   ├── snapshots.py      # POST /snapshots, GET /snapshots
│   │   ├── alerts.py         # POST /alerts, GET /alerts, PATCH /alerts/{id}/dismiss
│   │   ├── gamification.py   # GET /gamification
│   │   └── insights.py       # POST /insights
│   │
│   └── services/             # Business logic (no HTTP concerns here)
│       ├── auth_service.py   # create_access_token, verify_token, hash_password, verify_password
│       ├── gamification_service.py  # update_streak_and_badges — called at session end
│       └── insights_service.py     # generate_insights — calls Gemini SDK
│
├── alembic/                  # Migration scripts
│   ├── env.py                # Alembic config — imports models, points at DATABASE_URL
│   └── versions/             # Auto-generated migration files
│
├── tests/                    # pytest + httpx async tests
├── docker-compose.yml        # Postgres 16 container
├── .env                      # Local secrets (never committed)
└── requirements.txt
```

---

## Frontend Directory Structure

```
frontend/
├── src/
│   ├── main.tsx              # ReactDOM.createRoot, QueryClientProvider, Router
│   ├── App.tsx               # Route definitions (/, /auth, /dashboard, /history)
│   │
│   ├── pages/
│   │   ├── Index.tsx         # Landing page
│   │   ├── Auth.tsx          # Login / Register
│   │   ├── Dashboard.tsx     # Live monitoring + posture score
│   │   └── History.tsx       # Session history + analytics
│   │
│   ├── components/
│   │   ├── landing/          # HeroSection, FeaturesSection, etc. — pure UI
│   │   ├── dashboard/        # PostureMonitor, PostureScoreRing, PostureHeatmap, AlertPanel
│   │   └── ui/               # shadcn/ui primitives (Button, Card, Toast, etc.)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts        # Auth state, login/register/logout — calls /auth endpoints
│   │   ├── usePoseDetection.ts       # MediaPipe setup, webcam stream, landmark output
│   │   ├── usePostureSession.ts      # Start/end session, snapshot submission
│   │   ├── usePostureHistory.ts      # Fetch sessions + snapshots for History page
│   │   └── useGamification.ts        # Fetch streak + badges from /gamification
│   │
│   ├── lib/
│   │   ├── api.ts            # Central fetch/axios client — attaches JWT, handles 401 refresh
│   │   ├── postureAnalysis.ts  # Pure math: joint angles, spine alignment, posture score
│   │   └── utils.ts          # cn() and other utilities
│   │
│   └── index.css             # Tailwind base + CSS custom properties (design tokens)
│
├── public/                   # Static assets
├── components.json           # shadcn/ui config
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## Data Flow: Live Monitoring Session

```
1. User grants webcam access
2. usePoseDetection grabs the video stream
3. MediaPipe runs pose detection at ~10fps → emits normalized landmarks
4. postureAnalysis.ts calculates:
     - neck angle, shoulder tilt, spine deviation, hip balance
     - posture score 0–100
     - classification: GOOD | FAIR | POOR
5. Dashboard renders PostureScoreRing + PostureHeatmap from score + landmarks
6. If score < threshold → usePostureSession fires POST /alerts
7. Every N seconds → POST /snapshots with current metrics + landmarks
8. User ends session → POST /sessions/{id}/end with aggregate stats
9. Backend calls update_streak_and_badges() and returns updated session
10. User optionally requests AI insights → POST /insights → Gemini → coaching text
```

---

## Auth Flow

```
Register  → POST /auth/register → bcrypt hash → create user → return JWT pair
Login     → POST /auth/login   → verify bcrypt → return access_token (30min) + refresh_token (7d, httpOnly cookie)
Request   → Authorization: Bearer <access_token>
           → get_current_user dependency decodes JWT, fetches user from DB
401       → lib/api.ts intercepts → POST /auth/refresh using cookie → retry original request
Reset     → POST /auth/reset-password/request → signed token emailed via Resend
           → POST /auth/reset-password/confirm → verify token → update hashed_password
```

All ownership checks are enforced at the service layer — every query filters by `user_id = current_user.id`.

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR | unique, not null |
| hashed_password | VARCHAR | bcrypt hash |
| created_at | TIMESTAMPTZ | default now() |

### `posture_sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| started_at | TIMESTAMPTZ | |
| ended_at | TIMESTAMPTZ | nullable |
| duration_seconds | INTEGER | nullable |
| avg_posture_score | FLOAT | nullable |
| good_posture_percent | FLOAT | nullable |
| total_alerts | INTEGER | default 0 |
| status | VARCHAR | `active` \| `completed` |

### `posture_snapshots`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | FK → posture_sessions.id |
| user_id | UUID | FK → users.id |
| captured_at | TIMESTAMPTZ | |
| posture_score | FLOAT | |
| posture_state | VARCHAR | `good` \| `fair` \| `poor` |
| neck_angle | FLOAT | degrees |
| shoulder_tilt | FLOAT | degrees |
| spine_deviation | FLOAT | degrees |

### `posture_alerts`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | FK |
| user_id | UUID | FK |
| alert_type | VARCHAR | e.g. `neck_forward`, `shoulder_tilt` |
| severity | VARCHAR | `info` \| `warning` \| `critical` |
| message | TEXT | |
| dismissed | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | |

### `user_streaks`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK, unique |
| current_streak | INTEGER | consecutive active days |
| longest_streak | INTEGER | all-time best |
| last_active_date | DATE | |

### `user_badges`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK |
| badge_key | VARCHAR | e.g. `first_session`, `streak_7` |
| earned_at | TIMESTAMPTZ | |
| notified | BOOLEAN | default false |

---

## Key Design Decisions

**MediaPipe stays client-side.** Sending video frames to a server for processing would introduce unacceptable latency and data privacy concerns. All pose math runs locally.

**No Supabase Auth or Edge Functions.** The backend owns auth via python-jose + bcrypt. This removes the Supabase JS client dependency, eliminates RLS complexity, and gives full control over the JWT lifecycle.

**Single API client (`lib/api.ts`).** All frontend network calls go through one module that attaches the bearer token and handles token refresh on 401. No hook imports Supabase or fetch directly.

**Ownership enforced in queries, not middleware.** Every DB query includes `WHERE user_id = current_user.id`. There is no separate authorization layer to maintain.

**Gamification runs at session end.** `update_streak_and_badges()` is called synchronously inside `POST /sessions/{id}/end`. Streaks and badges are always consistent with completed session data.