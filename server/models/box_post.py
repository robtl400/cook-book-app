from app import db


class BoxPost(db.Model):
    """Junction table: a post saved to a recipe box."""
    __tablename__ = "box_posts"

    box_id = db.Column(db.Integer, db.ForeignKey("recipe_boxes.id"), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), primary_key=True)
    added_at = db.Column(db.DateTime, server_default=db.func.now())

    recipe_box = db.relationship("RecipeBox", back_populates="entries")
    post = db.relationship("Post", back_populates="box_entries")
