from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from app import db
from models.recipe_post import RecipePost
from schemas.user_schema import UserBriefSchema
from schemas.ingredient_schema import IngredientSchema
from schemas.step_schema import StepSchema
from schemas.tag_schema import TagSchema


class RecipePostListSchema(SQLAlchemyAutoSchema):
    """
    Lightweight schema for feed cards.
    Excludes nested ingredients and steps to keep list responses fast.
    """
    user = fields.Nested(UserBriefSchema, dump_only=True)

    class Meta:
        model = RecipePost
        load_instance = True
        sqla_session = db.session
        include_fk = True
        exclude = ("ingredients", "steps")


class RecipePostDetailSchema(SQLAlchemyAutoSchema):
    """
    Full schema for single-post view.
    Includes nested ingredients, steps, tags, and attribution data.
    """
    user = fields.Nested(UserBriefSchema, dump_only=True)
    ingredients = fields.Nested(IngredientSchema, many=True, dump_only=True)
    steps = fields.Nested(StepSchema, many=True, dump_only=True)
    tags = fields.Method("get_tags", dump_only=True)

    def get_tags(self, obj):
        tag_schema = TagSchema(many=True)
        return tag_schema.dump([pt.tag for pt in obj.tags])

    class Meta:
        model = RecipePost
        load_instance = True
        sqla_session = db.session
        include_fk = True


recipe_post_list_schema = RecipePostListSchema()
recipe_posts_list_schema = RecipePostListSchema(many=True)
recipe_post_detail_schema = RecipePostDetailSchema()
