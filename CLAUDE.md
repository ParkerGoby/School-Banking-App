# CLAUDE.md

## Project

Internal school district banking app. Students have accounts, finance staff deposit/withdraw, admins have full access.

```
frontend/             — React 18 + TypeScript + Vite
  src/
    components/ui/    — shadcn-style Radix primitives (treat as vendored)
    components/       — app-level shared components
    pages/            — route-level views
    context/          — React context providers
    hooks/            — custom hooks
  styles/             — global CSS

backend/              — Python 3.12 + FastAPI
  app/
    api/routes/       — auth, accounts, transactions
    api/deps.py       — get_db, get_current_user, require_role
    core/             — config (pydantic-settings), security (JWT + bcrypt)
    db/               — SQLAlchemy base, session, models
    schemas/          — Pydantic v2 request/response schemas
    main.py           — app factory, middleware, router mounts
  alembic/            — migrations
  requirements.txt
  Dockerfile

docker-compose.yml    — postgres, backend, frontend, caddy
Caddyfile             — /api/* → backend, /* → frontend, HTTPS
.env.example          — all required env vars documented
IMPLEMENTATION.md     — per-file implementation guide for backend stubs
```

## Rules

**Verify before writing any code.** Confirm approach with the user before touching files. If a change affects more than two files, introduces a dependency, or involves an architectural decision — ask first.

**Never commit or push.** Do not run `git commit`, `git push`, `git add`, or any destructive git operation. Stage/diff for inspection only.

**Reuse before creating.** Search `src/components/` before writing a new component. Most primitives already exist in `src/components/ui/`. Never duplicate.

**Minimal changes.** Fix only what was asked. No cleanup of surrounding code, no speculative abstractions, no half-finished implementations.

**No new dependencies without asking.** Check `package.json` first — most UI, form, charting, and animation needs are already covered.

## Commands

**Frontend** — run from `frontend/`:
```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run dev         # dev server
npm run build       # production build
```

**Backend** — run from `backend/` with venv active:
```bash
uvicorn app.main:app --reload          # dev server
alembic revision --autogenerate -m ""  # generate migration
alembic upgrade head                   # apply migrations
```

**Docker**:
```bash
docker compose up -d --build   # build and start all services
docker compose logs -f backend # tail backend logs
```

Always run `lint` and `typecheck` after any frontend change.
