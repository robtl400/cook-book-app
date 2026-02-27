# CookBook

> **Share what you actually cook.**

CookBook is a social recipe-sharing platform inspired by Letterboxd. Log your cooking, discover recipes from others, track what you want to try, and build an honest record of what lands in your kitchen.

---

## Screenshot

<!-- Add a screenshot of the running app here -->
![CookBook Feed](docs/screenshot.png)

---

## Core Features

- **Recipe Creation** — Write original recipes with ingredients, steps, tags, difficulty, cook time, and ratings. Or paste a URL and let the parser fill in the details automatically.
- **Attribution Chain** — Mark a recipe as original, adapted from a website, forked from another CookBook post, or inspired by something you saw. The full lineage is visible on every post.
- **"I Cooked This"** — Log that you cooked someone else's recipe. Add your own notes, modifications, and rating. Attribution is carried through automatically.
- **Recipe Boxes** — Save recipes to curated collections (Liked, Cooked, Want to Try, or custom boxes you create).
- **Social Feed** — Follow other cooks. Your feed surfaces their recent posts with recency weighting.
- **Explore** — Discover the most-saved and most-cooked recipes from the last 30 days. No account required.
- **Search** — Search by recipe title, ingredient name, or username (`@alice`). Filter by cuisine or dietary tag.
- **Comments** — Threaded comments on every post.
- **Profiles** — Public user profiles with post counts, followers, and tabbed recipe/box views.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Flask, SQLAlchemy (joined-table inheritance), Flask-Login, Flask-CORS |
| Database | PostgreSQL |
| Auth | Flask-Login (server-side sessions, bcrypt passwords) |
| Schemas | marshmallow-sqlalchemy |
| Scraping | recipe-scrapers |
| Frontend | React (Vite), React Router v6, React Hook Form |
| Styling | Tailwind CSS v4 (no config file) |
| Images | Cloudinary (unsigned upload preset) |
| Deploy | Render (backend) + Netlify (frontend) |

---

## Local Development

### Prerequisites

- Python 3.11+ (project uses 3.14)
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
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the **project root** (not `server/`):

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://localhost/cookbook_dev
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

Create the database and run migrations:

```bash
createdb cookbook_dev
FLASK_APP=app.py .venv/bin/flask db upgrade
```

Seed the database:

```bash
python seed.py
```

This creates 4 users (`alice`, `bob`, `cora`, `cookbook` — all password `password123`) and ~33 recipe posts.

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

The frontend runs at `http://localhost:5173`. API requests are proxied to `http://localhost:5555`.

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on Render. Connect your GitHub repo.
2. Set **Root Directory** to blank (uses the `Procfile` at project root).
3. **Build command:** `pip install -r server/requirements.txt`
4. **Start command:** `cd server && gunicorn "app:create_app()" -b 0.0.0.0:$PORT`
5. Add a **PostgreSQL** database addon — Render sets `DATABASE_URL` automatically.
6. Set environment variables: `SECRET_KEY`, `FLASK_ENV=production`
7. After first deploy: run `flask db upgrade` and `python seed.py` via Render shell.

### Frontend → Netlify

1. Create a new site from Git on Netlify.
2. **Base directory:** `client`
3. **Build command:** `npm run build`
4. **Publish directory:** `client/dist`
5. Set environment variables:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://cookbook-api.onrender.com`)
   - `VITE_CLOUDINARY_CLOUD_NAME` → your Cloudinary cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET` → your unsigned upload preset

---

## Deployed App

🔗 **[cookbook.netlify.app](https://cookbook.netlify.app)** ← replace with real URL after deploy
