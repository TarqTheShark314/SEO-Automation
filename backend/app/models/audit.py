"""
PieBot SEO - Site Audit Models
Technical SEO audit tracking and issues
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, JSON, Text, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuditStatus(str, Enum):
    """Audit status."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AuditType(str, Enum):
    """Types of audits."""

    FULL = "full"
    TECHNICAL = "technical"
    ONPAGE = "onpage"
    CONTENT = "content"
    LOCAL = "local"
    GEO = "geo"
    QUICK = "quick"


class SiteAudit(Base):
    """Site audit results and metadata."""

    __tablename__ = "site_audits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Audit Configuration
    audit_type: Mapped[AuditType] = mapped_column(SQLEnum(AuditType), default=AuditType.FULL)
    status: Mapped[AuditStatus] = mapped_column(SQLEnum(AuditStatus), default=AuditStatus.PENDING)
    triggered_by: Mapped[str] = mapped_column(String(50), default="manual")  # manual, scheduled, webhook

    # Progress
    pages_crawled: Mapped[int] = mapped_column(Integer, default=0)
    pages_total: Mapped[Optional[int]] = mapped_column(Integer)
    progress_percentage: Mapped[float] = mapped_column(Float, default=0.0)

    # Timing
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)

    # Scores
    overall_score: Mapped[Optional[int]] = mapped_column(Integer)  # 0-100
    technical_score: Mapped[Optional[int]] = mapped_column(Integer)
    onpage_score: Mapped[Optional[int]] = mapped_column(Integer)
    content_score: Mapped[Optional[int]] = mapped_column(Integer)
    ux_score: Mapped[Optional[int]] = mapped_column(Integer)
    security_score: Mapped[Optional[int]] = mapped_column(Integer)

    # Issue Counts
    critical_issues: Mapped[int] = mapped_column(Integer, default=0)
    high_issues: Mapped[int] = mapped_column(Integer, default=0)
    medium_issues: Mapped[int] = mapped_column(Integer, default=0)
    low_issues: Mapped[int] = mapped_column(Integer, default=0)
    info_issues: Mapped[int] = mapped_column(Integer, default=0)
    total_issues: Mapped[int] = mapped_column(Integer, default=0)
    auto_fixable_issues: Mapped[int] = mapped_column(Integer, default=0)

    # Core Web Vitals
    lcp_score: Mapped[Optional[float]] = mapped_column(Float)  # Largest Contentful Paint
    fid_score: Mapped[Optional[float]] = mapped_column(Float)  # First Input Delay
    cls_score: Mapped[Optional[float]] = mapped_column(Float)  # Cumulative Layout Shift
    inp_score: Mapped[Optional[float]] = mapped_column(Float)  # Interaction to Next Paint
    ttfb_score: Mapped[Optional[float]] = mapped_column(Float)  # Time to First Byte

    # Raw Data
    crawl_data: Mapped[Optional[dict]] = mapped_column(JSON)
    lighthouse_data: Mapped[Optional[dict]] = mapped_column(JSON)
    schema_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Error handling
    error_message: Mapped[Optional[str]] = mapped_column(Text)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="audits")
    issues = relationship("AuditIssue", back_populates="audit", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<SiteAudit {self.id} for site {self.site_id}>"


class IssueSeverity(str, Enum):
    """Issue severity levels."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class IssueCategory(str, Enum):
    """Categories of SEO issues."""

    # Technical SEO
    INDEXABILITY = "indexability"
    CRAWLABILITY = "crawlability"
    SITE_SPEED = "site_speed"
    CORE_WEB_VITALS = "core_web_vitals"
    MOBILE = "mobile"
    SECURITY = "security"
    STRUCTURED_DATA = "structured_data"
    REDIRECTS = "redirects"
    BROKEN_LINKS = "broken_links"
    CANONICAL = "canonical"
    HREFLANG = "hreflang"
    SITEMAP = "sitemap"
    ROBOTS = "robots"

    # On-Page SEO
    TITLE = "title"
    META_DESCRIPTION = "meta_description"
    HEADINGS = "headings"
    CONTENT = "content"
    IMAGES = "images"
    INTERNAL_LINKS = "internal_links"
    EXTERNAL_LINKS = "external_links"
    KEYWORDS = "keywords"

    # Other
    ACCESSIBILITY = "accessibility"
    SOCIAL = "social"
    ANALYTICS = "analytics"


class IssueStatus(str, Enum):
    """Status of an issue."""

    OPEN = "open"
    IN_PROGRESS = "in_progress"
    FIXED = "fixed"
    IGNORED = "ignored"
    WONT_FIX = "wont_fix"
    AUTO_FIXED = "auto_fixed"


class AuditIssue(Base):
    """Individual issues found during audit."""

    __tablename__ = "audit_issues"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("site_audits.id"), nullable=False)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"), nullable=False)

    # Issue Details
    issue_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Classification
    severity: Mapped[IssueSeverity] = mapped_column(SQLEnum(IssueSeverity), nullable=False)
    category: Mapped[IssueCategory] = mapped_column(SQLEnum(IssueCategory), nullable=False)
    status: Mapped[IssueStatus] = mapped_column(SQLEnum(IssueStatus), default=IssueStatus.OPEN)

    # Location
    page_url: Mapped[Optional[str]] = mapped_column(String(2000))
    element_selector: Mapped[Optional[str]] = mapped_column(String(500))
    element_html: Mapped[Optional[str]] = mapped_column(Text)
    line_number: Mapped[Optional[int]] = mapped_column(Integer)

    # Impact
    affected_pages_count: Mapped[int] = mapped_column(Integer, default=1)
    seo_impact_score: Mapped[Optional[int]] = mapped_column(Integer)  # 1-10

    # Fix Information
    is_auto_fixable: Mapped[bool] = mapped_column(Boolean, default=False)
    fix_suggestion: Mapped[Optional[str]] = mapped_column(Text)
    fix_code: Mapped[Optional[str]] = mapped_column(Text)  # Code to fix the issue
    fix_difficulty: Mapped[str] = mapped_column(String(20), default="medium")  # easy, medium, hard

    # Resolution
    fixed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    fixed_by: Mapped[Optional[str]] = mapped_column(String(50))  # user, auto, manual

    # Additional Data
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    audit = relationship("SiteAudit", back_populates="issues")

    def __repr__(self) -> str:
        return f"<AuditIssue {self.issue_code}: {self.title[:50]}>"
