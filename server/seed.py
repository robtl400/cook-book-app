"""
Seed script: populates the database from seed_data/ files.
Run from the server/ directory:  python seed.py
Requires the Flask app + DB to be configured (DATABASE_URL in .env).
"""
import random
from datetime import datetime, timedelta

from app import create_app, db
from models.user import User
from models.post import Post
from models.recipe_post import RecipePost
from models.ingredient import Ingredient
from models.step import Step
from models.tag import Tag
from models.post_tag import PostTag
from models.recipe_box import RecipeBox
from models.box_post import BoxPost
from models.comment import Comment
from models.follow import Follow

from seed_data.users import USERS
from seed_data.tags import TAGS
from seed_data.recipes_rob import RECIPES as ROB_RECIPES
from seed_data.recipes_friends import RECIPES as FRIEND_RECIPES
from seed_data.recipes_external import RECIPES as EXTERNAL_RECIPES
from seed_data.social import MUTUAL_FOLLOWS, FOLLOWS, BOX_SAVES, COMMENTS

app = create_app()


# ── Helpers ───────────────────────────────────────────────────────────────────

def clear_data():
    """Delete all rows in a safe order (respect FK constraints)."""
    print("Clearing existing data...")
    Follow.query.delete()
    BoxPost.query.delete()
    PostTag.query.delete()
    Comment.query.delete()
    Ingredient.query.delete()
    Step.query.delete()
    RecipeBox.query.delete()
    RecipePost.query.delete()
    Post.query.delete()
    Tag.query.delete()
    User.query.delete()
    db.session.commit()


def make_default_boxes(user):
    boxes = [
        RecipeBox(user_id=user.id, name="My Recipe Box", box_type="liked",        is_default=True),
        RecipeBox(user_id=user.id, name="Cooked",       box_type="cooked",       is_default=True),
        RecipeBox(user_id=user.id, name="Want to Try",  box_type="want_to_try",  is_default=True),
    ]
    db.session.add_all(boxes)
    return boxes


# ── Seeders ───────────────────────────────────────────────────────────────────

def seed_tags():
    """Create tags from seed_data/tags.py. Returns {name: Tag} map."""
    tags = [Tag(name=t["name"], category=t["category"]) for t in TAGS]
    db.session.add_all(tags)
    db.session.flush()
    return {t.name: t for t in tags}


def seed_users():
    """Create users + default/custom boxes from seed_data/users.py.
    Returns {username: User} map."""
    users_map = {}
    for u in USERS:
        user = User(
            email=u["email"],
            username=u["username"],
            display_name=u["display_name"],
            bio=u.get("bio", ""),
            profile_image_url=u.get("profile_image_url"),
        )
        user.set_password(u["password"])
        db.session.add(user)
        db.session.flush()

        make_default_boxes(user)

        for box_def in u.get("custom_boxes", []):
            db.session.add(RecipeBox(
                user_id=user.id,
                name=box_def["name"],
                box_type=box_def.get("box_type", "custom"),
                is_default=False,
            ))

        users_map[user.username] = user

    return users_map


def _random_created_at():
    """Return a random datetime within the past 180 days."""
    days_ago = random.randint(0, 180)
    seconds_offset = random.randint(0, 86400)
    return datetime.now() - timedelta(days=days_ago, seconds=seconds_offset)


def _create_recipe(data, users_map, tags_map):
    """Create one RecipePost (+ ingredients, steps, tags) from a recipe dict."""
    author = users_map[data["author"]]
    post = RecipePost(
        user_id=author.id,
        post_type="recipe_post",
        title=data["title"],
        created_at=_random_created_at(),
        description=data.get("description", ""),
        cook_time_minutes=data.get("cook_time_minutes"),
        servings=data.get("servings"),
        difficulty=data.get("difficulty"),
        self_rating=data.get("self_rating", 4),
        source_type=data.get("source_type", "original"),
        source_url=data.get("source_url"),
        source_credit=data.get("source_credit"),
        image_url=data.get("image_url"),
    )
    db.session.add(post)
    db.session.flush()

    for i, ing in enumerate(data.get("ingredients", [])):
        db.session.add(Ingredient(
            recipe_post_id=post.id,
            name=ing["name"],
            quantity=ing.get("quantity", ""),
            unit=ing.get("unit", ""),
            sort_order=i,
        ))

    for i, step_body in enumerate(data.get("steps", [])):
        db.session.add(Step(recipe_post_id=post.id, body=step_body, sort_order=i))

    for tag_name in data.get("tags", []):
        tag = tags_map.get(tag_name)
        if tag:
            db.session.add(PostTag(post_id=post.id, tag_id=tag.id))
        else:
            print(f"  WARNING: tag '{tag_name}' not found in tags.py — skipped for '{data['title']}'")

    return post


