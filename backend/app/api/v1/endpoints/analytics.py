"""
PieBot SEO - Analytics Endpoints
SEO metrics, reporting, and keyword tracking
"""

from datetime import datetime, timedelta
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.site import Site
from app.models.analytics import AnalyticsSnapshot, KeywordRanking, SearchEngine, DeviceType

router = APIRouter()


class AnalyticsSnapshotResponse(BaseModel):
    id: int
    site_id: int
    snapshot_date: datetime

    organic_sessions: int
    organic_users: int
    organic_pageviews: int

    gsc_impressions: int
    gsc_clicks: int
    gsc_ctr: Optional[float]
    gsc_avg_position: Optional[float]

    keywords_in_top_3: int
    keywords_in_top_10: int
    keywords_in_top_100: int

    overall_seo_score: Optional[int]
    llm_visibility_score: Optional[float]

    created_at: datetime

    class Config:
        from_attributes = True


class KeywordRankingResponse(BaseModel):
    id: int
    site_id: int
    keyword: str
    search_engine: SearchEngine
    device_type: DeviceType
    location: str

    ranking_date: datetime
    position: Optional[int]
    previous_position: Optional[int]
    position_change: int

    search_volume: Optional[int]
    keyword_difficulty: Optional[int]

    featured_snippet: bool
    ai_overview: bool

    gsc_impressions: int
    gsc_clicks: int

    class Config:
        from_attributes = True


class KeywordAdd(BaseModel):
    keyword: str
    search_engine: SearchEngine = SearchEngine.GOOGLE
    device_type: DeviceType = DeviceType.DESKTOP
    location: str = "US"


class DashboardMetrics(BaseModel):
    organic_traffic: int
    organic_traffic_change: float
    total_impressions: int
    impressions_change: float
    average_position: Optional[float]
    position_change: float
    keywords_ranking: int
    keywords_in_top_10: int
    seo_score: Optional[int]
    geo_visibility_score: Optional[float]


