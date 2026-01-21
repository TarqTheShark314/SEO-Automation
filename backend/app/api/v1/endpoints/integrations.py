"""
PieBot SEO - Integrations Endpoints
Third-party service integrations (SEMrush, Yext, Google, etc.)
"""

from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.site import Site, SiteIntegration, IntegrationType

router = APIRouter()


class IntegrationStatus(BaseModel):
    integration_type: str
    is_configured: bool
    is_connected: bool
    last_sync: Optional[datetime]
    error: Optional[str]


class SEMrushConnect(BaseModel):
    api_key: str
    project_id: Optional[str] = None


class YextConnect(BaseModel):
    api_key: str
    account_id: str
    location_id: Optional[str] = None


class GoogleConnect(BaseModel):
    authorization_code: str
    property_url: str


@router.get("/status")
async def get_integration_status(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Get status of all available integrations."""
    return {
        "semrush": {
            "available": settings.SEMRUSH_API_ENABLED,
            "configured": bool(settings.SEMRUSH_API_KEY),
        },
        "yext": {
            "available": settings.YEXT_API_ENABLED,
            "configured": bool(settings.YEXT_API_KEY),
        },
        "google_search_console": {
            "available": settings.GSC_API_ENABLED,
            "configured": bool(settings.GOOGLE_CLIENT_ID),
        },
        "google_analytics": {
            "available": settings.GA4_API_ENABLED,
            "configured": bool(settings.GOOGLE_CLIENT_ID),
        },
        "google_business_profile": {
            "available": settings.GBP_API_ENABLED,
            "configured": bool(settings.GOOGLE_CLIENT_ID),
        },
    }


# SEMrush Integration
@router.post("/semrush/connect/{site_id}")
async def connect_semrush(
    site_id: int,
    credentials: SEMrushConnect,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Connect SEMrush to a site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Check if integration exists
    result = await db.execute(
        select(SiteIntegration).where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.SEMRUSH,
        )
    )
    integration = result.scalar_one_or_none()

    if integration:
        # Update existing
        integration.credentials = {"api_key": credentials.api_key}
        integration.semrush_project_id = credentials.project_id
        integration.is_connected = True
        integration.last_sync_at = datetime.utcnow()
    else:
        # Create new
        integration = SiteIntegration(
            site_id=site_id,
            integration_type=IntegrationType.SEMRUSH,
            credentials={"api_key": credentials.api_key},
            semrush_project_id=credentials.project_id,
            is_connected=True,
            last_sync_at=datetime.utcnow(),
        )
        db.add(integration)

    await db.commit()

    return {"message": "SEMrush connected successfully", "site_id": site_id}


@router.get("/semrush/keywords/{site_id}")
async def get_semrush_keywords(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get keyword data from SEMrush."""
    # Verify site ownership and integration
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.SEMRUSH,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="SEMrush not connected")

    # In production, fetch from SEMrush API
    return {
        "site_id": site_id,
        "organic_keywords": 1500,
        "paid_keywords": 50,
        "organic_traffic": 25000,
        "organic_cost": 15000,
        "top_keywords": [
            {"keyword": "example keyword 1", "position": 3, "volume": 2400},
            {"keyword": "example keyword 2", "position": 5, "volume": 1800},
            {"keyword": "example keyword 3", "position": 8, "volume": 1200},
        ],
    }


# Yext Integration
@router.post("/yext/connect/{site_id}")
async def connect_yext(
    site_id: int,
    credentials: YextConnect,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Connect Yext to a site."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    result = await db.execute(
        select(SiteIntegration).where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.YEXT,
        )
    )
    integration = result.scalar_one_or_none()

    if integration:
        integration.credentials = {
            "api_key": credentials.api_key,
            "account_id": credentials.account_id,
        }
        integration.yext_location_id = credentials.location_id
        integration.is_connected = True
        integration.last_sync_at = datetime.utcnow()
    else:
        integration = SiteIntegration(
            site_id=site_id,
            integration_type=IntegrationType.YEXT,
            credentials={
                "api_key": credentials.api_key,
                "account_id": credentials.account_id,
            },
            yext_location_id=credentials.location_id,
            is_connected=True,
            last_sync_at=datetime.utcnow(),
        )
        db.add(integration)

    await db.commit()

    return {"message": "Yext connected successfully", "site_id": site_id}


