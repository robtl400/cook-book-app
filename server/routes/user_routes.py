from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from app import db
from models.user import User
from models.recipe_post import RecipePost
from models.post import Post
from models.recipe_box import RecipeBox
from models.follow import Follow
from schemas.user_schema import user_profile_schema, users_schema
from schemas.recipe_post_schema import recipe_posts_list_schema
from schemas.recipe_box_schema import recipe_boxes_schema

user_bp = Blueprint("users", __name__, url_prefix="/api/users")


def _get_pagination():
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = int(request.args.get("offset", 0))
    return limit, offset


# ---------------------------------------------------------------------------
# Public profile
# ---------------------------------------------------------------------------

@user_bp.get("/<int:user_id>")
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found", "message": "Failed"}), 404
    return jsonify({"data": user_profile_schema.dump(user), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# Update own profile
# ---------------------------------------------------------------------------

@user_bp.patch("/<int:user_id>")
@login_required
def update_user(user_id):
    if current_user.id != user_id:
        return jsonify({"error": "Forbidden", "message": "Failed"}), 403

    user = db.session.get(User, user_id)
    data = request.get_json() or {}

    for field in ("display_name", "bio", "profile_image_url"):
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify({"data": user_profile_schema.dump(user), "message": "Profile updated"}), 200


# ---------------------------------------------------------------------------
# User's posts (paginated)
# ---------------------------------------------------------------------------

@user_bp.get("/<int:user_id>/posts")
def get_user_posts(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found", "message": "Failed"}), 404

    limit, offset = _get_pagination()
    # RecipePost.query already joins `posts` via polymorphic inheritance — no explicit join needed
    posts = (
        RecipePost.query
        .filter(Post.user_id == user_id)
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return jsonify({"data": recipe_posts_list_schema.dump(posts), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# User's boxes
# ---------------------------------------------------------------------------

@user_bp.get("/<int:user_id>/boxes")
def get_user_boxes(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found", "message": "Failed"}), 404

    boxes = RecipeBox.query.filter_by(user_id=user_id).all()
    return jsonify({"data": recipe_boxes_schema.dump(boxes), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# Follow
# ---------------------------------------------------------------------------

@user_bp.post("/<int:user_id>/follow")
@login_required
def follow_user(user_id):
    if user_id == current_user.id:
        return jsonify({"error": "Cannot follow yourself", "message": "Failed"}), 409

    target = db.session.get(User, user_id)
    if not target:
        return jsonify({"error": "User not found", "message": "Failed"}), 404

    existing = Follow.query.filter_by(follower_id=current_user.id, followed_id=user_id).first()
    if existing:
        return jsonify({"error": "Already following this user", "message": "Failed"}), 409

    db.session.add(Follow(follower_id=current_user.id, followed_id=user_id))
    db.session.commit()
    return jsonify({"data": {"follower_id": current_user.id, "followed_id": user_id}, "message": "Followed"}), 201


# ---------------------------------------------------------------------------
# Unfollow
# ---------------------------------------------------------------------------

@user_bp.delete("/<int:user_id>/follow")
@login_required
def unfollow_user(user_id):
    follow = Follow.query.filter_by(follower_id=current_user.id, followed_id=user_id).first()
    if not follow:
        return jsonify({"error": "Not following this user", "message": "Failed"}), 404

    db.session.delete(follow)
    db.session.commit()
    return jsonify({"data": None, "message": "Unfollowed"}), 200


# ---------------------------------------------------------------------------
# Followers list
# ---------------------------------------------------------------------------

@user_bp.get("/<int:user_id>/followers")
def get_followers(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found", "message": "Failed"}), 404

    followers = [f.follower for f in user.followers]
    return jsonify({"data": users_schema.dump(followers), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# Following list
# ---------------------------------------------------------------------------

@user_bp.get("/<int:user_id>/following")
def get_following(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found", "message": "Failed"}), 404

    following = [f.followed for f in user.following]
    return jsonify({"data": users_schema.dump(following), "message": "Success"}), 200
