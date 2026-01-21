"""
PieBot SEO - Sites Endpoints
Site management and configuration
"""

from datetime import datetime
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, HttpUrl
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.site import Site, SiteIntegration, CMSType, SEOPluginType, SiteStatus, IntegrationType

router = APIRouter()


# Pydantic schemas
class SiteCreate(BaseModel):
    name: str
    url: HttpUrl
    cms_type: CMSType = CMSType.WORDPRESS
    seo_plugin: SEOPluginType = SEOPluginType.AIOSEO
    is_local_business: bool = False
    content_language: str = "en"


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cms_type: Optional[CMSType] = None
    seo_plugin: Optional[SEOPluginType] = None
    is_local_business: Optional[bool] = None
    content_language: Optional[str] = None
    brand_voice_guidelines: Optional[str] = None

    # Automation settings
    auto_technical_seo: Optional[bool] = None
    auto_onpage_seo: Optional[bool] = None
    auto_schema_generation: Optional[bool] = None
    auto_internal_linking: Optional[bool] = None
    auto_meta_optimization: Optional[bool] = None
    auto_image_optimization: Optional[bool] = None
    auto_broken_link_fix: Optional[bool] = None
    auto_indexing: Optional[bool] = None

    # Local SEO
    auto_gbp_posts: Optional[bool] = None
    auto_review_replies: Optional[bool] = None
    gbp_post_frequency: Optional[str] = None

    # GEO
    geo_tracking_enabled: Optional[bool] = None
    tracked_brand_queries: Optional[List[str]] = None
    tracked_keywords: Optional[List[str]] = None


class SiteResponse(BaseModel):
    id: int
    name: str
    url: str
    domain: str
    cms_type: CMSType
    seo_plugin: SEOPluginType
    status: SiteStatus
    is_verified: bool
    pixel_installed: bool

    # Scores
    overall_seo_score: Optional[int]
    technical_seo_score: Optional[int]
    onpage_seo_score: Optional[int]
    content_score: Optional[int]
    local_seo_score: Optional[int]
    geo_visibility_score: Optional[int]
    eeat_score: Optional[int]

    # Settings
    is_local_business: bool
    geo_tracking_enabled: bool
    content_language: str

    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_crawl_at: Optional[datetime]

    class Config:
        from_attributes = True


class SiteDetailResponse(SiteResponse):
    description: Optional[str]
    brand_voice_guidelines: Optional[str]

    # All automation settings
    auto_technical_seo: bool
    auto_onpage_seo: bool
    auto_schema_generation: bool
    auto_internal_linking: bool
    auto_meta_optimization: bool
    auto_image_optimization: bool
    auto_broken_link_fix: bool
    auto_indexing: bool

    # Local SEO settings
    auto_gbp_posts: bool
    auto_review_replies: bool
    gbp_post_frequency: str

    # GEO settings
    tracked_brand_queries: Optional[List[str]]
    tracked_keywords: Optional[List[str]]


class IntegrationCreate(BaseModel):
    integration_type: IntegrationType
    wp_api_url: Optional[str] = None
    wp_username: Optional[str] = None
    wp_app_password: Optional[str] = None
    google_property_url: Optional[str] = None
    semrush_project_id: Optional[str] = None
    yext_location_id: Optional[str] = None


class IntegrationResponse(BaseModel):
    id: int
    integration_type: IntegrationType
    is_enabled: bool
    is_connected: bool
    last_sync_at: Optional[datetime]
    last_error: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


def extract_domain(url: str) -> str:
    """Extract domain from URL."""
    from urllib.parse import urlparse
    parsed = urlparse(str(url))
    return parsed.netloc.replace("www.", "")


