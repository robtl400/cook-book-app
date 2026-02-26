from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from models.recipe_box import RecipeBox
from models.box_post import BoxPost
from models.recipe_post import RecipePost
from models.post import Post
from schemas.recipe_box_schema import recipe_box_schema, recipe_boxes_schema
from schemas.recipe_post_schema import recipe_posts_list_schema

recipe_box_bp = Blueprint("recipe_boxes", __name__, url_prefix="/api/boxes")


def _get_pagination():
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = int(request.args.get("offset", 0))
    return limit, offset


# ---------------------------------------------------------------------------
# Create a custom box
# ---------------------------------------------------------------------------

@recipe_box_bp.post("")
@login_required
def create_box():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required", "message": "Failed"}), 400

    box = RecipeBox(
        user_id=current_user.id,
        name=name,
        description=data.get("description"),
        is_default=False,
        box_type="custom",
    )
    db.session.add(box)
    db.session.commit()
    return jsonify({"data": recipe_box_schema.dump(box), "message": "Box created"}), 201


# ---------------------------------------------------------------------------
# Get box with paginated posts
# ---------------------------------------------------------------------------

@recipe_box_bp.get("/<int:box_id>")
def get_box(box_id):
    box = db.session.get(RecipeBox, box_id)
    if not box:
        return jsonify({"error": "Box not found", "message": "Failed"}), 404

    limit, offset = _get_pagination()

    # Get recipe posts saved to this box, ordered by when they were added
    entries = (
        BoxPost.query
        .filter_by(box_id=box_id)
        .order_by(BoxPost.added_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    post_ids = [e.post_id for e in entries]
    posts = RecipePost.query.filter(RecipePost.id.in_(post_ids)).all() if post_ids else []
    # Preserve order
    post_map = {p.id: p for p in posts}
    ordered_posts = [post_map[pid] for pid in post_ids if pid in post_map]

    return jsonify({
        "data": {
            "box": recipe_box_schema.dump(box),
            "posts": recipe_posts_list_schema.dump(ordered_posts),
        },
        "message": "Success",
    }), 200


# ---------------------------------------------------------------------------
# Update box (owner only)
# ---------------------------------------------------------------------------

@recipe_box_bp.patch("/<int:box_id>")
@login_required
def update_box(box_id):
    box = db.session.get(RecipeBox, box_id)
    if not box:
        return jsonify({"error": "Box not found", "message": "Failed"}), 404
    if box.user_id != current_user.id:
        return jsonify({"error": "Forbidden", "message": "Failed"}), 403

    data = request.get_json() or {}
    for field in ("name", "description"):
        if field in data:
            setattr(box, field, data[field])

    db.session.commit()
    return jsonify({"data": recipe_box_schema.dump(box), "message": "Box updated"}), 200


# ---------------------------------------------------------------------------
# Delete box (owner only, non-default only)
# ---------------------------------------------------------------------------

@recipe_box_bp.delete("/<int:box_id>")
@login_required
def delete_box(box_id):
    box = db.session.get(RecipeBox, box_id)
    if not box:
        return jsonify({"error": "Box not found", "message": "Failed"}), 404
    if box.user_id != current_user.id:
        return jsonify({"error": "Forbidden", "message": "Failed"}), 403
    if box.is_default:
        return jsonify({"error": "Cannot delete a default box", "message": "Failed"}), 403

    BoxPost.query.filter_by(box_id=box_id).delete()
    db.session.delete(box)
    db.session.commit()
    return jsonify({"data": None, "message": "Box deleted"}), 200
