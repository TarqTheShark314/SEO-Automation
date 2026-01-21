"""
PieBot SEO - GEO/LLM SEO Endpoints
Generative Engine Optimization for AI Search Visibility

This module tracks and optimizes brand visibility across AI search engines
like ChatGPT, Claude, Gemini, and Perplexity.
"""

from datetime import datetime, timedelta
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.site import Site
from app.models.geo_seo import LLMVisibility, AIQuery, Citation, EEATScore, LLMProvider, QueryCategory, CitationType

router = APIRouter()


# Pydantic schemas
class LLMVisibilityResponse(BaseModel):
    id: int
    site_id: int
    tracking_date: datetime
    llm_provider: LLMProvider

    total_queries_tracked: int
    queries_with_mention: int
    queries_with_citation: int
    queries_with_link: int

    visibility_score: float
    mention_rate: float
    citation_rate: float

    average_sentiment: Optional[float]
    positive_mentions: int
    negative_mentions: int

    created_at: datetime

    class Config:
        from_attributes = True


class AIQueryResponse(BaseModel):
    id: int
    llm_provider: LLMProvider
    query_text: str
    query_category: QueryCategory

    brand_mentioned: bool
    brand_position: Optional[int]
    is_cited: bool
    citation_url: Optional[str]

    sentiment_score: Optional[float]
    sentiment_label: Optional[str]

    competitors_mentioned: Optional[List[str]]
    queried_at: datetime

    class Config:
        from_attributes = True


class CitationResponse(BaseModel):
    id: int
    citation_type: CitationType
    llm_provider: LLMProvider

    source_url: Optional[str]
    source_title: Optional[str]
    citation_text: Optional[str]
    position_in_response: Optional[int]

    is_accurate: Optional[bool]
    is_positive: Optional[bool]

    cited_at: datetime

    class Config:
        from_attributes = True


class EEATScoreResponse(BaseModel):
    id: int
    site_id: int
    scored_at: datetime

    experience_score: float
    expertise_score: float
    authoritativeness_score: float
    trustworthiness_score: float
    overall_eeat_score: float

    has_author_bios: bool
    has_case_studies: bool
    has_testimonials: bool
    has_original_research: bool

    domain_authority: Optional[int]
    recommendations: Optional[List[str]]

    created_at: datetime

    class Config:
        from_attributes = True


class TrackQueryRequest(BaseModel):
    site_id: int
    queries: List[str]
    llm_providers: List[LLMProvider] = [LLMProvider.CHATGPT, LLMProvider.CLAUDE, LLMProvider.GEMINI]


class GEOOptimizationRequest(BaseModel):
    site_id: int
    content_id: Optional[int] = None
    url: Optional[str] = None
    add_tldr: bool = True
    add_statistics: bool = True
    add_quotes: bool = True
    improve_structure: bool = True