def seed_recipes(users_map, tags_map):
    """Create all recipes from all recipe files. Returns {title: post} map."""
    all_recipes = ROB_RECIPES + FRIEND_RECIPES + EXTERNAL_RECIPES
    posts_map = {}
    for recipe in all_recipes:
        post = _create_recipe(recipe, users_map, tags_map)
        posts_map[post.title] = post
    return posts_map


def seed_social(users_map, posts_map):
    """Create follows, box saves, and comments from seed_data/social.py."""

    # Mutual follows — every user in the list follows every other
    for follower_username in MUTUAL_FOLLOWS:
        for followed_username in MUTUAL_FOLLOWS:
            if follower_username == followed_username:
                continue
            follower = users_map.get(follower_username)
            followed = users_map.get(followed_username)
            if follower and followed:
                db.session.add(Follow(follower_id=follower.id, followed_id=followed.id))

    # Additional asymmetric follows
    for follower_username, followed_username in FOLLOWS:
        follower = users_map.get(follower_username)
        followed = users_map.get(followed_username)
        if follower and followed and follower.id != followed.id:
            db.session.add(Follow(follower_id=follower.id, followed_id=followed.id))

    db.session.flush()

    # Box saves
    # Build box lookup: {(user_id, box_type_or_name): RecipeBox}
    all_boxes = RecipeBox.query.all()
    box_lookup = {}
    for box in all_boxes:
        box_lookup[(box.user_id, box.box_type)] = box   # default boxes by type
        box_lookup[(box.user_id, box.name.lower())] = box  # custom boxes by name

    # Track which posts are already added to each user's Recipe Box to avoid duplicates
    recipe_box_posts = {}  # {user_id: set(post_id)}

    for username, box_key, recipe_title in BOX_SAVES:
        user = users_map.get(username)
        post = posts_map.get(recipe_title)
        if not user or not post:
            print(f"  WARNING: box save skipped — user='{username}' post='{recipe_title}'")
            continue
        box = box_lookup.get((user.id, box_key)) or box_lookup.get((user.id, box_key.lower()))
        if not box:
            print(f"  WARNING: box '{box_key}' not found for user '{username}' — skipped")
            continue
        db.session.add(BoxPost(box_id=box.id, post_id=post.id))

        # Track Recipe Box saves
        if box.box_type == "liked":
            recipe_box_posts.setdefault(user.id, set()).add(post.id)

    # Backfill: ensure every sub-box save also exists in Recipe Box
    for username, box_key, recipe_title in BOX_SAVES:
        user = users_map.get(username)
        post = posts_map.get(recipe_title)
        if not user or not post:
            continue
        box = box_lookup.get((user.id, box_key)) or box_lookup.get((user.id, box_key.lower()))
        if not box or box.box_type == "liked":
            continue  # skip Recipe Box itself and unknown boxes
        recipe_box = box_lookup.get((user.id, "liked"))
        if not recipe_box:
            continue
        if post.id not in recipe_box_posts.get(user.id, set()):
            db.session.add(BoxPost(box_id=recipe_box.id, post_id=post.id))
            recipe_box_posts.setdefault(user.id, set()).add(post.id)

    # Comments
    for c in COMMENTS:
        user = users_map.get(c["author"])
        post = posts_map.get(c["post_title"])
        if not user or not post:
            print(f"  WARNING: comment skipped — author='{c['author']}' post='{c['post_title']}'")
            continue
        db.session.add(Comment(user_id=user.id, post_id=post.id, body=c["body"]))


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    with app.app_context():
        clear_data()

        print("Seeding tags...")
        tags_map = seed_tags()

        print("Seeding users + boxes...")
        users_map = seed_users()

        print("Seeding recipes...")
        posts_map = seed_recipes(users_map, tags_map)

        print("Seeding follows, box saves, comments...")
        seed_social(users_map, posts_map)

        db.session.commit()

        print("\nDone! Database seeded successfully.")
        print(f"  Users:   {', '.join(users_map.keys())} (password: password123)")
        print(f"  Recipes: {len(posts_map)} total")


if __name__ == "__main__":
    main()
