from flask import Blueprint

recipe_box_bp = Blueprint("recipe_boxes", __name__, url_prefix="/api/boxes")

# TODO: GET /api/boxes — current user's boxes
# TODO: POST /api/boxes — create a custom box
# TODO: GET /api/boxes/<id> — box detail with posts
# TODO: PATCH /api/boxes/<id> — edit box (owner only)
# TODO: DELETE /api/boxes/<id> — delete box (owner only, non-default only)
# TODO: POST /api/boxes/<id>/posts — save a post to this box
# TODO: DELETE /api/boxes/<id>/posts/<post_id> — remove a post from this box