@router.get("/dashboard/{site_id}", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard metrics for a site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Get latest snapshot
    result = await db.execute(
        select(AnalyticsSnapshot)
        .where(AnalyticsSnapshot.site_id == site_id)
        .order_by(AnalyticsSnapshot.snapshot_date.desc())
        .limit(1)
    )
    latest = result.scalar_one_or_none()

    # Get previous snapshot for comparison (7 days ago)
    week_ago = datetime.utcnow() - timedelta(days=7)
    result = await db.execute(
        select(AnalyticsSnapshot)
        .where(
            AnalyticsSnapshot.site_id == site_id,
            AnalyticsSnapshot.snapshot_date <= week_ago,
        )
        .order_by(AnalyticsSnapshot.snapshot_date.desc())
        .limit(1)
    )
    previous = result.scalar_one_or_none()

    def calc_change(current, previous):
        if not current or not previous or previous == 0:
            return 0.0
        return ((current - previous) / previous) * 100

    return DashboardMetrics(
        organic_traffic=latest.organic_sessions if latest else 0,
        organic_traffic_change=calc_change(
            latest.organic_sessions if latest else 0,
            previous.organic_sessions if previous else 0,
        ),
        total_impressions=latest.gsc_impressions if latest else 0,
        impressions_change=calc_change(
            latest.gsc_impressions if latest else 0,
            previous.gsc_impressions if previous else 0,
        ),
        average_position=latest.gsc_avg_position if latest else None,
        position_change=calc_change(
            previous.gsc_avg_position if previous else 0,
            latest.gsc_avg_position if latest else 0,
        ),  # Lower is better for position
        keywords_ranking=latest.total_keywords_tracked if latest else 0,
        keywords_in_top_10=latest.keywords_in_top_10 if latest else 0,
        seo_score=site.overall_seo_score,
        geo_visibility_score=latest.llm_visibility_score if latest else None,
    )


@router.get("/snapshots", response_model=List[AnalyticsSnapshotResponse])
async def list_snapshots(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=365),
):
    """List analytics snapshots."""
    start_date = datetime.utcnow() - timedelta(days=days)

    query = (
        select(AnalyticsSnapshot)
        .join(Site)
        .where(
            Site.owner_id == current_user.id,
            AnalyticsSnapshot.snapshot_date >= start_date,
        )
    )

    if site_id:
        query = query.where(AnalyticsSnapshot.site_id == site_id)

    query = query.order_by(AnalyticsSnapshot.snapshot_date.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/keywords", response_model=List[KeywordRankingResponse])
async def list_keyword_rankings(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    search_engine: Optional[SearchEngine] = None,
    min_position: Optional[int] = None,
    max_position: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List keyword rankings."""
    query = (
        select(KeywordRanking)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(KeywordRanking.site_id == site_id)
    if search_engine:
        query = query.where(KeywordRanking.search_engine == search_engine)
    if min_position:
        query = query.where(KeywordRanking.position >= min_position)
    if max_position:
        query = query.where(KeywordRanking.position <= max_position)

    query = query.offset(skip).limit(limit).order_by(
        KeywordRanking.position.asc().nullslast(),
        KeywordRanking.search_volume.desc().nullslast(),
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/keywords/{site_id}")
async def add_keyword_to_track(
    site_id: int,
    keyword_data: KeywordAdd,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Add a keyword to track."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    # Check if keyword already tracked
    result = await db.execute(
        select(KeywordRanking).where(
            KeywordRanking.site_id == site_id,
            KeywordRanking.keyword == keyword_data.keyword,
            KeywordRanking.search_engine == keyword_data.search_engine,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Keyword already being tracked")

    # Create tracking record
    keyword = KeywordRanking(
        site_id=site_id,
        keyword=keyword_data.keyword,
        search_engine=keyword_data.search_engine,
        device_type=keyword_data.device_type,
        location=keyword_data.location,
        ranking_date=datetime.utcnow(),
    )

    db.add(keyword)
    await db.commit()
    await db.refresh(keyword)

    return {"message": "Keyword added for tracking", "keyword_id": keyword.id}


@router.get("/keywords/{site_id}/movers")
async def get_keyword_movers(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
):
    """Get biggest keyword position changes."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    # Get gainers (position improved = negative change since lower is better)
    gainers_result = await db.execute(
        select(KeywordRanking)
        .where(
            KeywordRanking.site_id == site_id,
            KeywordRanking.position_change < 0,
        )
        .order_by(KeywordRanking.position_change.asc())
        .limit(limit)
    )
    gainers = gainers_result.scalars().all()

    # Get losers
    losers_result = await db.execute(
        select(KeywordRanking)
        .where(
            KeywordRanking.site_id == site_id,
            KeywordRanking.position_change > 0,
        )
        .order_by(KeywordRanking.position_change.desc())
        .limit(limit)
    )
    losers = losers_result.scalars().all()

    return {
        "gainers": [
            {
                "keyword": k.keyword,
                "position": k.position,
                "change": abs(k.position_change),
                "search_volume": k.search_volume,
            }
            for k in gainers
        ],
        "losers": [
            {
                "keyword": k.keyword,
                "position": k.position,
                "change": k.position_change,
                "search_volume": k.search_volume,
            }
            for k in losers
        ],
    }


@router.get("/serp-features/{site_id}")
async def get_serp_features(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get SERP features owned by the site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    # Count SERP features
    features = {}
    for feature in ["featured_snippet", "people_also_ask", "local_pack", "video_carousel", "image_pack", "ai_overview"]:
        result = await db.execute(
            select(func.count())
            .where(
                KeywordRanking.site_id == site_id,
                getattr(KeywordRanking, feature) == True,
            )
        )
        features[feature] = result.scalar()

    return {
        "site_id": site_id,
        "serp_features": features,
        "total_keywords_with_features": sum(features.values()),
    }


@router.get("/reports/{site_id}")
async def generate_report(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    report_type: str = Query("weekly", enum=["daily", "weekly", "monthly"]),
):
    """Generate an SEO performance report."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    days_map = {"daily": 1, "weekly": 7, "monthly": 30}
    days = days_map[report_type]
    start_date = datetime.utcnow() - timedelta(days=days)

    # Get snapshots for the period
    result = await db.execute(
        select(AnalyticsSnapshot)
        .where(
            AnalyticsSnapshot.site_id == site_id,
            AnalyticsSnapshot.snapshot_date >= start_date,
        )
        .order_by(AnalyticsSnapshot.snapshot_date.asc())
    )
    snapshots = result.scalars().all()

    return {
        "site_id": site_id,
        "site_name": site.name,
        "report_type": report_type,
        "period": {
            "start": start_date,
            "end": datetime.utcnow(),
        },
        "summary": {
            "overall_seo_score": site.overall_seo_score,
            "technical_score": site.technical_seo_score,
            "content_score": site.content_score,
            "geo_visibility_score": site.geo_visibility_score,
        },
        "trends": {
            "organic_traffic": [s.organic_sessions for s in snapshots],
            "impressions": [s.gsc_impressions for s in snapshots],
            "position": [s.gsc_avg_position for s in snapshots],
            "dates": [s.snapshot_date.isoformat() for s in snapshots],
        },
        "recommendations": [
            "Focus on improving Core Web Vitals for better rankings",
            "Add more internal links to boost crawlability",
            "Optimize content for GEO to improve AI visibility",
        ],
    }
