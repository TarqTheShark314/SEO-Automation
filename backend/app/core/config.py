"""
PieBot SEO - Core Configuration
Configuration management using Pydantic Settings
"""

from functools import lru_cache
from typing import Any, Optional

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    APP_NAME: str = "PieBot SEO"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    SECRET_KEY: str = "change-me-in-production"
    API_V1_PREFIX: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/piebot_seo"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour default

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ALGORITHM: str = "HS256"

    # AI Services
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    AI_PROVIDER: str = "claude"  # claude, openai, or auto

    # Google Services
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GSC_API_ENABLED: bool = True
    GA4_API_ENABLED: bool = True

    # Google Indexing API
    GOOGLE_INDEXING_ENABLED: bool = True

    # Bing Indexing API
    BING_API_KEY: Optional[str] = None
    BING_INDEXING_ENABLED: bool = False

    # SEMrush
    SEMRUSH_API_KEY: Optional[str] = None
    SEMRUSH_API_ENABLED: bool = True

    # Yext
    YEXT_API_KEY: Optional[str] = None
    YEXT_ACCOUNT_ID: Optional[str] = None
    YEXT_API_ENABLED: bool = True

    # Google Business Profile
    GBP_API_ENABLED: bool = True

    # WordPress Integration
    WP_DEFAULT_TIMEOUT: int = 30
    WP_BATCH_SIZE: int = 10

    # GEO/LLM SEO Settings
    GEO_TRACKING_ENABLED: bool = True
    GEO_TRACKING_INTERVAL_HOURS: int = 24
    GEO_TRACKED_LLMS: list[str] = ["chatgpt", "claude", "gemini", "perplexity"]

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Site Audit Settings
    AUDIT_MAX_PAGES: int = 10000
    AUDIT_CONCURRENT_REQUESTS: int = 10
    AUDIT_REQUEST_DELAY: float = 0.5  # seconds between requests

    # Content Generation Settings
    CONTENT_MAX_TOKENS: int = 4000
    CONTENT_TEMPERATURE: float = 0.7

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    PROMETHEUS_ENABLED: bool = True

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://app.bakemorepies.com"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
