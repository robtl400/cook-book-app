from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from app import db
from models.user import User


class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        sqla_session = db.session
        exclude = ("password_hash",)


class UserBriefSchema(SQLAlchemyAutoSchema):
    """Lightweight schema for embedding user info in feed cards and comments."""
    class Meta:
        model = User
        load_instance = True
        sqla_session = db.session
        fields = ("id", "username", "display_name", "profile_image_url")


class UserProfileSchema(SQLAlchemyAutoSchema):
    """Full profile schema with computed counts."""
    post_count = fields.Method("get_post_count", dump_only=True)
    follower_count = fields.Method("get_follower_count", dump_only=True)
    following_count = fields.Method("get_following_count", dump_only=True)

    def get_post_count(self, obj):
        return len(obj.posts)

    def get_follower_count(self, obj):
        return len(obj.followers)

    def get_following_count(self, obj):
        return len(obj.following)

    class Meta:
        model = User
        load_instance = True
        sqla_session = db.session
        exclude = ("password_hash",)


user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_brief_schema = UserBriefSchema()
user_profile_schema = UserProfileSchema()
