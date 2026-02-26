from app import db


class Post(db.Model):
    """
    Base table for joined-table inheritance.
    RecipePost extends this. Keeping post_type opens the door to other
    post types (journal, collection) in the future without schema changes.
    """
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_type = db.Column(db.String(50), nullable=False, default="recipe")
    image_url = db.Column(db.String(500))
    description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    __mapper_args__ = {
        "polymorphic_on": post_type,
        "polymorphic_identity": "post",
    }

    user = db.relationship("User", back_populates="posts")
    comments = db.relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    tags = db.relationship("PostTag", back_populates="post", cascade="all, delete-orphan")
    box_entries = db.relationship("BoxPost", back_populates="post", cascade="all, delete-orphan")
