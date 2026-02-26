from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import case, func, literal

from app import db
from models.post import Post
from models.recipe_post import RecipePost
from models.ingredient import Ingredient
from models.step import Step
from models.tag import Tag
from models.post_tag import PostTag
from models.box_post import BoxPost
from models.recipe_box import RecipeBox
from models.comment import Comment
from schemas.recipe_post_schema import (
    recipe_post_detail_schema,
    recipe_posts_list_schema,
)
from schemas.comment_schema import comment_schema, comments_schema

recipe_post_bp = Blueprint("recipe_posts", __name__, url_prefix="/api/posts")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_pagination():
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = int(request.args.get("offset", 0))
    return limit, offset


def _resolve_tags(tag_data):
    """
    Return Tag objects for the given tag data.
    Accepts a list of strings (look up by name only) or
    dicts with {name, category} (create if not found).
    """
    tags = []
    for item in tag_data:
        if isinstance(item, str):
            name = item.strip().lower()
            if not name:
                continue
            tag = Tag.query.filter_by(name=name).first()
            if tag:
                tags.append(tag)
            # Skip unknown tag names — category required to create new tags
        elif isinstance(item, dict):
            name = (item.get("name") or "").strip().lower()
            category = item.get("category", "cuisine")
            if not name:
                continue
            tag = Tag.query.filter_by(name=name).first()
            if not tag:
                tag = Tag(name=name, category=category)
                db.session.add(tag)
                db.session.flush()
            tags.append(tag)
    return tags


# ---------------------------------------------------------------------------
# Create recipe post
# ---------------------------------------------------------------------------

@recipe_post_bp.post("/recipe")
@login_required
def create_recipe():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "message": "Failed"}), 400

    # Required fields
    if not data.get("title") or data.get("self_rating") is None:
        return jsonify({"error": "title and self_rating are required", "message": "Failed"}), 400

    source_type = data.get("source_type", "original")
    if source_type not in ("original", "external", "internal", "credit"):
        return jsonify({"error": "Invalid source_type", "message": "Failed"}), 400

    # With joined-table inheritance, creating RecipePost directly inserts into
    # both `posts` and `recipe_posts` tables — do NOT create a Post separately.
    recipe_post = RecipePost(
        user_id=current_user.id,
        post_type="recipe_post",
        image_url=data.get("image_url"),
        description=data.get("description"),
        title=data["title"],
        cook_time_minutes=data.get("cook_time_minutes"),
        servings=data.get("servings"),
        difficulty=data.get("difficulty"),
        self_rating=int(data["self_rating"]),
        source_type=source_type,
        source_url=data.get("source_url"),
        source_post_id=data.get("source_post_id"),
        source_credit=data.get("source_credit"),
        inspo_post_id=data.get("inspo_post_id"),
        inspo_user_id=data.get("inspo_user_id"),
        parsed_image_url=data.get("parsed_image_url"),
    )
    db.session.add(recipe_post)
    db.session.flush()  # get recipe_post.id

    # Ingredients
    for i, ing in enumerate(data.get("ingredients", [])):
        db.session.add(Ingredient(
            recipe_post_id=recipe_post.id,
            name=ing.get("name", ""),
            quantity=ing.get("quantity"),
            unit=ing.get("unit"),
            sort_order=ing.get("sort_order", i),
        ))

    # Steps
    for i, step in enumerate(data.get("steps", [])):
        db.session.add(Step(
            recipe_post_id=recipe_post.id,
            body=step.get("body", ""),
            sort_order=step.get("sort_order", i),
        ))

    # Tags
    for tag in _resolve_tags(data.get("tags", [])):
        db.session.add(PostTag(post_id=recipe_post.id, tag_id=tag.id))

    db.session.commit()
    db.session.refresh(recipe_post)
    return jsonify({"data": recipe_post_detail_schema.dump(recipe_post), "message": "Post created"}), 201


# ---------------------------------------------------------------------------
# Feed
# ---------------------------------------------------------------------------

