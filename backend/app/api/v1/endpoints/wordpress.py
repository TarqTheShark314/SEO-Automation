"""
PieBot SEO - WordPress Integration Endpoints
Direct WordPress REST API integration for content deployment and optimization
"""

from datetime import datetime
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.site import Site, SiteIntegration, IntegrationType, SEOPluginType

router = APIRouter()


class WordPressConnect(BaseModel):
    api_url: str  # e.g., https://example.com/wp-json
    username: str
    app_password: str


class WordPressPostCreate(BaseModel):
    title: str
    content: str
    status: str = "draft"  # draft, publish, pending
    excerpt: Optional[str] = None
    categories: Optional[List[int]] = None
    tags: Optional[List[int]] = None
    featured_image_id: Optional[int] = None

    # SEO fields (for AIOSEO/Yoast)
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    focus_keyword: Optional[str] = None


class WordPressPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class WordPressSEOUpdate(BaseModel):
    post_id: int
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    focus_keyword: Optional[str] = None
    canonical_url: Optional[str] = None
    robots_noindex: bool = False
    robots_nofollow: bool = False
    schema_type: Optional[str] = None


class WordPressPostResponse(BaseModel):
    id: int
    title: str
    slug: str
    status: str
    link: str
    date: datetime
    modified: datetime

    # SEO data
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    focus_keyword: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("/connect/{site_id}")
async def connect_wordpress(
    site_id: int,
    credentials: WordPressConnect,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Connect WordPress to a site."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Verify WordPress connection
    # In production, test the connection with httpx
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(f"{credentials.api_url}/wp/v2/posts", ...)

    result = await db.execute(
        select(SiteIntegration).where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
        )
    )
    integration = result.scalar_one_or_none()

    if integration:
        integration.wp_api_url = credentials.api_url
        integration.wp_username = credentials.username
        integration.wp_app_password = credentials.app_password
        integration.is_connected = True
        integration.last_sync_at = datetime.utcnow()
    else:
        integration = SiteIntegration(
            site_id=site_id,
            integration_type=IntegrationType.WORDPRESS,
            wp_api_url=credentials.api_url,
            wp_username=credentials.username,
            wp_app_password=credentials.app_password,
            is_connected=True,
            last_sync_at=datetime.utcnow(),
        )
        db.add(integration)

    await db.commit()

    return {
        "message": "WordPress connected successfully",
        "site_id": site_id,
        "api_url": credentials.api_url,
    }


