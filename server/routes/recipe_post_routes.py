from flask import Blueprint

recipe_post_bp = Blueprint("recipe_posts", __name__, url_prefix="/api/posts")

# TODO: GET /api/posts — global feed (paginated)
# TODO: POST /api/posts — create recipe post
# TODO: GET /api/posts/<id> — single post detail
# TODO: PATCH /api/posts/<id> — edit post (owner only)
# TODO: DELETE /api/posts/<id> — delete post (owner only)
# TODO: POST /api/posts/<id>/fork — "I Cooked" fork
# TODO: GET /api/posts/parse — scrape recipe from URL
