from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from sqlalchemy import func, or_

from app import db
from models.post import Post
from models.recipe_post import RecipePost
from models.ingredient import Ingredient
from models.tag import Tag
from models.post_tag import PostTag
from models.box_post import BoxPost
from models.recipe_box import RecipeBox
from models.user import User
from schemas.recipe_post_schema import recipe_posts_list_schema
from schemas.user_schema import users_schema
from utils import get_pagination

search_bp = Blueprint("search", __name__, url_prefix="/api/search")
explore_bp = Blueprint("explore", __name__, url_prefix="/api")


# ---------------------------------------------------------------------------
# Recipe search — title + ingredient name
# ---------------------------------------------------------------------------

@search_bp.get("/recipes")
def search_recipes():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"error": "q parameter is required", "message": "Failed"}), 400

    limit, offset = get_pagination()
    like = f"%{q}%"

    # Posts matching title
    title_ids = (
        db.session.query(RecipePost.id)
        .filter(RecipePost.title.ilike(like))
    )

    # Posts matching an ingredient name
    ingredient_ids = (
        db.session.query(Ingredient.recipe_post_id)
        .filter(Ingredient.name.ilike(like))
    )

    all_ids = title_ids.union(ingredient_ids).subquery()

    # RecipePost.query already joins `posts` via polymorphic inheritance
    posts = (
        RecipePost.query
        .filter(RecipePost.id.in_(db.session.query(all_ids)))
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return jsonify({"data": recipe_posts_list_schema.dump(posts), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# Tag filter — posts with a given tag name (and optional category)
# ---------------------------------------------------------------------------

@search_bp.get("/tags")
def search_by_tag():
    tag_name = (request.args.get("tag") or "").strip().lower()
    category = (request.args.get("category") or "").strip().lower() or None

    if not tag_name:
        return jsonify({"error": "tag parameter is required", "message": "Failed"}), 400

    limit, offset = get_pagination()

    tag_q = Tag.query.filter(Tag.name.ilike(f"%{tag_name}%"))
    if category:
        tag_q = tag_q.filter(Tag.category == category)
    tags = tag_q.all()

    if not tags:
        return jsonify({"data": [], "message": "Success"}), 200

    tag_ids = [t.id for t in tags]
    post_ids_q = (
        db.session.query(PostTag.post_id)
        .filter(PostTag.tag_id.in_(tag_ids))
        .subquery()
    )

    # RecipePost.query already joins `posts` via polymorphic inheritance
    posts = (
        RecipePost.query
        .filter(RecipePost.id.in_(db.session.query(post_ids_q)))
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return jsonify({"data": recipe_posts_list_schema.dump(posts), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# User search
# ---------------------------------------------------------------------------

@search_bp.get("/users")
def search_users():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"error": "q parameter is required", "message": "Failed"}), 400

    limit, offset = get_pagination()
    like = f"%{q}%"

    users = (
        User.query
        .filter(or_(
            User.display_name.ilike(like),
            User.username.ilike(like),
        ))
        .offset(offset)
        .limit(limit)
        .all()
    )
    return jsonify({"data": users_schema.dump(users), "message": "Success"}), 200


# ---------------------------------------------------------------------------
# Explore — single sorted list of 12 recipes
# ---------------------------------------------------------------------------

@explore_bp.get("/explore")
def explore():
    sort = request.args.get("sort", "recent")
    limit = 12
    cutoff = datetime.utcnow() - timedelta(days=30)

    if sort == "most_saved":
        rows = (
            db.session.query(BoxPost.post_id, func.count(BoxPost.post_id).label("save_count"))
            .filter(BoxPost.added_at >= cutoff)
            .group_by(BoxPost.post_id)
            .order_by(func.count(BoxPost.post_id).desc())
            .limit(limit)
            .all()
        )
        ids = [r.post_id for r in rows]
        posts_map = {p.id: p for p in RecipePost.query.filter(RecipePost.id.in_(ids)).all()}
        posts = [posts_map[pid] for pid in ids if pid in posts_map]

    elif sort == "most_cooked":
        rows = (
            db.session.query(BoxPost.post_id, func.count(BoxPost.post_id).label("cook_count"))
            .join(RecipeBox, RecipeBox.id == BoxPost.box_id)
            .filter(RecipeBox.box_type == "cooked", BoxPost.added_at >= cutoff)
            .group_by(BoxPost.post_id)
            .order_by(func.count(BoxPost.post_id).desc())
            .limit(limit)
            .all()
        )
        ids = [r.post_id for r in rows]
        posts_map = {p.id: p for p in RecipePost.query.filter(RecipePost.id.in_(ids)).all()}
        posts = [posts_map[pid] for pid in ids if pid in posts_map]

    else:  # recent (default)
        posts = RecipePost.query.order_by(Post.created_at.desc()).limit(limit).all()

    return jsonify({
        "data": {"posts": recipe_posts_list_schema.dump(posts)},
        "message": "Success",
    }), 200
