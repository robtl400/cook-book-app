from app import db


class Follow(db.Model):
    __tablename__ = "follows"

    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    follower = db.relationship("User", foreign_keys=[follower_id], back_populates="following")
    followed = db.relationship("User", foreign_keys=[followed_id], back_populates="followers")
