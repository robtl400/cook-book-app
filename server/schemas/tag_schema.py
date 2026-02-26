from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app import db
from models.tag import Tag


class TagSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Tag
        load_instance = True
        sqla_session = db.session


tag_schema = TagSchema()
tags_schema = TagSchema(many=True)
