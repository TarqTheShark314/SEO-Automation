"""
PieBot SEO - Audit Endpoints
Site auditing and issue management
"""

from datetime import datetime
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.site import Site
from app.models.audit import SiteAudit, AuditIssue, AuditStatus, AuditType, IssueSeverity, IssueCategory, IssueStatus

router = APIRouter()


# Pydantic schemas
class AuditCreate(BaseModel):
    site_id: int
    audit_type: AuditType = AuditType.FULL


class AuditResponse(BaseModel):
    id: int
    site_id: int
    audit_type: AuditType
    status: AuditStatus
    triggered_by: str

    pages_crawled: int
    pages_total: Optional[int]
    progress_percentage: float

    overall_score: Optional[int]
    technical_score: Optional[int]
    onpage_score: Optional[int]
    content_score: Optional[int]

    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    total_issues: int
    auto_fixable_issues: int

    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AuditDetailResponse(AuditResponse):
    # Core Web Vitals
    lcp_score: Optional[float]
    fid_score: Optional[float]
    cls_score: Optional[float]
    inp_score: Optional[float]
    ttfb_score: Optional[float]

    duration_seconds: Optional[int]
    error_message: Optional[str]


class IssueResponse(BaseModel):
    id: int
    issue_code: str
    title: str
    description: str
    severity: IssueSeverity
    category: IssueCategory
    status: IssueStatus

    page_url: Optional[str]
    affected_pages_count: int
    seo_impact_score: Optional[int]

    is_auto_fixable: bool
    fix_suggestion: Optional[str]
    fix_difficulty: str

    created_at: datetime
    fixed_at: Optional[datetime]

    class Config:
        from_attributes = True


class IssueUpdate(BaseModel):
    status: Optional[IssueStatus] = None


class BulkIssueAction(BaseModel):
    issue_ids: List[int]
    action: str  # fix, ignore, wont_fix