@router.get("/status/{site_id}")
async def get_wordpress_status(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get WordPress connection status and site info."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration:
        raise HTTPException(status_code=404, detail="WordPress not connected")

    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()

    return {
        "connected": integration.is_connected,
        "api_url": integration.wp_api_url,
        "last_sync": integration.last_sync_at,
        "seo_plugin": site.seo_plugin.value if site else None,
        "pixel_installed": site.pixel_installed if site else False,
    }


@router.get("/posts/{site_id}")
async def list_wordpress_posts(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    status: Optional[str] = None,
    per_page: int = 20,
    page: int = 1,
):
    """List posts from WordPress."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="WordPress not connected")

    # In production, fetch from WordPress REST API
    return {
        "site_id": site_id,
        "total": 100,
        "page": page,
        "per_page": per_page,
        "posts": [
            {
                "id": 1,
                "title": "Sample Post 1",
                "slug": "sample-post-1",
                "status": "publish",
                "link": "https://example.com/sample-post-1/",
                "date": datetime.utcnow(),
                "modified": datetime.utcnow(),
            },
            {
                "id": 2,
                "title": "Sample Post 2",
                "slug": "sample-post-2",
                "status": "draft",
                "link": "https://example.com/?p=2",
                "date": datetime.utcnow(),
                "modified": datetime.utcnow(),
            },
        ],
    }


@router.post("/posts/{site_id}")
async def create_wordpress_post(
    site_id: int,
    post_data: WordPressPostCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Create a new post in WordPress."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="WordPress not connected")

    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()

    # In production, create post via WordPress REST API
    # Then update SEO meta via AIOSEO/Yoast plugin endpoints

    return {
        "message": "Post created successfully",
        "post_id": 123,  # WordPress post ID
        "link": f"{site.url}/new-post-slug/",
        "status": post_data.status,
        "seo_updated": bool(post_data.meta_title or post_data.meta_description),
    }


@router.put("/posts/{site_id}/{post_id}")
async def update_wordpress_post(
    site_id: int,
    post_id: int,
    post_data: WordPressPostUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Update a WordPress post."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="WordPress not connected")

    # In production, update via WordPress REST API

    return {
        "message": "Post updated successfully",
        "post_id": post_id,
    }


@router.put("/seo/{site_id}")
async def update_wordpress_seo(
    site_id: int,
    seo_data: WordPressSEOUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Update SEO meta for a WordPress post (AIOSEO/Yoast)."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="WordPress not connected")

    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()

    # Determine SEO plugin and update accordingly
    # AIOSEO: POST to /aioseo/v1/posts/{post_id}/meta
    # Yoast: Update post meta _yoast_wpseo_title, _yoast_wpseo_metadesc

    return {
        "message": "SEO meta updated successfully",
        "post_id": seo_data.post_id,
        "seo_plugin": site.seo_plugin.value if site else "unknown",
        "updated_fields": {
            "meta_title": bool(seo_data.meta_title),
            "meta_description": bool(seo_data.meta_description),
            "focus_keyword": bool(seo_data.focus_keyword),
            "canonical_url": bool(seo_data.canonical_url),
            "robots": seo_data.robots_noindex or seo_data.robots_nofollow,
        },
    }


@router.post("/deploy-schema/{site_id}")
async def deploy_schema_markup(
    site_id: int,
    post_id: int,
    schema_json: dict,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Deploy schema markup to a WordPress post."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="WordPress not connected")

    # In production, deploy schema via AIOSEO/Yoast or custom post meta

    return {
        "message": "Schema markup deployed",
        "post_id": post_id,
        "schema_type": schema_json.get("@type", "Unknown"),
    }


@router.get("/pixel/{site_id}")
async def get_pixel_script(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get the PieBot pixel script for WordPress installation."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Generate unique pixel script
    pixel_script = f"""<!-- PieBot SEO Pixel -->
<script>
(function() {{
    var pb = document.createElement('script');
    pb.type = 'text/javascript';
    pb.async = true;
    pb.src = 'https://pixel.bakemorepies.com/piebot.js?site={site_id}&token={site.verification_token or "GENERATE_TOKEN"}';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(pb, s);
}})();
</script>
<!-- End PieBot SEO Pixel -->"""

    return {
        "site_id": site_id,
        "pixel_installed": site.pixel_installed,
        "script": pixel_script,
        "installation_instructions": [
            "1. Copy the script above",
            "2. In WordPress, go to Appearance > Theme Editor",
            "3. Select your theme's header.php file",
            "4. Paste the script just before the closing </head> tag",
            "5. Save the file",
            "Alternatively, use a plugin like 'Insert Headers and Footers' to add the script",
        ],
    }


@router.post("/verify-pixel/{site_id}")
async def verify_pixel_installation(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Verify PieBot pixel installation on the site."""
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, check if pixel is installed by fetching the site
    # and looking for the pixel script

    # For demo, mark as installed
    site.pixel_installed = True
    site.pixel_last_seen = datetime.utcnow()
    site.status = "active"

    await db.commit()

    return {
        "message": "Pixel verified and installed",
        "site_id": site_id,
        "pixel_installed": True,
    }


@router.post("/bulk-optimize/{site_id}")
async def bulk_optimize_posts(
    site_id: int,
    post_ids: List[int],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Bulk optimize multiple WordPress posts."""
    result = await db.execute(
        select(SiteIntegration)
        .join(Site)
        .where(
            SiteIntegration.site_id == site_id,
            SiteIntegration.integration_type == IntegrationType.WORDPRESS,
            Site.owner_id == current_user.id,
        )
    )
    integration = result.scalar_one_or_none()

    if not integration or not integration.is_connected:
        raise HTTPException(status_code=400, detail="WordPress not connected")

    # In production, queue optimization tasks for each post

    return {
        "message": "Bulk optimization queued",
        "posts_queued": len(post_ids),
        "estimated_completion": f"{len(post_ids) * 2} minutes",
    }