@router.get("/", response_model=List[SiteResponse])
async def list_sites(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """List all sites for the current user."""
    result = await db.execute(
        select(Site)
        .where(Site.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Site.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(
    site_data: SiteCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Create a new site."""
    # Check site limit
    result = await db.execute(
        select(func.count()).select_from(Site).where(Site.owner_id == current_user.id)
    )
    site_count = result.scalar()

    if site_count >= current_user.max_sites:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Site limit reached. Your plan allows {current_user.max_sites} sites.",
        )

    # Check if domain already exists
    domain = extract_domain(str(site_data.url))
    result = await db.execute(select(Site).where(Site.domain == domain))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A site with this domain already exists",
        )

    # Create site
    site = Site(
        owner_id=current_user.id,
        name=site_data.name,
        url=str(site_data.url).rstrip("/"),
        domain=domain,
        cms_type=site_data.cms_type,
        seo_plugin=site_data.seo_plugin,
        is_local_business=site_data.is_local_business,
        content_language=site_data.content_language,
        status=SiteStatus.PENDING_SETUP,
    )

    db.add(site)
    await db.commit()
    await db.refresh(site)

    return site


@router.get("/{site_id}", response_model=SiteDetailResponse)
async def get_site(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get site details."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    return site


@router.put("/{site_id}", response_model=SiteDetailResponse)
async def update_site(
    site_id: int,
    updates: SiteUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Update site settings."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Update fields
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(site, field, value)

    await db.commit()
    await db.refresh(site)

    return site


@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Delete a site."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    await db.delete(site)
    await db.commit()


@router.get("/{site_id}/integrations", response_model=List[IntegrationResponse])
async def list_integrations(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """List all integrations for a site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    result = await db.execute(
        select(SiteIntegration).where(SiteIntegration.site_id == site_id)
    )
    return result.scalars().all()


@router.post("/{site_id}/integrations", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
async def create_integration(
    site_id: int,
    integration_data: IntegrationCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Add an integration to a site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Check if integration already exists
    result = await db.execute(
        select(SiteIntegration).where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == integration_data.integration_type,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Integration already exists")

    # Create integration
    integration = SiteIntegration(
        site_id=site_id,
        integration_type=integration_data.integration_type,
        wp_api_url=integration_data.wp_api_url,
        wp_username=integration_data.wp_username,
        wp_app_password=integration_data.wp_app_password,
        google_property_url=integration_data.google_property_url,
        semrush_project_id=integration_data.semrush_project_id,
        yext_location_id=integration_data.yext_location_id,
    )

    db.add(integration)
    await db.commit()
    await db.refresh(integration)

    return integration


@router.get("/{site_id}/dashboard")
async def get_site_dashboard(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard data for a site."""
    result = await db.execute(
        select(Site)
        .options(selectinload(Site.integrations))
        .where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    return {
        "site": {
            "id": site.id,
            "name": site.name,
            "url": site.url,
            "domain": site.domain,
            "status": site.status,
        },
        "scores": {
            "overall": site.overall_seo_score,
            "technical": site.technical_seo_score,
            "onpage": site.onpage_seo_score,
            "content": site.content_score,
            "local": site.local_seo_score if site.is_local_business else None,
            "geo_visibility": site.geo_visibility_score,
            "eeat": site.eeat_score,
        },
        "integrations": {
            i.integration_type.value: {
                "connected": i.is_connected,
                "enabled": i.is_enabled,
                "last_sync": i.last_sync_at,
            }
            for i in site.integrations
        },
        "automation": {
            "technical_seo": site.auto_technical_seo,
            "onpage_seo": site.auto_onpage_seo,
            "schema_generation": site.auto_schema_generation,
            "internal_linking": site.auto_internal_linking,
            "meta_optimization": site.auto_meta_optimization,
            "image_optimization": site.auto_image_optimization,
            "broken_link_fix": site.auto_broken_link_fix,
            "indexing": site.auto_indexing,
            "gbp_posts": site.auto_gbp_posts if site.is_local_business else None,
            "review_replies": site.auto_review_replies if site.is_local_business else None,
        },
        "last_crawl": site.last_crawl_at,
        "pixel_installed": site.pixel_installed,
    }
