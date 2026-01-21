"""
PieBot SEO - Local SEO Models
Google Business Profile, Reviews, and Local Citations
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, JSON, Text, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class GBPLocationStatus(str, Enum):
    """GBP location status."""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    DISCONNECTED = "disconnected"


class GBPLocation(Base):
    """Google Business Profile location."""

    __tablename__ = "gbp_locations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # GBP Identifiers
    gbp_location_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    gbp_account_id: Mapped[Optional[str]] = mapped_column(String(100))
    place_id: Mapped[Optional[str]] = mapped_column(String(100))

    # Business Details
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    primary_category: Mapped[Optional[str]] = mapped_column(String(255))
    additional_categories: Mapped[Optional[list]] = mapped_column(JSON)
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Address
    address_line1: Mapped[Optional[str]] = mapped_column(String(255))
    address_line2: Mapped[Optional[str]] = mapped_column(String(255))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    postal_code: Mapped[Optional[str]] = mapped_column(String(20))
    country: Mapped[str] = mapped_column(String(2), default="US")

    # Contact
    phone: Mapped[Optional[str]] = mapped_column(String(30))
    website: Mapped[Optional[str]] = mapped_column(String(500))

    # Location
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)

    # Hours
    business_hours: Mapped[Optional[dict]] = mapped_column(JSON)
    special_hours: Mapped[Optional[dict]] = mapped_column(JSON)

    # Status
    status: Mapped[GBPLocationStatus] = mapped_column(SQLEnum(GBPLocationStatus), default=GBPLocationStatus.ACTIVE)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Metrics
    total_reviews: Mapped[int] = mapped_column(Integer, default=0)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_photos: Mapped[int] = mapped_column(Integer, default=0)
    profile_completeness: Mapped[int] = mapped_column(Integer, default=0)  # 0-100

    # Automation Settings
    auto_post_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_reply_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_qa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    post_frequency: Mapped[str] = mapped_column(String(20), default="weekly")

    # Yext Integration
    yext_location_id: Mapped[Optional[str]] = mapped_column(String(100))
    yext_sync_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # Last Sync
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_post_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="gbp_locations")
    posts = relationship("GBPPost", back_populates="location", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="location", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<GBPLocation {self.business_name}>"


class GBPPostType(str, Enum):
    """Types of GBP posts."""

    WHATS_NEW = "whats_new"
    EVENT = "event"
    OFFER = "offer"
    PRODUCT = "product"


class GBPPostStatus(str, Enum):
    """Status of GBP posts."""

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    EXPIRED = "expired"


class GBPPost(Base):
    """Google Business Profile posts."""

    __tablename__ = "gbp_posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("gbp_locations.id"), nullable=False)

    # GBP Post ID
    gbp_post_id: Mapped[Optional[str]] = mapped_column(String(100))

    # Post Details
    post_type: Mapped[GBPPostType] = mapped_column(SQLEnum(GBPPostType), default=GBPPostType.WHATS_NEW)
    status: Mapped[GBPPostStatus] = mapped_column(SQLEnum(GBPPostStatus), default=GBPPostStatus.DRAFT)

    # Content
    title: Mapped[Optional[str]] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    call_to_action_type: Mapped[Optional[str]] = mapped_column(String(50))
    call_to_action_url: Mapped[Optional[str]] = mapped_column(String(500))

    # Media
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    video_url: Mapped[Optional[str]] = mapped_column(String(500))

    # Event/Offer Details
    event_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    event_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    offer_code: Mapped[Optional[str]] = mapped_column(String(50))
    offer_terms: Mapped[Optional[str]] = mapped_column(Text)

    # AI Generation
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    generation_prompt: Mapped[Optional[str]] = mapped_column(Text)

    # Scheduling
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Metrics
    views: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    location = relationship("GBPLocation", back_populates="posts")

    def __repr__(self) -> str:
        return f"<GBPPost {self.post_type.value}: {self.content[:50]}>"


class ReviewSource(str, Enum):
    """Sources of reviews."""

    GOOGLE = "google"
    YELP = "yelp"
    FACEBOOK = "facebook"
    TRIPADVISOR = "tripadvisor"
    TRUSTPILOT = "trustpilot"
    OTHER = "other"


class ReviewStatus(str, Enum):
    """Status of review responses."""

    PENDING = "pending"
    RESPONDED = "responded"
    FLAGGED = "flagged"
    IGNORED = "ignored"


class Review(Base):
    """Customer reviews from various platforms."""

    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("gbp_locations.id"), nullable=False)

    # Review Source
    source: Mapped[ReviewSource] = mapped_column(SQLEnum(ReviewSource), default=ReviewSource.GOOGLE)
    external_review_id: Mapped[str] = mapped_column(String(100), nullable=False)

    # Reviewer
    reviewer_name: Mapped[Optional[str]] = mapped_column(String(255))
    reviewer_photo_url: Mapped[Optional[str]] = mapped_column(String(500))
    reviewer_profile_url: Mapped[Optional[str]] = mapped_column(String(500))

    # Review Content
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    review_text: Mapped[Optional[str]] = mapped_column(Text)
    review_language: Mapped[str] = mapped_column(String(10), default="en")

    # Sentiment Analysis
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)  # -1 to 1
    sentiment_label: Mapped[Optional[str]] = mapped_column(String(20))  # positive, negative, neutral
    key_topics: Mapped[Optional[list]] = mapped_column(JSON)

    # Response
    status: Mapped[ReviewStatus] = mapped_column(SQLEnum(ReviewStatus), default=ReviewStatus.PENDING)
    response_text: Mapped[Optional[str]] = mapped_column(Text)
    response_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Flags
    is_negative: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_attention: Mapped[bool] = mapped_column(Boolean, default=False)
    is_fake_suspected: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    review_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    location = relationship("GBPLocation", back_populates="reviews")

    def __repr__(self) -> str:
        return f"<Review {self.source.value} {self.rating}* from {self.reviewer_name}>"
