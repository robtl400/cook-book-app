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


user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_brief_schema = UserBriefSchema()
