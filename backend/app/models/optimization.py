"""
PieBot SEO - Optimization Models
Tracking optimizations and their deployments
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, JSON, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OptimizationType(str, Enum):
    """Types of optimizations."""

    # Technical SEO
    SCHEMA_MARKUP = "schema_markup"
    META_ROBOTS = "meta_robots"
    CANONICAL = "canonical"
    REDIRECT = "redirect"
    BROKEN_LINK_FIX = "broken_link_fix"
    SITEMAP = "sitemap"
    ROBOTS_TXT = "robots_txt"
    HREFLANG = "hreflang"
    STRUCTURED_DATA = "structured_data"

    # On-Page SEO
    TITLE_TAG = "title_tag"
    META_DESCRIPTION = "meta_description"
    HEADING_STRUCTURE = "heading_structure"
    ALT_TEXT = "alt_text"
    INTERNAL_LINK = "internal_link"
    EXTERNAL_LINK = "external_link"
    KEYWORD_OPTIMIZATION = "keyword_optimization"
    CONTENT_OPTIMIZATION = "content_optimization"

    # Technical
    LAZY_LOADING = "lazy_loading"
    IMAGE_OPTIMIZATION = "image_optimization"
    MINIFICATION = "minification"
    COMPRESSION = "compression"

    # Social
    OPEN_GRAPH = "open_graph"
    TWITTER_CARD = "twitter_card"

    # Other
    CUSTOM = "custom"


class OptimizationStatus(str, Enum):
    """Status of an optimization."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEPLOYED = "deployed"
    ROLLED_BACK = "rolled_back"
    FAILED = "failed"


class Optimization(Base):
    """Optimization recommendations and changes."""

    __tablename__ = "optimizations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)
    audit_issue_id: Mapped[Optional[int]] = mapped_column(ForeignKey("audit_issues.id"))

    # Optimization Details
    optimization_type: Mapped[OptimizationType] = mapped_column(SQLEnum(OptimizationType), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[OptimizationStatus] = mapped_column(SQLEnum(OptimizationStatus), default=OptimizationStatus.PENDING)

    # Target
    target_url: Mapped[Optional[str]] = mapped_column(String(2000))
    target_element: Mapped[Optional[str]] = mapped_column(String(500))

    # Changes
    original_value: Mapped[Optional[str]] = mapped_column(Text)
    new_value: Mapped[Optional[str]] = mapped_column(Text)
    change_diff: Mapped[Optional[dict]] = mapped_column(JSON)

    # For complex changes (like schema markup)
    code_snippet: Mapped[Optional[str]] = mapped_column(Text)
    code_language: Mapped[str] = mapped_column(String(20), default="json")

    # Impact Estimation
    estimated_impact: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high
    priority_score: Mapped[int] = mapped_column(Integer, default=50)  # 0-100

    # Approval
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    approved_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text)

    # Deployment
    is_deployed: Mapped[bool] = mapped_column(Boolean, default=False)
    deployed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    deployment_method: Mapped[str] = mapped_column(String(50), default="pixel")  # pixel, api, manual

    # Rollback
    can_rollback: Mapped[bool] = mapped_column(Boolean, default=True)
    is_rolled_back: Mapped[bool] = mapped_column(Boolean, default=False)
    rolled_back_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Auto-deployment
    auto_deploy: Mapped[bool] = mapped_column(Boolean, default=False)

    # Metadata
    metadata: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="optimizations")
    deployments = relationship("OptimizationDeployment", back_populates="optimization", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Optimization {self.optimization_type.value}: {self.title[:50]}>"


class DeploymentStatus(str, Enum):
    """Deployment status."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class OptimizationDeployment(Base):
    """Tracking deployment of optimizations."""

    __tablename__ = "optimization_deployments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    optimization_id: Mapped[int] = mapped_column(ForeignKey("optimizations.id"), nullable=False)

    # Deployment Details
    status: Mapped[DeploymentStatus] = mapped_column(SQLEnum(DeploymentStatus), default=DeploymentStatus.PENDING)
    method: Mapped[str] = mapped_column(String(50), nullable=False)  # pixel, wordpress_api, manual

    # Timing
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Results
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    response_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Verification
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    verification_screenshot: Mapped[Optional[str]] = mapped_column(String(500))  # URL to screenshot

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    optimization = relationship("Optimization", back_populates="deployments")

    def __repr__(self) -> str:
        return f"<OptimizationDeployment {self.id} - {self.status.value}>"
