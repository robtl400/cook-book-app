from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app import db
from models.ingredient import Ingredient


class IngredientSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Ingredient
        load_instance = True
        sqla_session = db.session
        exclude = ("recipe_post_id",)


ingredient_schema = IngredientSchema()
ingredients_schema = IngredientSchema(many=True)
