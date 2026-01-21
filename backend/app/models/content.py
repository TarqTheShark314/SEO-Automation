"""
PieBot SEO - Content Models
AI-generated content, topical maps, and content optimization
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, JSON, Text, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ContentType(str, Enum):
    """Types of generated content."""

    BLOG_POST = "blog_post"
    LANDING_PAGE = "landing_page"
    PRODUCT_PAGE = "product_page"
    SERVICE_PAGE = "service_page"
    CATEGORY_PAGE = "category_page"
    FAQ_PAGE = "faq_page"
    KNOWLEDGE_BASE = "knowledge_base"
    PRESS_RELEASE = "press_release"
    GBP_POST = "gbp_post"
    META_TITLE = "meta_title"
    META_DESCRIPTION = "meta_description"
    HEADING = "heading"
    ALT_TEXT = "alt_text"
    SCHEMA_FAQ = "schema_faq"
    SOCIAL_POST = "social_post"


class ContentStatus(str, Enum):
    """Status of generated content."""

    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class GeneratedContent(Base):
    """AI-generated content storage."""

    __tablename__ = "generated_content"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Content Details
    content_type: Mapped[ContentType] = mapped_column(SQLEnum(ContentType), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[ContentStatus] = mapped_column(SQLEnum(ContentStatus), default=ContentStatus.DRAFT)

    # Target
    target_url: Mapped[Optional[str]] = mapped_column(String(2000))
    target_slug: Mapped[Optional[str]] = mapped_column(String(500))

    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_html: Mapped[Optional[str]] = mapped_column(Text)
    content_markdown: Mapped[Optional[str]] = mapped_column(Text)
    excerpt: Mapped[Optional[str]] = mapped_column(Text)

    # SEO Elements
    meta_title: Mapped[Optional[str]] = mapped_column(String(70))
    meta_description: Mapped[Optional[str]] = mapped_column(String(160))
    focus_keyword: Mapped[Optional[str]] = mapped_column(String(100))
    secondary_keywords: Mapped[Optional[list]] = mapped_column(JSON)

    # AI Generation Details
    ai_provider: Mapped[str] = mapped_column(String(50), default="claude")
    ai_model: Mapped[str] = mapped_column(String(100))
    prompt_used: Mapped[Optional[str]] = mapped_column(Text)
    generation_params: Mapped[Optional[dict]] = mapped_column(JSON)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer)

    # Quality Scores
    readability_score: Mapped[Optional[float]] = mapped_column(Float)
    seo_score: Mapped[Optional[float]] = mapped_column(Float)
    originality_score: Mapped[Optional[float]] = mapped_column(Float)
    eeat_score: Mapped[Optional[float]] = mapped_column(Float)

    # Content Analysis
    word_count: Mapped[Optional[int]] = mapped_column(Integer)
    reading_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    flesch_reading_ease: Mapped[Optional[float]] = mapped_column(Float)
    keyword_density: Mapped[Optional[float]] = mapped_column(Float)

    # GEO/LLM Optimization
    is_geo_optimized: Mapped[bool] = mapped_column(Boolean, default=False)
    has_tldr: Mapped[bool] = mapped_column(Boolean, default=False)
    has_statistics: Mapped[bool] = mapped_column(Boolean, default=False)
    has_quotes: Mapped[bool] = mapped_column(Boolean, default=False)
    has_author_bio: Mapped[bool] = mapped_column(Boolean, default=False)

    # Publishing
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    published_url: Mapped[Optional[str]] = mapped_column(String(2000))
    wordpress_post_id: Mapped[Optional[int]] = mapped_column(Integer)

    # Versioning
    version: Mapped[int] = mapped_column(Integer, default=1)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("generated_content.id"))

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="generated_content")
    optimizations = relationship("ContentOptimization", back_populates="content", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<GeneratedContent {self.content_type.value}: {self.title[:50]}>"


class ContentOptimization(Base):
    """Content optimization suggestions."""

    __tablename__ = "content_optimizations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("generated_content.id"), nullable=False)

    # Optimization Details
    optimization_type: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text)

    # Suggested Change
    original_text: Mapped[Optional[str]] = mapped_column(Text)
    suggested_text: Mapped[Optional[str]] = mapped_column(Text)
    location: Mapped[Optional[str]] = mapped_column(String(500))  # Where in the content

    # Status
    is_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    is_rejected: Mapped[bool] = mapped_column(Boolean, default=False)

    # Impact
    impact_score: Mapped[Optional[int]] = mapped_column(Integer)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    content = relationship("GeneratedContent", back_populates="optimizations")


class TopicalMapStatus(str, Enum):
    """Status of topical map."""

    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class TopicalMap(Base):
    """Topical maps for content strategy."""

    __tablename__ = "topical_maps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Map Details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    main_topic: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[TopicalMapStatus] = mapped_column(SQLEnum(TopicalMapStatus), default=TopicalMapStatus.DRAFT)

    # Topics Structure (JSON with nested topics)
    topics: Mapped[dict] = mapped_column(JSON, nullable=False)
    """
    Example structure:
    {
        "pillar": {
            "keyword": "SEO automation",
            "search_volume": 1200,
            "content_id": null,
            "status": "planned"
        },
        "clusters": [
            {
                "keyword": "technical SEO automation",
                "search_volume": 320,
                "parent": "SEO automation",
                "content_id": 123,
                "status": "published",
                "subtopics": [...]
            }
        ]
    }
    """

    # Statistics
    total_topics: Mapped[int] = mapped_column(Integer, default=0)
    completed_topics: Mapped[int] = mapped_column(Integer, default=0)
    total_search_volume: Mapped[int] = mapped_column(Integer, default=0)

    # Generation Details
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=True)
    generation_prompt: Mapped[Optional[str]] = mapped_column(Text)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<TopicalMap {self.name}: {self.main_topic}>"
