from app import db
from models.post import Post


class RecipePost(Post):
    """
    Extension table for recipe posts (joined-table inheritance from Post).

    source_type tracks how this recipe originated:
      - 'original'  → user's own recipe from scratch
      - 'external'  → scraped/adapted from an external URL
      - 'internal'  → forked from another CookBook post (source_post_id required)
      - 'credit'    → adapted from a non-URL source, credited via source_credit

    inspo_post_id/inspo_user_id allow crediting inspiration separately from
    the direct source (e.g. "inspired by @alice's post but I changed a lot").
    """
    __tablename__ = "recipe_posts"

    id = db.Column(db.Integer, db.ForeignKey("posts.id"), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    cook_time_minutes = db.Column(db.Integer)
    servings = db.Column(db.Integer)
    difficulty = db.Column(db.Enum("easy", "medium", "hard", name="difficulty_enum"))
    self_rating = db.Column(db.Integer, nullable=False)  # 1-5, required; user rates their own cook

    # Attribution fields
    source_type = db.Column(
        db.Enum("external", "internal", "original", "credit", name="source_type_enum"),
        nullable=False,
        default="original",
    )
    source_url = db.Column(db.String(500))          # external URL if scraped
    source_post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))   # internal: the CookBook post it forks
    source_credit = db.Column(db.String(255))       # credit: free-text attribution
    inspo_post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))    # optional inspiration post
    inspo_user_id = db.Column(db.Integer, db.ForeignKey("users.id"))    # optional inspiration user
    parsed_image_url = db.Column(db.String(500))    # image scraped from external URL (may differ from post image_url)

    __mapper_args__ = {
        "polymorphic_identity": "recipe_post",
        # Explicitly list FK columns used for the join so SQLAlchemy doesn't
        # confuse id with source_post_id / inspo_post_id
        "inherit_condition": id == Post.id,
    }

    ingredients = db.relationship(
        "Ingredient", back_populates="recipe_post", cascade="all, delete-orphan", order_by="Ingredient.sort_order"
    )
    steps = db.relationship(
        "Step", back_populates="recipe_post", cascade="all, delete-orphan", order_by="Step.sort_order"
    )
    source_post = db.relationship("Post", foreign_keys=[source_post_id])
    inspo_post = db.relationship("Post", foreign_keys=[inspo_post_id])
    inspo_user = db.relationship("User", foreign_keys=[inspo_user_id])
