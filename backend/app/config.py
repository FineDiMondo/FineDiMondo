import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurazione del backend Fine di Mondo su Google Cloud"""

    # FastAPI
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    APP_NAME: str = "Fine Di Mondo API"
    API_V1_STR: str = "/api"

    # Google Cloud
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "freedomrun-491323")
    GCP_REGION: str = os.getenv("GCP_REGION", "europe-west1")

    # Database - Cloud SQL
    CLOUDSQL_CONNECTION_NAME: str = os.getenv(
        "CLOUDSQL_CONNECTION_NAME",
        "freedomrun-491323:europe-west1:kyuss-instance"
    )
    DB_USER: str = os.getenv("DB_USER", "kyuss_admin")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "KyussRetro_GCP2026!")
    DB_NAME: str = os.getenv("DB_NAME", "kyuss_retro")
    DB_HOST: str = os.getenv("DB_HOST", "34.76.47.191")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))

    # Database URL
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Cloud Storage
    BUCKET_NAME: str = os.getenv("BUCKET_NAME", "fine-di-mondo-posters")

    # Vertex AI
    VERTEX_AI_PROJECT: str = os.getenv("VERTEX_AI_PROJECT", "freedomrun-491323")
    VERTEX_AI_LOCATION: str = os.getenv("VERTEX_AI_LOCATION", "europe-west1")
    VERTEX_AI_MODEL: str = os.getenv("VERTEX_AI_MODEL", "gemini-2.5-flash")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Google OAuth (Google Cloud Identity)
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # Social APIs
    FACEBOOK_ACCESS_TOKEN: str = os.getenv("FACEBOOK_ACCESS_TOKEN", "")
    INSTAGRAM_ACCESS_TOKEN: str = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
    WHATSAPP_ACCESS_TOKEN: str = os.getenv("WHATSAPP_ACCESS_TOKEN", "")

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:4200",
        "http://localhost:8080",
        "https://finedimondo-frontend.run.app",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
