# CookBook

> **Share what you actually cook.**

CookBook is a full-stack social recipe-sharing platform inspired by Letterboxd. Log your cooking sessions, discover recipes from other home cooks, track what you want to try, and build an honest record of what lands in your kitchen.

---

## Live Demo

- **Frontend:** [cook-book-app.netlify.app](https://cook-book-app.netlify.app) *(replace with your Netlify URL)*
- **API:** Hosted on Render (free tier — first request may be slow while the dyno wakes up)

**Demo credentials:** `alice` / `password123` (or `bob`, `cora`, `cookbook`)

---

## Features

### Recipes
- **Create recipes** with a title, description, ingredients, step-by-step instructions, cook time, servings, difficulty, and a 1–5 self-rating.
- **URL import** — paste any recipe URL and the parser pre-fills the form automatically using `recipe-scrapers`.
- **Image uploads** via Cloudinary (unsigned upload preset, no server involvement required).

### Attribution Chain
Every recipe tracks exactly how it originated, and this attribution is visible on every post:

| Source type | Meaning |
|---|---|
| `original` | User's own recipe, created from scratch |
| `external` | Scraped or adapted from an external URL |
| `internal` | Forked from another CookBook post |
| `credit` | Adapted from a non-URL source (book, person, etc.) |

An optional **inspiration credit** lets you separately credit a post or user that sparked the idea.

### "I Cooked This"
Log that you cooked someone else's recipe. The form pre-fills with the source recipe's ingredients and steps. Add your own modifications, rating, and notes. Attribution flows through automatically — your cook post is linked back to the original.

### Recipe Boxes
Save recipes to curated collections. Three default boxes are created on registration:
- **Recipe Box** — liked / saved recipes (auto-receives any save)
- **Cooked** — everything you've cooked
- **Want to Try** — your personal recipe queue

Create additional custom boxes for any theme. Removing a recipe from your Recipe Box cascades the removal across all your other boxes.

### Social
- **Follow** other cooks. Your **feed** surfaces their recent posts in reverse-chronological order.
- **Threaded comments** on every post.
- **Public profiles** show a user's post count, follower/following counts, and tabbed recipe / recipe box views.

### Discovery
- **Explore page** — most-saved and most-cooked recipes from the last 30 days. No account required.
- **Search** — search by recipe title, ingredient name, or username (`@alice`). Filter results by cuisine or dietary tag using the sidebar.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask 3, SQLAlchemy 2 (joined-table inheritance), Flask-Migrate |
| Auth | Flask-Login (server-side sessions), bcrypt |
| Serialization | marshmallow-sqlalchemy |
| Recipe parsing | recipe-scrapers |
| Database | PostgreSQL 16 |
| Frontend | React 19, Vite 7, React Router v7 |
| Forms | React Hook Form |
| Styling | Tailwind CSS v4 (no config file — `@import "tailwindcss"` + `@theme {}` block) |
| Notifications | react-hot-toast |
| Images | Cloudinary (unsigned upload preset) |
| Deploy | Render (backend) + Netlify (frontend) |

---

## Data Model

```
users
  ├── posts (base table — joined-table inheritance)
  │     └── recipe_posts (title, ingredients, steps, attribution, rating)
  ├── recipe_boxes
  │     └── box_posts (many-to-many: boxes ↔ posts)
  ├── comments
  ├── follows
  └── post_tags (many-to-many: posts ↔ tags)
```

**Key design decision:** `Post` is a base table with `post_type` for polymorphic dispatch. `RecipePost` extends it via joined-table inheritance. This lets multiple post types (recipe, journal, etc.) share comments, tags, and box membership without table duplication.

Attribution is self-referential: `source_post_id` and `inspo_post_id` are foreign keys back to the `posts` table, enabling the full lineage chain to be resolved in a single query.

---

## Project Structure

```
cook-book-app/
├── server/
│   ├── app.py              # Flask app factory
│   ├── config.py           # Environment-based config
│   ├── seed.py             # Database seed script
│   ├── requirements.txt
│   ├── models/
│   │   ├── post.py         # Base Post (polymorphic)
│   │   ├── recipe_post.py  # RecipePost (joined-table)
│   │   ├── user.py
│   │   ├── recipe_box.py
│   │   ├── comment.py
│   │   ├── ingredient.py
│   │   ├── step.py
│   │   ├── tag.py
│   │   ├── post_tag.py
│   │   ├── box_post.py
│   │   └── follow.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── recipe_post_routes.py
│   │   ├── recipe_box_routes.py
│   │   ├── user_routes.py
│   │   ├── comment_routes.py
│   │   ├── search_routes.py
│   │   └── parse_routes.py
│   └── schemas/
│       ├── recipe_post_schema.py
│       ├── user_schema.py
│       └── ...
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── SaveToBoxModal.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── AttributionBadge.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── FeedPage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── PostDetailPage.jsx
│   │   │   ├── RecipeFormPage.jsx   # handles create / edit / cook
│   │   │   ├── UserProfilePage.jsx
│   │   │   ├── RecipeBoxDetailPage.jsx
│   │   │   ├── MyRecipeBoxPage.jsx
│   │   │   └── SearchResultsPage.jsx
│   │   └── utils/api.js
│   ├── public/_redirects            # Netlify SPA fallback
│   └── vite.config.js
├── Procfile                         # Render start command
└── README.md
```

---

## API Routes

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register; auto-creates 3 default boxes |
| POST | `/login` | — | Login |
| POST | `/logout` | required | Logout |
| GET | `/me` | required | Current user |

### Posts — `/api/posts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/recipe` | required | Create recipe post |
| GET | `/feed` | required | Followed users' posts |
| GET | `/<id>` | — | Post detail |
| PATCH | `/<id>` | owner | Update post |
| DELETE | `/<id>` | owner | Delete post |
| GET | `/recipe/cook/<id>` | required | Pre-fill form for "I cooked this" |
| POST | `/<id>/save` | required | Save to a box |
| DELETE | `/<id>/save/<box_id>` | required | Remove from a box |
| GET | `/<id>/comments` | — | List comments |
| POST | `/<id>/comments` | required | Add comment (supports `parent_id`) |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/<id>` | — | User profile + posts |
| POST | `/<id>/follow` | required | Follow user |
| DELETE | `/<id>/follow` | required | Unfollow user |

### Recipe Boxes — `/api/boxes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | required | Current user's boxes |
| POST | `/` | required | Create custom box |
| GET | `/<id>` | — | Box detail + saved posts |
| DELETE | `/<id>` | owner | Delete box |

### Other

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/explore` | — | Most-saved & most-cooked (30 days) |
| GET | `/api/search` | — | Recipe + user search with tag filter |
| POST | `/api/parse` | — | Scrape recipe from URL |

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16

### 1. Clone

```bash
git clone https://github.com/your-username/cook-book-app.git
cd cook-book-app
```

### 2. Backend setup

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the **project root** (not `server/`):

```env
SECRET_KEY=replace-me-with-a-long-random-string
DATABASE_URL=postgresql://localhost/cookbook_dev
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

Create the database, run migrations, and seed:

```bash
createdb cookbook_dev
FLASK_APP=app.py .venv/bin/flask db upgrade
python seed.py
```

Start the backend:

```bash
FLASK_APP=app.py .venv/bin/flask run --port 5555
```

### 3. Frontend setup

```bash
cd ../client
npm install
```

Create `client/.env.local`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

Start the dev server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`. API requests proxy to `http://localhost:5555` via the Vite config.

### Seed users

| Username | Password |
|----------|----------|
| alice | password123 |
| bob | password123 |
| cora | password123 |
| cookbook | password123 |

The seed creates ~33 recipe posts across 4 users, with realistic attribution chains, comments, follows, and box memberships.

---

## Deployment

### Backend → Render

1. Create a new **Web Service** and connect your GitHub repo.
2. Set **Root Directory** to blank (the `Procfile` at the project root is used).
3. **Build command:** `pip install -r server/requirements.txt`
4. **Start command:** *(auto-read from Procfile)* `cd server && gunicorn "app:create_app()" -b 0.0.0.0:$PORT`
5. Add a **PostgreSQL** database addon — Render sets `DATABASE_URL` automatically.
6. Set environment variables: `SECRET_KEY`, `FLASK_ENV=production`
7. After the first deploy, run via the Render shell:
   ```bash
   flask db upgrade
   python seed.py
   ```
   *(The app also runs `flask db upgrade` automatically on startup via the Procfile.)*

### Frontend → Netlify

1. Create a new site from Git.
2. **Base directory:** `client`
3. **Build command:** `npm run build`
4. **Publish directory:** `client/dist`
5. Set environment variables:
   - `VITE_API_URL` → your Render URL (e.g. `https://cookbook-api.onrender.com`)
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`

`client/public/_redirects` contains `/* /index.html 200` for SPA routing — no additional Netlify configuration needed.

---
