from flask import Blueprint

comment_bp = Blueprint("comments", __name__, url_prefix="/api/posts")

# TODO: GET /api/posts/<post_id>/comments — list comments (nested by parent_id)
# TODO: POST /api/posts/<post_id>/comments — add a comment
# TODO: PATCH /api/posts/<post_id>/comments/<id> — edit comment (owner only)
# TODO: DELETE /api/posts/<post_id>/comments/<id> — delete comment (owner only)
