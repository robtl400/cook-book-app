from app import db


class Ingredient(db.Model):
    __tablename__ = "ingredients"

    id = db.Column(db.Integer, primary_key=True)
    recipe_post_id = db.Column(db.Integer, db.ForeignKey("recipe_posts.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False, index=True)
    quantity = db.Column(db.String(50))
    unit = db.Column(db.String(50))
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    recipe_post = db.relationship("RecipePost", back_populates="ingredients")
