import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    _db_url = os.environ.get("DATABASE_URL", "postgresql://localhost/cookbook_dev")
    # Render provides DATABASE_URL with 'postgres://' prefix; SQLAlchemy 2.x requires 'postgresql://'
    SQLALCHEMY_DATABASE_URI = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Prevent session cookie from being sent over plain HTTP in dev
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