@recipe_post_bp.get("/feed")
@login_required
def feed():
    limit, offset = _get_pagination()
    followed_ids = [f.followed_id for f in current_user.following]

    if followed_ids:
        weight = case((Post.user_id.in_(followed_ids), 2), else_=1)
    else:
        weight = literal(1)

    score = weight * func.extract("epoch", Post.created_at)

    # RecipePost.query already joins `posts` via polymorphic inheritance — no explicit join needed
    posts = (
        RecipePost.query
        .order_by(score.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return jsonify({"data": recipe_posts_list_schema.dump(posts), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# "I Cooked" — return source post data ready to pre-populate a form
# ---------------------------------------------------------------------------

@recipe_post_bp.get("/recipe/cook/<int:post_id>")
@login_required
def cook_data(post_id):
    source = db.session.get(RecipePost, post_id)
    if not source:
        return jsonify({"error": "Post not found", "message": "Failed"}), 404

    post_data = recipe_post_detail_schema.dump(source)

    # Attribution passthrough logic
    if source.source_type == "external":
        attribution = {"source_type": "external", "source_url": source.source_url}
    elif source.source_type == "internal":
        attribution = {"source_type": "internal", "source_post_id": source.source_post_id}
    elif source.source_type == "credit":
        attribution = {"source_type": "credit", "source_credit": source.source_credit}
    else:  # "original"
        attribution = {"source_type": "internal", "source_post_id": source.id}

    attribution["inspo_post_id"] = source.id

    return jsonify({
        "data": {**post_data, "attribution": attribution},
        "message": "Success",
    }), 200


# ---------------------------------------------------------------------------
# Single post detail
# ---------------------------------------------------------------------------

@recipe_post_bp.get("/<int:post_id>")
def get_post(post_id):
    post = db.session.get(RecipePost, post_id)
    if not post:
        return jsonify({"error": "Post not found", "message": "Failed"}), 404
    return jsonify({"data": recipe_post_detail_schema.dump(post), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# Update post (owner only)
# ---------------------------------------------------------------------------

@recipe_post_bp.patch("/<int:post_id>")
@login_required
def update_post(post_id):
    recipe_post = db.session.get(RecipePost, post_id)
    if not recipe_post:
        return jsonify({"error": "Post not found", "message": "Failed"}), 404
    if recipe_post.user_id != current_user.id:
        return jsonify({"error": "Forbidden", "message": "Failed"}), 403

    data = request.get_json() or {}

    # Update Post fields
    for field in ("image_url", "description"):
        if field in data:
            setattr(recipe_post, field, data[field])

    # Update RecipePost fields
    recipe_fields = (
        "title", "cook_time_minutes", "servings", "difficulty", "self_rating",
        "source_type", "source_url", "source_post_id", "source_credit",
        "inspo_post_id", "inspo_user_id", "parsed_image_url",
    )
    for field in recipe_fields:
        if field in data:
            setattr(recipe_post, field, data[field])

    # Replace ingredients if provided
    if "ingredients" in data:
        Ingredient.query.filter_by(recipe_post_id=post_id).delete()
        for i, ing in enumerate(data["ingredients"]):
            db.session.add(Ingredient(
                recipe_post_id=post_id,
                name=ing.get("name", ""),
                quantity=ing.get("quantity"),
                unit=ing.get("unit"),
                sort_order=ing.get("sort_order", i),
            ))

    # Replace steps if provided
    if "steps" in data:
        Step.query.filter_by(recipe_post_id=post_id).delete()
        for i, step in enumerate(data["steps"]):
            db.session.add(Step(
                recipe_post_id=post_id,
                body=step.get("body", ""),
                sort_order=step.get("sort_order", i),
            ))

    # Replace tags if provided
    if "tags" in data:
        PostTag.query.filter_by(post_id=post_id).delete()
        for tag in _resolve_tags(data["tags"]):
            db.session.add(PostTag(post_id=post_id, tag_id=tag.id))

    db.session.commit()
    db.session.refresh(recipe_post)
    return jsonify({"data": recipe_post_detail_schema.dump(recipe_post), "message": "Post updated"}), 200


# ---------------------------------------------------------------------------
# Delete post (owner only)
# ---------------------------------------------------------------------------

@recipe_post_bp.delete("/<int:post_id>")
@login_required
def delete_post(post_id):
    recipe_post = db.session.get(RecipePost, post_id)
    if not recipe_post:
        return jsonify({"error": "Post not found", "message": "Failed"}), 404
    if recipe_post.user_id != current_user.id:
        return jsonify({"error": "Forbidden", "message": "Failed"}), 403

    # Null out references from other posts before deleting
    RecipePost.query.filter_by(source_post_id=post_id).update({"source_post_id": None})
    RecipePost.query.filter_by(inspo_post_id=post_id).update({"inspo_post_id": None})
    db.session.flush()

    db.session.delete(recipe_post)
    db.session.commit()
    return jsonify({"data": None, "message": "Post deleted"}), 200


# ---------------------------------------------------------------------------
# Save post to a box
# ---------------------------------------------------------------------------

@recipe_post_bp.post("/<int:post_id>/save")
@login_required
def save_post(post_id):
    data = request.get_json() or {}
    box_id = data.get("box_id")
    if not box_id:
        return jsonify({"error": "box_id is required", "message": "Failed"}), 400

    box = db.session.get(RecipeBox, box_id)
    if not box or box.user_id != current_user.id:
        return jsonify({"error": "Box not found or not yours", "message": "Failed"}), 404

    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Post not found", "message": "Failed"}), 404

    existing = BoxPost.query.filter_by(box_id=box_id, post_id=post_id).first()
    if existing:
        return jsonify({"error": "Post already in this box", "message": "Failed"}), 409

    db.session.add(BoxPost(box_id=box_id, post_id=post_id))
    db.session.commit()
    return jsonify({"data": {"box_id": box_id, "post_id": post_id}, "message": "Saved"}), 201


# ---------------------------------------------------------------------------
# Remove post from a box
# ---------------------------------------------------------------------------

@recipe_post_bp.delete("/<int:post_id>/save/<int:box_id>")
@login_required
def unsave_post(post_id, box_id):
    box = db.session.get(RecipeBox, box_id)
    if not box or box.user_id != current_user.id:
        return jsonify({"error": "Box not found or not yours", "message": "Failed"}), 404

    entry = BoxPost.query.filter_by(box_id=box_id, post_id=post_id).first()
    if not entry:
        return jsonify({"error": "Post not in this box", "message": "Failed"}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"data": None, "message": "Removed from box"}), 200


# ---------------------------------------------------------------------------
# Comments
# ---------------------------------------------------------------------------

@recipe_post_bp.get("/<int:post_id>/comments")
def get_comments(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Post not found", "message": "Failed"}), 404
    top_level = Comment.query.filter_by(post_id=post_id, parent_id=None).order_by(Comment.created_at).all()
    return jsonify({"data": comments_schema.dump(top_level), "message": "Success"}), 200


@recipe_post_bp.post("/<int:post_id>/comments")
@login_required
def add_comment(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Post not found", "message": "Failed"}), 404

    data = request.get_json() or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "Comment body is required", "message": "Failed"}), 400

    comment = Comment(
        user_id=current_user.id,
        post_id=post_id,
        parent_id=data.get("parent_id"),
        body=body,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({"data": comment_schema.dump(comment), "message": "Comment added"}), 201
