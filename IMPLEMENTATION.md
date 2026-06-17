# Implementation Context

This document is the primary reference for implementing the backend. All stub files are scaffolded — this doc describes exactly what each one should do.

## Project Overview

Internal school district banking app. Students have accounts with balances. Finance staff and admins deposit/withdraw and manage accounts. Everything runs as a single `docker compose up`.

**Stack:** Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic, Pydantic v2, PyJWT, passlib[bcrypt], slowapi, PostgreSQL 16, Caddy, Docker Compose.

## Roles

Three roles enforced at the route level via `deps.require_role()`:

| Role | Access |
|---|---|
| `student` | Own account + own transaction history (read-only) |
| `finance` | Any account + any transaction history + deposit/withdraw |
| `admin` | Everything finance can do + user management (future) |

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@postgres:5432/db` |
| `POSTGRES_USER` | DB username (docker-compose) |
| `POSTGRES_PASSWORD` | DB password (docker-compose) |
| `POSTGRES_DB` | DB name (docker-compose) |
| `SECRET_KEY` | JWT signing key — `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm, default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL, default `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL, default `7` |
| `FRONTEND_ORIGIN` | CORS allowed origin, e.g. `https://banking.school.local` |
| `ENVIRONMENT` | `production` or `development` |
| `CADDY_DOMAIN` | Hostname for Caddy HTTPS |

---

## Data Models

### User (`users` table)

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default `uuid4` |
| `username` | VARCHAR(64) | unique, not null |
| `email` | VARCHAR(255) | unique, not null |
| `hashed_password` | VARCHAR | not null |
| `role` | ENUM(student, finance, admin) | not null |
| `is_active` | BOOLEAN | not null, default `true` |
| `created_at` | TIMESTAMP | not null, default `utcnow` |

Relationships: `account` → one Account, `transactions_performed` → list[Transaction] (via `created_by`).

### Account (`accounts` table)

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default `uuid4` |
| `owner_id` | UUID | FK → `users.id`, not null |
| `balance` | NUMERIC(12, 2) | not null, default `0` |
| `created_at` | TIMESTAMP | not null, default `utcnow` |

Relationships: `owner` → User, `transactions` → list[Transaction].

### Transaction (`transactions` table)

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default `uuid4` |
| `account_id` | UUID | FK → `accounts.id`, not null |
| `type` | ENUM(deposit, withdrawal) | not null |
| `amount` | NUMERIC(12, 2) | not null, must be > 0 |
| `note` | VARCHAR(500) | nullable |
| `created_by` | UUID | FK → `users.id`, not null |
| `created_at` | TIMESTAMP | not null, default `utcnow` |

Relationship: `account` → Account.

---

## File-by-File Guide

### `app/core/config.py`

Already complete. Reads all env vars via pydantic-settings. Import `settings` from here everywhere you need config.

### `app/core/security.py`

Implement five functions:

