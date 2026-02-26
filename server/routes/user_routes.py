from flask import Blueprint

user_bp = Blueprint("users", __name__, url_prefix="/api/users")

# TODO: GET /api/users/<username> — public profile
# TODO: GET /api/users/<username>/posts — user's recipe posts
# TODO: POST /api/users/<user_id>/follow — follow a user
# TODO: DELETE /api/users/<user_id>/follow — unfollow
