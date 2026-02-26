from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from app import db
from models.comment import Comment
from schemas.user_schema import UserBriefSchema


class CommentSchema(SQLAlchemyAutoSchema):
    user = fields.Nested(UserBriefSchema, dump_only=True)
    replies = fields.Method("get_replies", dump_only=True)

    def get_replies(self, obj):
        # One level deep only — avoid infinite nesting
        return CommentSchema(many=True, exclude=("replies",)).dump(obj.replies)

    class Meta:
        model = Comment
        load_instance = True
        sqla_session = db.session
        include_fk = True


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)