@router.get("/yext/listings/{site_id}")
async def get_yext_listings(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get listing status from Yext."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.YEXT,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="Yext not connected")

    # In production, fetch from Yext API
    return {
        "site_id": site_id,
        "total_listings": 75,
        "synced_listings": 70,
        "pending_listings": 3,
        "error_listings": 2,
        "directories": [
            {"name": "Google", "status": "synced", "url": "https://google.com/maps/..."},
            {"name": "Yelp", "status": "synced", "url": "https://yelp.com/biz/..."},
            {"name": "Facebook", "status": "pending", "url": None},
        ],
    }


# Google Integrations
@router.get("/google/auth-url")
async def get_google_auth_url(
    current_user: Annotated[User, Depends(get_current_active_user)],
    scopes: str = "search_console,analytics,business_profile",
):
    """Get Google OAuth authorization URL."""
    # In production, generate actual OAuth URL
    return {
        "auth_url": f"https://accounts.google.com/o/oauth2/auth?client_id={settings.GOOGLE_CLIENT_ID}&scope={scopes}&redirect_uri=https://app.bakemorepies.com/oauth/google/callback&response_type=code",
        "scopes": scopes.split(","),
    }


@router.post("/google/connect/{site_id}")
async def connect_google(
    site_id: int,
    credentials: GoogleConnect,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Connect Google services to a site."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, exchange code for tokens
    # For now, create the integrations

    for integration_type in [
        IntegrationType.GOOGLE_SEARCH_CONSOLE,
        IntegrationType.GOOGLE_ANALYTICS,
    ]:
        result = await db.execute(
            select(SiteIntegration).where(
                SiteIntegration.site_id == site_id,
                SiteIntegration.integration_type == integration_type,
            )
        )
        integration = result.scalar_one_or_none()

        if integration:
            integration.google_property_url = credentials.property_url
            integration.is_connected = True
            integration.last_sync_at = datetime.utcnow()
        else:
            integration = SiteIntegration(
                site_id=site_id,
                integration_type=integration_type,
                google_property_url=credentials.property_url,
                is_connected=True,
                last_sync_at=datetime.utcnow(),
            )
            db.add(integration)

    await db.commit()

    return {"message": "Google services connected successfully", "site_id": site_id}


@router.get("/google/search-console/{site_id}")
async def get_search_console_data(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    days: int = 28,
):
    """Get Google Search Console data."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.GOOGLE_SEARCH_CONSOLE,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="Google Search Console not connected")

    # In production, fetch from GSC API
    return {
        "site_id": site_id,
        "period_days": days,
        "totals": {
            "clicks": 15000,
            "impressions": 500000,
            "ctr": 0.03,
            "position": 18.5,
        },
        "top_queries": [
            {"query": "keyword 1", "clicks": 500, "impressions": 10000, "ctr": 0.05, "position": 5.2},
            {"query": "keyword 2", "clicks": 350, "impressions": 8000, "ctr": 0.044, "position": 7.1},
        ],
        "top_pages": [
            {"page": "/page-1", "clicks": 1000, "impressions": 25000},
            {"page": "/page-2", "clicks": 800, "impressions": 20000},
        ],
    }


@router.post("/sync/{site_id}")
async def sync_all_integrations(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Sync all connected integrations for a site."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.is_connected == True,
            Site.owner_id == current_user.id,
        )
    )
    integrations = result.scalars().all()

    if not integrations:
        raise HTTPException(status_code=400, detail="No connected integrations found")

    synced = []
    for integration in integrations:
        integration.last_sync_at = datetime.utcnow()
        synced.append(integration.integration_type.value)

    await db.commit()

    return {
        "message": "Sync initiated",
        "synced_integrations": synced,
        "count": len(synced),
    }
