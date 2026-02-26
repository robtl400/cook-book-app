from app import db


class Step(db.Model):
    __tablename__ = "steps"

    id = db.Column(db.Integer, primary_key=True)
    recipe_post_id = db.Column(db.Integer, db.ForeignKey("recipe_posts.id"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    recipe_post = db.relationship("RecipePost", back_populates="steps")