@router.get("/", response_model=List[AuditResponse])
async def list_audits(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    status: Optional[AuditStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List all audits for user's sites."""
    query = (
        select(SiteAudit)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(SiteAudit.site_id == site_id)
    if status:
        query = query.where(SiteAudit.status == status)

    query = query.offset(skip).limit(limit).order_by(SiteAudit.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(
    audit_data: AuditCreate,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Start a new site audit."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == audit_data.site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Check audit limits
    if current_user.monthly_audits_used >= current_user.max_monthly_audits:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Monthly audit limit reached ({current_user.max_monthly_audits})",
        )

    # Check for running audits
    result = await db.execute(
        select(SiteAudit).where(
            SiteAudit.site_id == audit_data.site_id,
            SiteAudit.status.in_([AuditStatus.PENDING, AuditStatus.RUNNING]),
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An audit is already running for this site")

    # Create audit
    audit = SiteAudit(
        site_id=audit_data.site_id,
        audit_type=audit_data.audit_type,
        status=AuditStatus.PENDING,
        triggered_by="manual",
    )

    db.add(audit)

    # Update usage
    current_user.monthly_audits_used += 1

    await db.commit()
    await db.refresh(audit)

    # Start audit in background (would trigger Celery task in production)
    # background_tasks.add_task(run_site_audit, audit.id)

    return audit


@router.get("/{audit_id}", response_model=AuditDetailResponse)
async def get_audit(
    audit_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get audit details."""
    result = await db.execute(
        select(SiteAudit)
        .join(Site)
        .where(SiteAudit.id == audit_id, Site.owner_id == current_user.id)
    )
    audit = result.scalar_one_or_none()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    return audit


@router.get("/{audit_id}/issues", response_model=List[IssueResponse])
async def list_audit_issues(
    audit_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    severity: Optional[IssueSeverity] = None,
    category: Optional[IssueCategory] = None,
    status: Optional[IssueStatus] = None,
    auto_fixable: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List issues from an audit."""
    # Verify audit access
    result = await db.execute(
        select(SiteAudit)
        .join(Site)
        .where(SiteAudit.id == audit_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Audit not found")

    query = select(AuditIssue).where(AuditIssue.audit_id == audit_id)

    if severity:
        query = query.where(AuditIssue.severity == severity)
    if category:
        query = query.where(AuditIssue.category == category)
    if status:
        query = query.where(AuditIssue.status == status)
    if auto_fixable is not None:
        query = query.where(AuditIssue.is_auto_fixable == auto_fixable)

    query = query.offset(skip).limit(limit).order_by(
        AuditIssue.severity.asc(),  # Critical first
        AuditIssue.seo_impact_score.desc().nullslast(),
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{audit_id}/issues/summary")
async def get_issues_summary(
    audit_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get summary of issues by category and severity."""
    # Verify audit access
    result = await db.execute(
        select(SiteAudit)
        .join(Site)
        .where(SiteAudit.id == audit_id, Site.owner_id == current_user.id)
    )
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # Get counts by severity
    severity_result = await db.execute(
        select(AuditIssue.severity, func.count())
        .where(AuditIssue.audit_id == audit_id)
        .group_by(AuditIssue.severity)
    )
    by_severity = {row[0].value: row[1] for row in severity_result.all()}

    # Get counts by category
    category_result = await db.execute(
        select(AuditIssue.category, func.count())
        .where(AuditIssue.audit_id == audit_id)
        .group_by(AuditIssue.category)
    )
    by_category = {row[0].value: row[1] for row in category_result.all()}

    # Get counts by status
    status_result = await db.execute(
        select(AuditIssue.status, func.count())
        .where(AuditIssue.audit_id == audit_id)
        .group_by(AuditIssue.status)
    )
    by_status = {row[0].value: row[1] for row in status_result.all()}

    # Auto-fixable count
    auto_fix_result = await db.execute(
        select(func.count())
        .where(AuditIssue.audit_id == audit_id, AuditIssue.is_auto_fixable == True)
    )
    auto_fixable_count = auto_fix_result.scalar()

    return {
        "total_issues": audit.total_issues,
        "by_severity": by_severity,
        "by_category": by_category,
        "by_status": by_status,
        "auto_fixable": auto_fixable_count,
        "scores": {
            "overall": audit.overall_score,
            "technical": audit.technical_score,
            "onpage": audit.onpage_score,
            "content": audit.content_score,
        },
    }


@router.patch("/issues/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: int,
    updates: IssueUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Update issue status."""
    result = await db.execute(
        select(AuditIssue)
        .join(SiteAudit)
        .join(Site)
        .where(AuditIssue.id == issue_id, Site.owner_id == current_user.id)
    )
    issue = result.scalar_one_or_none()

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if updates.status:
        issue.status = updates.status
        if updates.status == IssueStatus.FIXED:
            issue.fixed_at = datetime.utcnow()
            issue.fixed_by = "manual"

    await db.commit()
    await db.refresh(issue)

    return issue


@router.post("/issues/bulk-action")
async def bulk_issue_action(
    action_data: BulkIssueAction,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Perform bulk action on issues."""
    # Verify ownership of all issues
    result = await db.execute(
        select(AuditIssue)
        .join(SiteAudit)
        .join(Site)
        .where(
            AuditIssue.id.in_(action_data.issue_ids),
            Site.owner_id == current_user.id,
        )
    )
    issues = result.scalars().all()

    if len(issues) != len(action_data.issue_ids):
        raise HTTPException(status_code=404, detail="Some issues not found")

    # Apply action
    status_map = {
        "fix": IssueStatus.IN_PROGRESS,
        "ignore": IssueStatus.IGNORED,
        "wont_fix": IssueStatus.WONT_FIX,
    }

    if action_data.action not in status_map:
        raise HTTPException(status_code=400, detail="Invalid action")

    new_status = status_map[action_data.action]
    updated_count = 0

    for issue in issues:
        issue.status = new_status
        updated_count += 1

    await db.commit()

    return {"updated_count": updated_count, "new_status": new_status.value}


@router.post("/{audit_id}/auto-fix")
async def auto_fix_issues(
    audit_id: int,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    issue_ids: Optional[List[int]] = None,
):
    """Auto-fix eligible issues from an audit."""
    # Verify audit access
    result = await db.execute(
        select(SiteAudit)
        .options(selectinload(SiteAudit.issues))
        .join(Site)
        .where(SiteAudit.id == audit_id, Site.owner_id == current_user.id)
    )
    audit = result.scalar_one_or_none()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # Get auto-fixable issues
    query = select(AuditIssue).where(
        AuditIssue.audit_id == audit_id,
        AuditIssue.is_auto_fixable == True,
        AuditIssue.status == IssueStatus.OPEN,
    )

    if issue_ids:
        query = query.where(AuditIssue.id.in_(issue_ids))

    result = await db.execute(query)
    issues = result.scalars().all()

    if not issues:
        return {"message": "No auto-fixable issues found", "queued_count": 0}

    # Mark issues as in progress
    for issue in issues:
        issue.status = IssueStatus.IN_PROGRESS

    await db.commit()

    # Queue auto-fix tasks (would trigger Celery tasks in production)
    # for issue in issues:
    #     background_tasks.add_task(auto_fix_issue, issue.id)

    return {
        "message": f"Queued {len(issues)} issues for auto-fix",
        "queued_count": len(issues),
        "issue_ids": [issue.id for issue in issues],
    }
