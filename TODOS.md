# TODOS

## Redis-backed Flask-Limiter

**What:** Upgrade rate limiter to use Redis storage backend on Render.
**Why:** In-memory limiter resets on every Render free-tier dyno restart (~every few hours), providing no real brute-force protection in production.
**Pros:** Actually works across restarts. Standard production setup.
**Cons:** Adds Redis dependency. Render Redis free tier has 25MB storage limit.
**Context:** Decision made to ship best-effort in-memory limiter (with a code comment documenting the limitation). Redis upgrade is the complete fix when real users are at stake. Rate limits already work correctly on warm instances.
**How to implement:** Add Render Redis add-on → set `REDIS_URL` env var → `pip install flask-limiter[redis]` → configure `Limiter(storage_uri=os.environ["REDIS_URL"])` in `create_app()`.
**Depends on:** Nothing blocking.

---

## Comment pagination

**What:** Add `?limit=50&offset=0` query params to `GET /posts/{id}/comments`. Add "Load more" or infinite scroll to `CommentSection`.
**Why:** All comments currently load in one request. No practical problem at demo scale but a real concern if a post ever goes viral.
**Pros:** Prevents large payloads on popular posts. Standard REST pattern.
**Cons:** Backend + frontend change. Slightly more complex CommentSection state.
**Context:** Deferred in this review. The 1000-char body cap already prevents worst-case payload sizes. Revisit when post volume grows.
**Depends on:** Nothing blocking.

---

## Backend pytest suite

**What:** Bootstrap pytest for the Flask server. Start with: auth routes (register/login/me/logout), comment validation, cascade box removal logic, cook mode attribution passthrough.
**Why:** The backend handles the riskiest logic — joined-table inheritance, attribution chain, cascade deletes — with zero automated coverage. Frontend tests don't cover this.
**Pros:** Catches regressions in the most complex server flows. Especially important before refactoring models or routes.
**Cons:** Requires test database setup (in-memory SQLite or isolated test PostgreSQL). Meaningful initial investment.
**Context:** Explicitly deferred in this review (frontend tests are the focus). This is the next major testing milestone.
**How to start:** `pip install pytest pytest-flask` → create `server/tests/conftest.py` with app factory + test client → write `test_auth.py` first (easiest, most critical).
**Depends on:** Nothing blocking.
