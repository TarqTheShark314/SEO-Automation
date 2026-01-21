"""
PieBot SEO - User Models
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, Enum):
    """User roles for access control."""

    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    VIEWER = "viewer"


class User(Base):
    """User model for authentication and authorization."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    company_name: Mapped[Optional[str]] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # API Keys
    api_key: Mapped[Optional[str]] = mapped_column(String(64), unique=True, index=True)

    # Subscription
    subscription_tier: Mapped[str] = mapped_column(String(50), default="starter")
    subscription_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Limits
    max_sites: Mapped[int] = mapped_column(default=1)
    max_monthly_audits: Mapped[int] = mapped_column(default=10)
    max_monthly_content_generations: Mapped[int] = mapped_column(default=50)

    # Usage tracking
    monthly_audits_used: Mapped[int] = mapped_column(default=0)
    monthly_content_generations_used: Mapped[int] = mapped_column(default=0)
    usage_reset_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    sites = relationship("Site", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.email}>"
