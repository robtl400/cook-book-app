from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from models.user import User
from models.recipe_box import RecipeBox
from schemas.user_schema import user_schema

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "message": "Failed"}), 400

    # Validate required fields
    required = ["email", "username", "display_name", "password"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}", "message": "Failed"}), 400

    if len(data["password"]) < 8:
        return jsonify({"error": "Password must be at least 8 characters", "message": "Failed"}), 400

    # Check uniqueness
    if User.query.filter_by(email=data["email"].lower()).first():
        return jsonify({"error": "Email already registered", "message": "Failed"}), 409
    if User.query.filter_by(username=data["username"].lower()).first():
        return jsonify({"error": "Username already taken", "message": "Failed"}), 409

    user = User(
        email=data["email"].lower(),
        username=data["username"].lower(),
        display_name=data["display_name"],
        bio=data.get("bio"),
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.flush()  # flush to get user.id before creating boxes

    # Auto-create the three default recipe boxes on registration
    default_boxes = [
        RecipeBox(user_id=user.id, name="Liked", box_type="liked", is_default=True),
        RecipeBox(user_id=user.id, name="Cooked", box_type="cooked", is_default=True),
        RecipeBox(user_id=user.id, name="Want to Try", box_type="want_to_try", is_default=True),
    ]
    db.session.add_all(default_boxes)
    db.session.commit()

    login_user(user)
    return jsonify({"data": user_schema.dump(user), "message": "Registration successful"}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "message": "Failed"}), 400

    email = data.get("email", "").lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required", "message": "Failed"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        # Use a generic message to avoid confirming whether the email exists
        return jsonify({"error": "Invalid email or password", "message": "Failed"}), 401

    login_user(user)
    return jsonify({"data": user_schema.dump(user), "message": "Login successful"}), 200


@auth_bp.post("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"data": None, "message": "Logged out successfully"}), 200


@auth_bp.get("/me")
def me():
    if not current_user.is_authenticated:
        return jsonify({"error": "Not authenticated", "message": "Failed"}), 401
    return jsonify({"data": user_schema.dump(current_user), "message": "Success"}), 200
