from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app import db
from models.recipe_box import RecipeBox


class RecipeBoxSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = RecipeBox
        load_instance = True
        sqla_session = db.session
        include_fk = True


recipe_box_schema = RecipeBoxSchema()
recipe_boxes_schema = RecipeBoxSchema(many=True)
