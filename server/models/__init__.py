# Import all models here so Flask-Migrate can detect them for autogenerate
from models.user import User
from models.post import Post
from models.recipe_post import RecipePost
from models.ingredient import Ingredient
from models.step import Step
from models.tag import Tag
from models.post_tag import PostTag
from models.recipe_box import RecipeBox
from models.box_post import BoxPost
from models.comment import Comment
from models.follow import Follow

__all__ = [
    "User", "Post", "RecipePost", "Ingredient", "Step",
    "Tag", "PostTag", "RecipeBox", "BoxPost", "Comment", "Follow",
]
