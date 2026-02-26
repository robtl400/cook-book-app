from app import db


class RecipeBox(db.Model):
    """
    A user's named collection of saved recipe posts (like a Letterboxd list).
    Three default boxes are auto-created on registration: liked, cooked, want_to_try.
    Users can also create unlimited custom boxes.
    """
    __tablename__ = "recipe_boxes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_default = db.Column(db.Boolean, nullable=False, default=False)
    box_type = db.Column(
        db.Enum("liked", "cooked", "want_to_try", "custom", name="box_type_enum"),
        nullable=False,
        default="custom",
    )
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship("User", back_populates="recipe_boxes")
    entries = db.relationship("BoxPost", back_populates="recipe_box", cascade="all, delete-orphan")
