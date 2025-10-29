from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, sourced from environment variables (.env supported)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        protected_namespaces=('settings_',)  # Allow 'model_' prefix fields
    )

    app_env: str = Field(default="dev", alias="APP_ENV")
    app_name: str = Field(default="UniTrack API", alias="APP_NAME")
    api_prefix: str = Field(default="/api/v1", alias="API_PREFIX")
    frontend_origin: AnyHttpUrl = Field(default="http://localhost:3000", alias="FRONTEND_ORIGIN")

    auth_mode: str = Field(default="supabase", alias="AUTH_MODE")
    supabase_project_ref: str | None = Field(default=None, alias="SUPABASE_PROJECT_REF")
    supabase_jwks_url: AnyHttpUrl | None = Field(default=None, alias="SUPABASE_JWKS_URL")
    supabase_audience: str = Field(default="authenticated", alias="SUPABASE_AUDIENCE")

    # Internal JWT settings (used when AUTH_MODE=jwt)
    jwt_secret: str = Field(default="dev-secret-key-change-in-production", alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")

    database_url: str = Field(alias="DATABASE_URL")

    model_path: str = Field(default="../ml_models/models/model.pkl", alias="MODEL_PATH")
    model_version: str = Field(default="v1", alias="MODEL_VERSION")

    cors_allow_origins: List[AnyHttpUrl] | None = None

    @field_validator('supabase_jwks_url', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None for optional URL fields."""
        if v == '' or v is None:
            return None
        return v

    @property
    def is_mock_auth(self) -> bool:
        return self.auth_mode.lower() == "mock"

    @property
    def is_internal_jwt(self) -> bool:
        return self.auth_mode.lower() in {"jwt", "internal"}

    def allow_origins(self) -> List[str]:
        if self.cors_allow_origins:
            return [str(origin) for origin in self.cors_allow_origins]
        return [str(self.frontend_origin)]


@lru_cache
def get_settings() -> Settings:
    return Settings()
