from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Allow requests from the Vite dev server and Netlify frontend
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "https://*.netlify.app"])

    # Tell Flask-Login to return 401 JSON instead of redirecting to a login page
    login_manager.unauthorized_handler(lambda: ({"error": "Authentication required", "message": "Failed"}, 401))

    # Import models so Flask-Migrate can detect them for autogenerate
    from models import (  # noqa: F401
        user, post, recipe_post, ingredient, step,
        tag, post_tag, recipe_box, box_post, comment, follow
    )

    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.recipe_post_routes import recipe_post_bp
    from routes.recipe_box_routes import recipe_box_bp
    from routes.comment_routes import comment_bp
    from routes.parse_routes import parse_bp
    from routes.search_routes import search_bp, explore_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(recipe_post_bp)
    app.register_blueprint(recipe_box_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(parse_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(explore_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5555)
