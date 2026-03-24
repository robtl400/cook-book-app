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

## Comment notification badge

**What:** Add an unread-comment notification indicator to the NavBar (badge/dot on the user's name or a bell icon) when new comments appear on the user's posts.
**Why:** Without it, the social loop has no feedback mechanism — users never know someone commented without manually revisiting each post.
**Pros:** Core social engagement feature. Closes the loop between post author and commenter.
**Cons:** Requires backend change: `comments` table needs a `read_at` timestamp (or a separate `comment_reads` table). New API endpoint: `GET /api/me/unread-comments/count`. Polling or websocket needed for live updates.
**Context:** Deferred from design review (2026-03-24). The backend work is non-trivial. Frontend nav badge is ~30 min; backend tracking is the real investment.
**How to start:** Add `is_read` boolean to `Comment` model → backfill as `True` for existing → `GET /api/me/unread-comments` endpoint → poll every 60s from AuthContext → render badge in NavBar.
**Depends on:** Nothing blocking.

---

## DESIGN.md — Design system document

**What:** Create `DESIGN.md` at project root documenting: color token system, typography (fonts, scale), spacing conventions, component patterns (button variants, cards, modals, empty states, spinners), and design decisions from the 2026-03-24 design review.
**Why:** All design decisions currently exist only in CSS and code. Without a design document, future contributors start from scratch. Inconsistencies (auth page gray classes, mixed border-radius) recur because there's no source of truth.
**Pros:** Enables consistent future development. Makes design decisions visible and debatable. Required for onboarding contributors.
**Cons:** Takes time to write well. Needs maintenance as the design evolves.
**Context:** Deferred from design review (2026-03-24). Not blocking any current feature. High value before adding contributors.
**Depends on:** Font stack decision (choose typeface before documenting typography).

---

## Backend pytest suite

**What:** Bootstrap pytest for the Flask server. Start with: auth routes (register/login/me/logout), comment validation, cascade box removal logic, cook mode attribution passthrough.
**Why:** The backend handles the riskiest logic — joined-table inheritance, attribution chain, cascade deletes — with zero automated coverage. Frontend tests don't cover this.
**Pros:** Catches regressions in the most complex server flows. Especially important before refactoring models or routes.
**Cons:** Requires test database setup (in-memory SQLite or isolated test PostgreSQL). Meaningful initial investment.
**Context:** Explicitly deferred in this review (frontend tests are the focus). This is the next major testing milestone.
**How to start:** `pip install pytest pytest-flask` → create `server/tests/conftest.py` with app factory + test client → write `test_auth.py` first (easiest, most critical).
**Depends on:** Nothing blocking.

---

## Mobile nav hover states

**What:** Add `hover:text-accent` to inactive mobile menu link items in `NavBar.jsx` to match desktop nav hover behavior.
**Why:** Desktop nav links use `hover:text-accent` on inactive items; mobile dropdown links only have a static `text-text-muted` class with no hover state. Minor visual inconsistency.
**Pros:** Consistent interaction feedback across breakpoints.
**Cons:** Cosmetic only — no functional impact.
**Context:** Noticed during eng review (2026-03-24). Non-blocking, purely polish.
**Depends on:** Nothing blocking.
