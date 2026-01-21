"""
PieBot SEO - Analytics Models
SEO metrics, keyword rankings, and performance tracking
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, DateTime, Integer, ForeignKey, JSON, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AnalyticsSnapshot(Base):
    """Daily analytics snapshot for a site."""

    __tablename__ = "analytics_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Snapshot Date
    snapshot_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Traffic Metrics (from GA4)
    organic_sessions: Mapped[int] = mapped_column(Integer, default=0)
    organic_users: Mapped[int] = mapped_column(Integer, default=0)
    organic_pageviews: Mapped[int] = mapped_column(Integer, default=0)
    organic_bounce_rate: Mapped[Optional[float]] = mapped_column(Float)
    avg_session_duration: Mapped[Optional[float]] = mapped_column(Float)

    # Conversions
    organic_conversions: Mapped[int] = mapped_column(Integer, default=0)
    conversion_rate: Mapped[Optional[float]] = mapped_column(Float)
    revenue: Mapped[Optional[float]] = mapped_column(Float)

    # GSC Metrics
    gsc_impressions: Mapped[int] = mapped_column(Integer, default=0)
    gsc_clicks: Mapped[int] = mapped_column(Integer, default=0)
    gsc_ctr: Mapped[Optional[float]] = mapped_column(Float)
    gsc_avg_position: Mapped[Optional[float]] = mapped_column(Float)

    # Keyword Metrics
    total_keywords_tracked: Mapped[int] = mapped_column(Integer, default=0)
    keywords_in_top_3: Mapped[int] = mapped_column(Integer, default=0)
    keywords_in_top_10: Mapped[int] = mapped_column(Integer, default=0)
    keywords_in_top_100: Mapped[int] = mapped_column(Integer, default=0)
    keywords_improved: Mapped[int] = mapped_column(Integer, default=0)
    keywords_declined: Mapped[int] = mapped_column(Integer, default=0)

    # Backlink Metrics
    total_backlinks: Mapped[int] = mapped_column(Integer, default=0)
    referring_domains: Mapped[int] = mapped_column(Integer, default=0)
    new_backlinks: Mapped[int] = mapped_column(Integer, default=0)
    lost_backlinks: Mapped[int] = mapped_column(Integer, default=0)

    # Technical Metrics
    indexed_pages: Mapped[int] = mapped_column(Integer, default=0)
    crawl_errors: Mapped[int] = mapped_column(Integer, default=0)
    avg_page_load_time: Mapped[Optional[float]] = mapped_column(Float)

    # SEO Scores
    overall_seo_score: Mapped[Optional[int]] = mapped_column(Integer)
    technical_score: Mapped[Optional[int]] = mapped_column(Integer)
    content_score: Mapped[Optional[int]] = mapped_column(Integer)

    # GEO/LLM Metrics
    llm_visibility_score: Mapped[Optional[float]] = mapped_column(Float)
    llm_mentions_count: Mapped[int] = mapped_column(Integer, default=0)
    llm_citations_count: Mapped[int] = mapped_column(Integer, default=0)

    # Raw Data
    ga4_data: Mapped[Optional[dict]] = mapped_column(JSON)
    gsc_data: Mapped[Optional[dict]] = mapped_column(JSON)
    semrush_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<AnalyticsSnapshot {self.snapshot_date} for site {self.site_id}>"


class SearchEngine(str, Enum):
    """Search engines for ranking tracking."""

    GOOGLE = "google"
    BING = "bing"
    YAHOO = "yahoo"
    DUCKDUCKGO = "duckduckgo"


class DeviceType(str, Enum):
    """Device types for ranking tracking."""

    DESKTOP = "desktop"
    MOBILE = "mobile"
    TABLET = "tablet"


class KeywordRanking(Base):
    """Keyword ranking tracking."""

    __tablename__ = "keyword_rankings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Keyword Details
    keyword: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    search_engine: Mapped[SearchEngine] = mapped_column(SQLEnum(SearchEngine), default=SearchEngine.GOOGLE)
    device_type: Mapped[DeviceType] = mapped_column(SQLEnum(DeviceType), default=DeviceType.DESKTOP)
    location: Mapped[str] = mapped_column(String(100), default="US")
    language: Mapped[str] = mapped_column(String(10), default="en")

    # Ranking Data
    ranking_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    position: Mapped[Optional[int]] = mapped_column(Integer)  # Null if not ranking
    previous_position: Mapped[Optional[int]] = mapped_column(Integer)
    position_change: Mapped[int] = mapped_column(Integer, default=0)
    best_position: Mapped[Optional[int]] = mapped_column(Integer)

    # SERP Features
    featured_snippet: Mapped[bool] = mapped_column(default=False)
    people_also_ask: Mapped[bool] = mapped_column(default=False)
    local_pack: Mapped[bool] = mapped_column(default=False)
    knowledge_panel: Mapped[bool] = mapped_column(default=False)
    video_carousel: Mapped[bool] = mapped_column(default=False)
    image_pack: Mapped[bool] = mapped_column(default=False)
    ai_overview: Mapped[bool] = mapped_column(default=False)  # Google AI Overview

    # Landing Page
    ranking_url: Mapped[Optional[str]] = mapped_column(String(2000))

    # Search Volume & Difficulty
    search_volume: Mapped[Optional[int]] = mapped_column(Integer)
    keyword_difficulty: Mapped[Optional[int]] = mapped_column(Integer)
    cpc: Mapped[Optional[float]] = mapped_column(Float)
    competition: Mapped[Optional[float]] = mapped_column(Float)

    # Intent
    search_intent: Mapped[Optional[str]] = mapped_column(String(50))  # informational, transactional, etc.

    # GSC Data
    gsc_impressions: Mapped[int] = mapped_column(Integer, default=0)
    gsc_clicks: Mapped[int] = mapped_column(Integer, default=0)
    gsc_ctr: Mapped[Optional[float]] = mapped_column(Float)
    gsc_position: Mapped[Optional[float]] = mapped_column(Float)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="keyword_rankings")

    def __repr__(self) -> str:
        return f"<KeywordRanking '{self.keyword}' #{self.position}>"


class ContentPerformance(Base):
    """Track performance of individual content pieces."""

    __tablename__ = "content_performance"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)
    content_id: Mapped[Optional[int]] = mapped_column(ForeignKey("generated_content.id"))

    # Content Details
    url: Mapped[str] = mapped_column(String(2000), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(500))
    content_type: Mapped[str] = mapped_column(String(50), default="page")

    # Performance Date
    performance_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Traffic
    pageviews: Mapped[int] = mapped_column(Integer, default=0)
    unique_pageviews: Mapped[int] = mapped_column(Integer, default=0)
    entrances: Mapped[int] = mapped_column(Integer, default=0)
    exits: Mapped[int] = mapped_column(Integer, default=0)
    bounce_rate: Mapped[Optional[float]] = mapped_column(Float)
    avg_time_on_page: Mapped[Optional[float]] = mapped_column(Float)

    # GSC Metrics
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    ctr: Mapped[Optional[float]] = mapped_column(Float)
    avg_position: Mapped[Optional[float]] = mapped_column(Float)

    # Keywords Ranking
    keywords_ranking: Mapped[int] = mapped_column(Integer, default=0)
    keywords_in_top_10: Mapped[int] = mapped_column(Integer, default=0)

    # Backlinks
    backlinks_count: Mapped[int] = mapped_column(Integer, default=0)
    referring_domains: Mapped[int] = mapped_column(Integer, default=0)

    # Social
    social_shares: Mapped[int] = mapped_column(Integer, default=0)

    # Conversions
    conversions: Mapped[int] = mapped_column(Integer, default=0)
    conversion_value: Mapped[Optional[float]] = mapped_column(Float)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ContentPerformance {self.url}>"


class CompetitorAnalysis(Base):
    """Competitor tracking and analysis."""

    __tablename__ = "competitor_analysis"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Competitor Details
    competitor_domain: Mapped[str] = mapped_column(String(255), nullable=False)
    competitor_name: Mapped[Optional[str]] = mapped_column(String(255))

    # Analysis Date
    analysis_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Domain Metrics
    domain_authority: Mapped[Optional[int]] = mapped_column(Integer)
    organic_traffic: Mapped[Optional[int]] = mapped_column(Integer)
    organic_keywords: Mapped[Optional[int]] = mapped_column(Integer)
    backlinks_count: Mapped[Optional[int]] = mapped_column(Integer)
    referring_domains: Mapped[Optional[int]] = mapped_column(Integer)

    # Keyword Overlap
    common_keywords: Mapped[int] = mapped_column(Integer, default=0)
    competitor_unique_keywords: Mapped[int] = mapped_column(Integer, default=0)
    our_unique_keywords: Mapped[int] = mapped_column(Integer, default=0)

    # Content Gap
    content_gap_keywords: Mapped[Optional[list]] = mapped_column(JSON)
    content_gap_topics: Mapped[Optional[list]] = mapped_column(JSON)

    # LLM Visibility Comparison
    llm_visibility_score: Mapped[Optional[float]] = mapped_column(Float)
    llm_mention_rate: Mapped[Optional[float]] = mapped_column(Float)

    # Raw Data
    semrush_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<CompetitorAnalysis {self.competitor_domain}>"
