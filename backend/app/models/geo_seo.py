"""
PieBot SEO - GEO/LLM SEO Models
Generative Engine Optimization for AI Search Visibility
This is a key differentiator - tracking and optimizing for AI search engines
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, JSON, Text, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class LLMProvider(str, Enum):
    """AI/LLM providers we track."""

    CHATGPT = "chatgpt"
    CLAUDE = "claude"
    GEMINI = "gemini"
    PERPLEXITY = "perplexity"
    COPILOT = "copilot"
    MISTRAL = "mistral"
    LLAMA = "llama"


class LLMVisibility(Base):
    """Track brand/site visibility across AI search engines."""

    __tablename__ = "llm_visibility"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Tracking Period
    tracking_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Provider
    llm_provider: Mapped[LLMProvider] = mapped_column(SQLEnum(LLMProvider), nullable=False)

    # Visibility Metrics
    total_queries_tracked: Mapped[int] = mapped_column(Integer, default=0)
    queries_with_mention: Mapped[int] = mapped_column(Integer, default=0)
    queries_with_citation: Mapped[int] = mapped_column(Integer, default=0)
    queries_with_link: Mapped[int] = mapped_column(Integer, default=0)

    # Visibility Score (0-100)
    visibility_score: Mapped[float] = mapped_column(Float, default=0.0)
    mention_rate: Mapped[float] = mapped_column(Float, default=0.0)  # % of queries mentioning brand
    citation_rate: Mapped[float] = mapped_column(Float, default=0.0)  # % of queries citing content

    # Sentiment
    average_sentiment: Mapped[Optional[float]] = mapped_column(Float)  # -1 to 1
    positive_mentions: Mapped[int] = mapped_column(Integer, default=0)
    negative_mentions: Mapped[int] = mapped_column(Integer, default=0)
    neutral_mentions: Mapped[int] = mapped_column(Integer, default=0)

    # Position Analysis (when mentioned, where in response)
    average_position: Mapped[Optional[float]] = mapped_column(Float)  # Position in response
    top_3_appearances: Mapped[int] = mapped_column(Integer, default=0)  # Times appearing in top 3 sources

    # Competitor Comparison
    competitor_visibility_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="llm_visibility")
    queries = relationship("AIQuery", back_populates="visibility_record", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<LLMVisibility {self.llm_provider.value} for site {self.site_id} on {self.tracking_date}>"


class QueryCategory(str, Enum):
    """Categories of AI queries."""

    BRAND = "brand"  # Direct brand queries
    PRODUCT = "product"  # Product-related queries
    SERVICE = "service"  # Service-related queries
    COMPARISON = "comparison"  # Comparison queries
    INFORMATIONAL = "informational"  # General info queries
    TRANSACTIONAL = "transactional"  # Purchase intent queries
    NAVIGATIONAL = "navigational"  # Navigation intent


class AIQuery(Base):
    """Individual AI queries tracked for visibility."""

    __tablename__ = "ai_queries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    visibility_id: Mapped[int] = mapped_column(ForeignKey("llm_visibility.id"), nullable=False)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Query Details
    llm_provider: Mapped[LLMProvider] = mapped_column(SQLEnum(LLMProvider), nullable=False)
    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    query_category: Mapped[QueryCategory] = mapped_column(SQLEnum(QueryCategory), default=QueryCategory.INFORMATIONAL)

    # Response Analysis
    response_text: Mapped[Optional[str]] = mapped_column(Text)
    response_length: Mapped[int] = mapped_column(Integer, default=0)

    # Brand Visibility
    brand_mentioned: Mapped[bool] = mapped_column(Boolean, default=False)
    brand_position: Mapped[Optional[int]] = mapped_column(Integer)  # Position in response (word count)
    brand_context: Mapped[Optional[str]] = mapped_column(Text)  # Context around brand mention

    # Citation Analysis
    is_cited: Mapped[bool] = mapped_column(Boolean, default=False)
    citation_url: Mapped[Optional[str]] = mapped_column(String(2000))
    citation_text: Mapped[Optional[str]] = mapped_column(Text)

    # Sentiment
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)
    sentiment_label: Mapped[Optional[str]] = mapped_column(String(20))

    # Competitor Analysis
    competitors_mentioned: Mapped[Optional[list]] = mapped_column(JSON)
    competitor_positions: Mapped[Optional[dict]] = mapped_column(JSON)

    # Source Analysis
    sources_cited: Mapped[Optional[list]] = mapped_column(JSON)  # All sources in response
    source_domains: Mapped[Optional[list]] = mapped_column(JSON)

    # Timestamps
    queried_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    visibility_record = relationship("LLMVisibility", back_populates="queries")
    citations = relationship("Citation", back_populates="query", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AIQuery {self.llm_provider.value}: {self.query_text[:50]}>"


class CitationType(str, Enum):
    """Types of citations in AI responses."""

    DIRECT_LINK = "direct_link"  # Clickable link to site
    REFERENCE = "reference"  # Referenced as source
    MENTION = "mention"  # Brand/site mentioned
    QUOTE = "quote"  # Direct quote from content
    RECOMMENDATION = "recommendation"  # Recommended by AI


class Citation(Base):
    """Citations of site content in AI responses."""

    __tablename__ = "citations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    query_id: Mapped[int] = mapped_column(ForeignKey("ai_queries.id"), nullable=False)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Citation Details
    citation_type: Mapped[CitationType] = mapped_column(SQLEnum(CitationType), nullable=False)
    llm_provider: Mapped[LLMProvider] = mapped_column(SQLEnum(LLMProvider), nullable=False)

    # Source
    source_url: Mapped[Optional[str]] = mapped_column(String(2000))
    source_title: Mapped[Optional[str]] = mapped_column(String(500))
    source_domain: Mapped[Optional[str]] = mapped_column(String(255))

    # Citation Context
    citation_text: Mapped[Optional[str]] = mapped_column(Text)  # The actual citation text
    surrounding_context: Mapped[Optional[str]] = mapped_column(Text)  # Text around citation
    position_in_response: Mapped[Optional[int]] = mapped_column(Integer)  # Word position

    # Quality Metrics
    is_accurate: Mapped[Optional[bool]] = mapped_column(Boolean)  # Verified accuracy
    is_positive: Mapped[Optional[bool]] = mapped_column(Boolean)  # Positive context

    # Matching
    matched_content_id: Mapped[Optional[int]] = mapped_column(ForeignKey("generated_content.id"))
    match_confidence: Mapped[Optional[float]] = mapped_column(Float)

    # Timestamps
    cited_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    query = relationship("AIQuery", back_populates="citations")

    def __repr__(self) -> str:
        return f"<Citation {self.citation_type.value} from {self.llm_provider.value}>"


class EEATScore(Base):
    """E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) scoring."""

    __tablename__ = "eeat_scores"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Scoring Date
    scored_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # E-E-A-T Scores (0-100)
    experience_score: Mapped[float] = mapped_column(Float, default=0.0)
    expertise_score: Mapped[float] = mapped_column(Float, default=0.0)
    authoritativeness_score: Mapped[float] = mapped_column(Float, default=0.0)
    trustworthiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    overall_eeat_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Experience Factors
    has_author_bios: Mapped[bool] = mapped_column(Boolean, default=False)
    has_case_studies: Mapped[bool] = mapped_column(Boolean, default=False)
    has_testimonials: Mapped[bool] = mapped_column(Boolean, default=False)
    has_original_research: Mapped[bool] = mapped_column(Boolean, default=False)
    content_age_months: Mapped[Optional[int]] = mapped_column(Integer)

    # Expertise Factors
    has_credentials: Mapped[bool] = mapped_column(Boolean, default=False)
    has_citations: Mapped[bool] = mapped_column(Boolean, default=False)
    topic_depth_score: Mapped[float] = mapped_column(Float, default=0.0)
    content_accuracy_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Authoritativeness Factors
    domain_authority: Mapped[Optional[int]] = mapped_column(Integer)
    backlink_quality_score: Mapped[float] = mapped_column(Float, default=0.0)
    brand_mentions_count: Mapped[int] = mapped_column(Integer, default=0)
    industry_recognition_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Trustworthiness Factors
    has_ssl: Mapped[bool] = mapped_column(Boolean, default=True)
    has_privacy_policy: Mapped[bool] = mapped_column(Boolean, default=False)
    has_contact_info: Mapped[bool] = mapped_column(Boolean, default=False)
    has_about_page: Mapped[bool] = mapped_column(Boolean, default=False)
    transparency_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Detailed Analysis
    analysis_data: Mapped[Optional[dict]] = mapped_column(JSON)
    recommendations: Mapped[Optional[list]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<EEATScore {self.overall_eeat_score} for site {self.site_id}>"
