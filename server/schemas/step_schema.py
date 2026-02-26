from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app import db
from models.step import Step


class StepSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Step
        load_instance = True
        sqla_session = db.session
        exclude = ("recipe_post_id",)


step_schema = StepSchema()
steps_schema = StepSchema(many=True)
