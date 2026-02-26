from app import db


class PostTag(db.Model):
    __tablename__ = "post_tags"

    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey("tags.id"), primary_key=True)

    post = db.relationship("Post", back_populates="tags")
    tag = db.relationship("Tag", back_populates="post_tags")
