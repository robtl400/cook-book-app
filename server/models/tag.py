from app import db


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # stored lowercase
    category = db.Column(db.Enum("cuisine", "dietary", name="tag_category_enum"), nullable=False)

    post_tags = db.relationship("PostTag", back_populates="tag", cascade="all, delete-orphan")
