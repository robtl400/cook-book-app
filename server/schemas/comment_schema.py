from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from app import db
from models.comment import Comment
from schemas.user_schema import UserBriefSchema


class CommentSchema(SQLAlchemyAutoSchema):
    user = fields.Nested(UserBriefSchema, dump_only=True)

    class Meta:
        model = Comment
        load_instance = True
        sqla_session = db.session
        include_fk = True


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)
