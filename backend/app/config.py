import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


def _database_uri() -> str:
    """Return the configured database URL, with a SQLite default for local use."""
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        instance_folder = os.path.join(BASE_DIR, "instance")
        os.makedirs(instance_folder, exist_ok=True)
        db_file_path = os.path.join(instance_folder, "mobile_hub.db").replace(os.sep, "/")
        return f"sqlite:///{db_file_path}"

    # Render may provide either scheme. SQLAlchemy's PostgreSQL dialect needs
    # the latter (and uses psycopg2-binary from requirements.txt by default).
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg2://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return database_url

class Config:
    """Base Configuration"""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-mobile-hub-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-mobile-hub-jwt-key-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Defaults to the existing local SQLite file; production receives DATABASE_URL.
    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS
    cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
    CORS_ORIGINS = [orig.strip() for orig in cors_origins_str.split(",") if orig.strip()]

    # OTP Configuration
    OTP_PROVIDER = os.getenv("OTP_PROVIDER", "mock")
    OTP_API_KEY = os.getenv("OTP_API_KEY", "mock-key")
    OTP_SENDER_ID = os.getenv("OTP_SENDER_ID", "MOBHUB")
    OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", "120"))  # 2 minutes
    OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "3"))
    OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))

    # Official MobileHub Social Links
    INSTAGRAM_URL = os.getenv(
        "INSTAGRAM_URL",
        "https://www.instagram.com/mobilehub_tadepalligudem_?utm_source=qr&igsh=MW4yMHdydmIydXBxYQ%3D%3D"
    )
    FACEBOOK_URL = os.getenv(
        "FACEBOOK_URL",
        "https://www.facebook.com/profile.php?id=61555352783316&rdid=PLVaZVHjrUIfF1SU&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DdCNNnopH%2F#"
    )
    WHATSAPP_URL = os.getenv(
        "WHATSAPP_URL",
        "https://whatsapp.com/channel/0029VajCJxRADTOB8x4ocV2t"
    )
    STORE_NAME = os.getenv("STORE_NAME", "Mobile Hub")
    STORE_ADDRESS = os.getenv("STORE_ADDRESS", "Plot 42, Metro Pillar 118, MG Road, Tech City")
    STORE_PHONE = os.getenv("STORE_PHONE", "+91 98765 43210")

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    OTP_PROVIDER = "mock"
    JWT_SECRET_KEY = "test-jwt-secret-key-spin-and-win-2026-super-secure"
    SECRET_KEY = "test-secret-key-spin-and-win-2026-super-secure"


class ProductionConfig(Config):
    DEBUG = False
    # In production, require secure secrets
    # Default to postgresql if set
    pass

config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