```python
# Use pwd_context (already instantiated) for hashing
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# Token payload must include: sub (username), role
def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### `app/db/base.py`

Already complete. All models import `Base` from here.

### `app/db/session.py`

Already complete. `get_db()` yields a session and closes it in a `finally` block. The engine is created from `settings.DATABASE_URL`.

### `app/db/models/user.py`

Add all columns to `User` (only `id` is stubbed in). Full column set:

```python
username = Column(String(64), unique=True, nullable=False)
email = Column(String(255), unique=True, nullable=False)
hashed_password = Column(String, nullable=False)
role = Column(Enum(UserRole), nullable=False)
is_active = Column(Boolean, nullable=False, default=True)
created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
```

Add relationship: `account = relationship("Account", back_populates="owner", uselist=False)`.

### `app/db/models/account.py`

Add all columns to `Account`:

```python
owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
balance = Column(Numeric(12, 2), nullable=False, default=0)
created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
```

Add relationships:
```python
owner = relationship("User", back_populates="account")
transactions = relationship("Transaction", back_populates="account", order_by="Transaction.created_at.desc()")
```

### `app/db/models/transaction.py`

Add all columns to `Transaction`:

```python
account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
type = Column(Enum(TransactionType), nullable=False)
amount = Column(Numeric(12, 2), nullable=False)
note = Column(String(500), nullable=True)
created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
```

Add relationship: `account = relationship("Account", back_populates="transactions")`.

### `app/schemas/user.py`, `account.py`, `transaction.py`

Already complete. Schemas have correct fields and `from_attributes=True` where needed. Do not modify unless the models change.

### `app/api/deps.py`

Implement three dependencies:

**`get_current_user`** — reads access token from `Authorization: Bearer <token>` header (or cookie — decide and be consistent with how auth routes set it). Decodes with `security.decode_token()`, fetches `User` by `payload["sub"]` (username), raises `HTTPException(401)` if user not found or inactive.

```python
def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = security.decode_token(token)
    user = db.query(User).filter(User.username == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user
```

**`require_role(*roles)`** — dependency factory. Returns a FastAPI dependency that calls `get_current_user` and checks `current_user.role.value in roles`. Raises `HTTPException(403)` if the role is not permitted.

```python
def require_role(*roles: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return Depends(dependency)
```

### `app/api/routes/auth.py`

**`POST /api/v1/auth/login`**
1. Fetch `User` by `body.username`. If not found or `not user.is_active`, raise `HTTPException(401, "Invalid credentials")`.
2. `security.verify_password(body.password, user.hashed_password)` — raise `HTTPException(401)` if False.
3. Create access and refresh tokens with `{"sub": user.username, "role": user.role.value}`.
4. Set refresh token as an httpOnly cookie on `response`:
   ```python
   response.set_cookie(
       "refresh_token", refresh_token,
       httponly=True, secure=True, samesite="strict",
       max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
   )
   ```
5. Set access token as an httpOnly cookie as well (same pattern, shorter `max_age`).
6. Return `Token(access_token=access_token)`.

**`POST /api/v1/auth/logout`**
- Delete both cookies via `response.delete_cookie("access_token")` and `response.delete_cookie("refresh_token")`.
- Return 204.

**`POST /api/v1/auth/refresh`**
- Read refresh token from `request.cookies.get("refresh_token")`. Raise `HTTPException(401)` if missing.
- Decode with `security.decode_token()`.
- Create new access token, set it as cookie, return `Token`.

Apply slowapi rate limit to login: `@limiter.limit("10/minute")` (import `limiter` from `main` or instantiate in a shared module).

### `app/api/routes/accounts.py`

**`GET /api/v1/accounts/me`**
- Query `Account` where `owner_id == current_user.id`. If not found, raise `HTTPException(404)`.
- Return `AccountResponse`.

**`GET /api/v1/accounts`** (finance/admin only)
- `db.query(Account).all()` — return list of `AccountResponse`.

**`GET /api/v1/accounts/{account_id}`** (finance/admin only)
- Query by `account_id`. Raise `HTTPException(404)` if not found.
- Return `AccountResponse`.

### `app/api/routes/transactions.py`

**`GET /api/v1/transactions/me`**
- Get current user's account, query `Transaction` where `account_id == account.id`, ordered by `created_at DESC`, with `skip`/`limit`.

**`POST /api/v1/transactions/deposit`** (finance/admin only)
- Fetch account by `body.account_id`. Raise `HTTPException(404)` if not found.
- Add `body.amount` to `account.balance`.
- Create `Transaction(account_id=..., type=TransactionType.deposit, amount=body.amount, note=body.note, created_by=current_user.id)`.
- `db.add(transaction)`, `db.commit()`, `db.refresh(transaction)`.
- Return `TransactionResponse`.

**`POST /api/v1/transactions/withdraw`** (finance/admin only)
- Same as deposit, but first check `account.balance >= body.amount`. Raise `HTTPException(400, "Insufficient funds")` if not.
- Subtract `body.amount` from `account.balance`.
- Create transaction with `type=TransactionType.withdrawal`.

**`GET /api/v1/transactions/{account_id}`** (finance/admin only)
- Fetch transactions for account with `skip`/`limit`, ordered by `created_at DESC`.

### `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.api.routes import auth, accounts, transactions

limiter = Limiter(key_func=get_remote_address)

def create_app() -> FastAPI:
    app = FastAPI(
        title="School Banking API",
        version="1.0.0",
        openapi_url="/api/openapi.json",
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(accounts.router, prefix="/api/v1")
    app.include_router(transactions.router, prefix="/api/v1")

    return app

app = create_app()
```

Pass `limiter` to the auth router so login can be decorated with `@limiter.limit("10/minute")`. One approach: expose `limiter` from `main.py` and import it in `auth.py`.

---

## Migrations Workflow

After implementing models with full column definitions:

```bash
cd backend
# First time only — create venv and install deps
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Generate initial migration (reads DATABASE_URL from .env or env)
alembic revision --autogenerate -m "initial schema"

# Apply
alembic upgrade head
```

In Docker, migrations run automatically on container start (`CMD` in `backend/Dockerfile`).

---

## Deployment — IT Handoff

### First time

```bash
cp .env.example .env
# Edit .env:
#   - Set POSTGRES_PASSWORD to a strong password
#   - Set SECRET_KEY to: openssl rand -hex 32
#   - Set CADDY_DOMAIN to the server hostname (e.g. banking.school.local)
#   - Set FRONTEND_ORIGIN to https://<CADDY_DOMAIN>
#   - Update DATABASE_URL to match POSTGRES_USER/PASSWORD/DB

docker compose up -d --build
```

Caddy automatically handles HTTPS. For an internal domain, add a DNS entry pointing the hostname to the server IP, or distribute a `/etc/hosts` entry to clients.

### Updates

```bash
docker compose up -d --build
```

Alembic migrations run on backend startup — no manual migration step needed.

### Data persistence

PostgreSQL data lives in the `postgres_data` Docker volume. Back this up regularly:

```bash
docker exec <postgres-container> pg_dump -U banking_user banking_db > backup.sql
```