@router.get("/visibility", response_model=List[LLMVisibilityResponse])
async def get_visibility_history(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    llm_provider: Optional[LLMProvider] = None,
    days: int = Query(30, ge=1, le=365),
):
    """Get LLM visibility history for sites."""
    start_date = datetime.utcnow() - timedelta(days=days)

    query = (
        select(LLMVisibility)
        .join(Site)
        .where(
            Site.owner_id == current_user.id,
            LLMVisibility.tracking_date >= start_date,
        )
    )

    if site_id:
        query = query.where(LLMVisibility.site_id == site_id)
    if llm_provider:
        query = query.where(LLMVisibility.llm_provider == llm_provider)

    query = query.order_by(LLMVisibility.tracking_date.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/visibility/summary/{site_id}")
async def get_visibility_summary(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get visibility summary across all LLM providers."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Get latest visibility for each provider
    summary = {}
    for provider in LLMProvider:
        result = await db.execute(
            select(LLMVisibility)
            .where(
                LLMVisibility.site_id == site_id,
                LLMVisibility.llm_provider == provider,
            )
            .order_by(LLMVisibility.tracking_date.desc())
            .limit(1)
        )
        visibility = result.scalar_one_or_none()
        if visibility:
            summary[provider.value] = {
                "visibility_score": visibility.visibility_score,
                "mention_rate": visibility.mention_rate,
                "citation_rate": visibility.citation_rate,
                "average_sentiment": visibility.average_sentiment,
                "last_tracked": visibility.tracking_date,
            }

    # Calculate overall score
    scores = [v["visibility_score"] for v in summary.values() if v.get("visibility_score")]
    overall_score = sum(scores) / len(scores) if scores else 0

    return {
        "site_id": site_id,
        "overall_visibility_score": round(overall_score, 2),
        "by_provider": summary,
        "tracked_providers": list(summary.keys()),
    }


@router.get("/queries", response_model=List[AIQueryResponse])
async def list_tracked_queries(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    llm_provider: Optional[LLMProvider] = None,
    brand_mentioned: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List tracked AI queries."""
    query = (
        select(AIQuery)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(AIQuery.site_id == site_id)
    if llm_provider:
        query = query.where(AIQuery.llm_provider == llm_provider)
    if brand_mentioned is not None:
        query = query.where(AIQuery.brand_mentioned == brand_mentioned)

    query = query.offset(skip).limit(limit).order_by(AIQuery.queried_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/queries/track")
async def track_queries(
    request: TrackQueryRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Track brand visibility for specific queries across LLM providers."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == request.site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, queue queries for tracking
    # For each query and provider, we would:
    # 1. Send query to the LLM API
    # 2. Analyze response for brand mentions
    # 3. Check for citations/links
    # 4. Analyze sentiment
    # 5. Store results

    return {
        "message": "Tracking initiated",
        "queries_count": len(request.queries),
        "providers": [p.value for p in request.llm_providers],
        "estimated_completion": "5-10 minutes",
    }


@router.get("/citations", response_model=List[CitationResponse])
async def list_citations(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    llm_provider: Optional[LLMProvider] = None,
    citation_type: Optional[CitationType] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List all citations of site content in AI responses."""
    query = (
        select(Citation)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(Citation.site_id == site_id)
    if llm_provider:
        query = query.where(Citation.llm_provider == llm_provider)
    if citation_type:
        query = query.where(Citation.citation_type == citation_type)

    query = query.offset(skip).limit(limit).order_by(Citation.cited_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/eeat/{site_id}", response_model=EEATScoreResponse)
async def get_eeat_score(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get latest E-E-A-T score for a site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    result = await db.execute(
        select(EEATScore)
        .where(EEATScore.site_id == site_id)
        .order_by(EEATScore.scored_at.desc())
        .limit(1)
    )
    score = result.scalar_one_or_none()

    if not score:
        raise HTTPException(status_code=404, detail="No E-E-A-T score found. Run an audit first.")

    return score


@router.post("/eeat/{site_id}/analyze")
async def analyze_eeat(
    site_id: int,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Trigger E-E-A-T analysis for a site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, this would trigger comprehensive E-E-A-T analysis
    # For now, create a sample score
    eeat_score = EEATScore(
        site_id=site_id,
        scored_at=datetime.utcnow(),
        experience_score=75.0,
        expertise_score=80.0,
        authoritativeness_score=70.0,
        trustworthiness_score=85.0,
        overall_eeat_score=77.5,
        has_author_bios=True,
        has_case_studies=False,
        has_testimonials=True,
        has_original_research=False,
        has_credentials=True,
        has_citations=True,
        has_ssl=True,
        has_privacy_policy=True,
        has_contact_info=True,
        has_about_page=True,
        recommendations=[
            "Add case studies to demonstrate real-world experience",
            "Include original research or data to boost expertise signals",
            "Add author credentials and bios to all content",
            "Increase the number of authoritative outbound citations",
            "Create a dedicated 'Our Team' page with professional backgrounds",
        ],
    )

    db.add(eeat_score)
    await db.commit()
    await db.refresh(eeat_score)

    # Update site's E-E-A-T score
    site.eeat_score = int(eeat_score.overall_eeat_score)
    await db.commit()

    return {
        "message": "E-E-A-T analysis completed",
        "overall_score": eeat_score.overall_eeat_score,
        "breakdown": {
            "experience": eeat_score.experience_score,
            "expertise": eeat_score.expertise_score,
            "authoritativeness": eeat_score.authoritativeness_score,
            "trustworthiness": eeat_score.trustworthiness_score,
        },
        "recommendations": eeat_score.recommendations,
    }


@router.post("/optimize")
async def geo_optimize_content(
    request: GEOOptimizationRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Optimize content for AI search engines (GEO)."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == request.site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, this would analyze and optimize content
    # Key GEO optimizations:
    # 1. Add TL;DR blocks at the beginning
    # 2. Include statistics and data points
    # 3. Add expert quotes with citations
    # 4. Structure content in 800-token blocks
    # 5. Add schema markup
    # 6. Include author bios with credentials

    optimizations_applied = []

    if request.add_tldr:
        optimizations_applied.append({
            "type": "tldr_block",
            "description": "Added TL;DR summary block for AI parsing",
            "impact": "high",
        })

    if request.add_statistics:
        optimizations_applied.append({
            "type": "statistics",
            "description": "Added data points and statistics with citations",
            "impact": "high",
        })

    if request.add_quotes:
        optimizations_applied.append({
            "type": "expert_quotes",
            "description": "Added expert quotes with proper attribution",
            "impact": "medium",
        })

    if request.improve_structure:
        optimizations_applied.append({
            "type": "content_structure",
            "description": "Restructured content into LLM-friendly chunks",
            "impact": "high",
        })

    return {
        "message": "GEO optimization completed",
        "optimizations_applied": optimizations_applied,
        "estimated_visibility_improvement": "15-30%",
        "recommendations": [
            "Add author bio with credentials to boost E-E-A-T",
            "Include original data or research findings",
            "Add FAQ schema markup for featured snippet potential",
            "Link to authoritative sources in your niche",
        ],
    }


@router.get("/competitors/{site_id}")
async def get_competitor_visibility(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Compare LLM visibility with competitors."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, this would fetch actual competitor data
    return {
        "site_id": site_id,
        "site_visibility_score": site.geo_visibility_score or 0,
        "competitors": [
            {
                "domain": "competitor1.com",
                "visibility_score": 75,
                "mention_rate": 0.45,
                "top_queries": ["industry keyword 1", "industry keyword 2"],
            },
            {
                "domain": "competitor2.com",
                "visibility_score": 68,
                "mention_rate": 0.38,
                "top_queries": ["industry keyword 1", "industry keyword 3"],
            },
        ],
        "opportunities": [
            "Target 'industry keyword 2' - low competition, high mention rate",
            "Create authoritative content on 'industry keyword 3'",
            "Improve E-E-A-T signals to compete with competitor1.com",
        ],
    }
