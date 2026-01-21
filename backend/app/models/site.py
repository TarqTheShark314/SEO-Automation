"""
PieBot SEO - Site Models
Core site management and integration configuration
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, JSON, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CMSType(str, Enum):
    """Supported CMS platforms."""

    WORDPRESS = "wordpress"
    SHOPIFY = "shopify"
    WEBFLOW = "webflow"
    SQUARESPACE = "squarespace"
    WIX = "wix"
    CUSTOM = "custom"
    OTHER = "other"


class SEOPluginType(str, Enum):
    """Supported SEO plugins for WordPress."""

    AIOSEO = "aioseo"
    YOAST = "yoast"
    RANKMATH = "rankmath"
    SEOPRESS = "seopress"
    NONE = "none"


class SiteStatus(str, Enum):
    """Site status in the system."""

    ACTIVE = "active"
    PAUSED = "paused"
    PENDING_SETUP = "pending_setup"
    ERROR = "error"
    ARCHIVED = "archived"


class Site(Base):
    """Site model - represents a website being managed."""

    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Basic Info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)

    # CMS Configuration
    cms_type: Mapped[CMSType] = mapped_column(SQLEnum(CMSType), default=CMSType.WORDPRESS)
    seo_plugin: Mapped[SEOPluginType] = mapped_column(SQLEnum(SEOPluginType), default=SEOPluginType.AIOSEO)

    # Status
    status: Mapped[SiteStatus] = mapped_column(SQLEnum(SiteStatus), default=SiteStatus.PENDING_SETUP)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_method: Mapped[Optional[str]] = mapped_column(String(50))
    verification_token: Mapped[Optional[str]] = mapped_column(String(255))

    # PieBot Pixel (like OTTO's pixel for instant optimizations)
    pixel_installed: Mapped[bool] = mapped_column(Boolean, default=False)
    pixel_script_hash: Mapped[Optional[str]] = mapped_column(String(64))
    pixel_last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Automation Settings
    auto_technical_seo: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_onpage_seo: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_schema_generation: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_internal_linking: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_meta_optimization: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_image_optimization: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_broken_link_fix: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_indexing: Mapped[bool] = mapped_column(Boolean, default=True)

    # Content Generation Settings
    content_ai_provider: Mapped[str] = mapped_column(String(50), default="claude")
    content_tone: Mapped[str] = mapped_column(String(50), default="professional")
    content_language: Mapped[str] = mapped_column(String(10), default="en")
    brand_voice_guidelines: Mapped[Optional[str]] = mapped_column(Text)

    # Local SEO Settings
    is_local_business: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_gbp_posts: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_review_replies: Mapped[bool] = mapped_column(Boolean, default=False)
    gbp_post_frequency: Mapped[str] = mapped_column(String(20), default="weekly")

    # GEO/LLM SEO Settings
    geo_tracking_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    tracked_brand_queries: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    tracked_keywords: Mapped[Optional[list]] = mapped_column(JSON, default=list)

    # Crawl Settings
    crawl_frequency: Mapped[str] = mapped_column(String(20), default="daily")
    last_crawl_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    crawl_pages_limit: Mapped[int] = mapped_column(Integer, default=1000)
    respect_robots_txt: Mapped[bool] = mapped_column(Boolean, default=True)
    crawl_delay: Mapped[float] = mapped_column(default=0.5)

    # Scores (cached)
    overall_seo_score: Mapped[Optional[int]] = mapped_column(Integer)
    technical_seo_score: Mapped[Optional[int]] = mapped_column(Integer)
    onpage_seo_score: Mapped[Optional[int]] = mapped_column(Integer)
    content_score: Mapped[Optional[int]] = mapped_column(Integer)
    local_seo_score: Mapped[Optional[int]] = mapped_column(Integer)
    geo_visibility_score: Mapped[Optional[int]] = mapped_column(Integer)
    eeat_score: Mapped[Optional[int]] = mapped_column(Integer)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="sites")
    integrations = relationship("SiteIntegration", back_populates="site", cascade="all, delete-orphan")
    audits = relationship("SiteAudit", back_populates="site", cascade="all, delete-orphan")
    optimizations = relationship("Optimization", back_populates="site", cascade="all, delete-orphan")
    generated_content = relationship("GeneratedContent", back_populates="site", cascade="all, delete-orphan")
    gbp_locations = relationship("GBPLocation", back_populates="site", cascade="all, delete-orphan")
    llm_visibility = relationship("LLMVisibility", back_populates="site", cascade="all, delete-orphan")
    keyword_rankings = relationship("KeywordRanking", back_populates="site", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Site {self.domain}>"


class IntegrationType(str, Enum):
    """Types of integrations supported."""

    WORDPRESS = "wordpress"
    GOOGLE_SEARCH_CONSOLE = "google_search_console"
    GOOGLE_ANALYTICS = "google_analytics"
    GOOGLE_BUSINESS_PROFILE = "google_business_profile"
    SEMRUSH = "semrush"
    YEXT = "yext"
    CLOUDFLARE = "cloudflare"
    KINSTA = "kinsta"


class SiteIntegration(Base):
    """Integration configuration for a site."""

    __tablename__ = "site_integrations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    integration_type: Mapped[IntegrationType] = mapped_column(SQLEnum(IntegrationType), nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    is_connected: Mapped[bool] = mapped_column(Boolean, default=False)

    # Credentials (encrypted in production)
    credentials: Mapped[Optional[dict]] = mapped_column(JSON)

    # WordPress specific
    wp_api_url: Mapped[Optional[str]] = mapped_column(String(500))
    wp_username: Mapped[Optional[str]] = mapped_column(String(255))
    wp_app_password: Mapped[Optional[str]] = mapped_column(String(255))

    # Google specific
    google_property_url: Mapped[Optional[str]] = mapped_column(String(500))
    google_refresh_token: Mapped[Optional[str]] = mapped_column(Text)

    # SEMrush specific
    semrush_project_id: Mapped[Optional[str]] = mapped_column(String(100))

    # Yext specific
    yext_location_id: Mapped[Optional[str]] = mapped_column(String(100))

    # Connection metadata
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_error: Mapped[Optional[str]] = mapped_column(Text)
    error_count: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="integrations")

    def __repr__(self) -> str:
        return f"<SiteIntegration {self.integration_type.value} for site {self.site_id}>"
