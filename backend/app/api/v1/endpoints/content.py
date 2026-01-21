"""
PieBot SEO - Content Endpoints
AI content generation and optimization
"""

from datetime import datetime
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.models.site import Site
from app.models.content import GeneratedContent, ContentOptimization, TopicalMap, ContentType, ContentStatus

router = APIRouter()


# Pydantic schemas
class ContentGenerateRequest(BaseModel):
    site_id: int
    content_type: ContentType
    title: Optional[str] = None
    topic: str
    focus_keyword: Optional[str] = None
    secondary_keywords: Optional[List[str]] = None
    target_word_count: int = 1500
    tone: str = "professional"
    include_tldr: bool = True
    include_faq: bool = True
    geo_optimize: bool = True  # Optimize for AI search engines


class ContentOptimizeRequest(BaseModel):
    content_id: int
    target_keyword: Optional[str] = None
    improve_readability: bool = True
    add_internal_links: bool = True
    geo_optimize: bool = True


class ContentResponse(BaseModel):
    id: int
    site_id: int
    content_type: ContentType
    title: str
    status: ContentStatus

    content: str
    excerpt: Optional[str]

    meta_title: Optional[str]
    meta_description: Optional[str]
    focus_keyword: Optional[str]

    word_count: Optional[int]
    readability_score: Optional[float]
    seo_score: Optional[float]
    eeat_score: Optional[float]

    is_geo_optimized: bool
    has_tldr: bool
    has_statistics: bool

    ai_provider: str
    tokens_used: Optional[int]

    published_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TopicalMapCreate(BaseModel):
    site_id: int
    name: str
    main_topic: str
    description: Optional[str] = None


class TopicalMapResponse(BaseModel):
    id: int
    site_id: int
    name: str
    main_topic: str
    description: Optional[str]
    status: str

    topics: dict
    total_topics: int
    completed_topics: int
    total_search_volume: int

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MetaGenerateRequest(BaseModel):
    site_id: int
    page_url: str
    page_content: Optional[str] = None
    focus_keyword: Optional[str] = None


class MetaResponse(BaseModel):
    title: str
    description: str
    title_length: int
    description_length: int
    keyword_in_title: bool
    keyword_in_description: bool


@router.get("/", response_model=List[ContentResponse])
async def list_content(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    content_type: Optional[ContentType] = None,
    status: Optional[ContentStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List all generated content."""
    query = (
        select(GeneratedContent)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(GeneratedContent.site_id == site_id)
    if content_type:
        query = query.where(GeneratedContent.content_type == content_type)
    if status:
        query = query.where(GeneratedContent.status == status)

    query = query.offset(skip).limit(limit).order_by(GeneratedContent.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/generate", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def generate_content(
    request: ContentGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Generate new content using AI."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == request.site_id, Site.owner_id == current_user.id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # Check content generation limits
    if current_user.monthly_content_generations_used >= current_user.max_monthly_content_generations:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Monthly content generation limit reached ({current_user.max_monthly_content_generations})",
        )

    # Create content record
    content = GeneratedContent(
        site_id=request.site_id,
        content_type=request.content_type,
        title=request.title or f"Draft: {request.topic}",
        status=ContentStatus.DRAFT,
        content="",  # Will be filled by AI
        focus_keyword=request.focus_keyword,
        secondary_keywords=request.secondary_keywords,
        ai_provider=site.content_ai_provider,
        is_geo_optimized=request.geo_optimize,
        has_tldr=request.include_tldr,
    )

    db.add(content)

    # Update usage
    current_user.monthly_content_generations_used += 1

    await db.commit()
    await db.refresh(content)

    # In production, this would trigger AI content generation
    # background_tasks.add_task(generate_content_with_ai, content.id, request)

    # For now, return placeholder
    content.content = f"""# {request.topic}

## TL;DR
This is a placeholder for AI-generated content about {request.topic}.

## Introduction
Content would be generated here by Claude AI, optimized for both traditional SEO and AI search engines (GEO).

## Key Points
- Point 1 about {request.topic}
- Point 2 with statistics and data
- Point 3 with expert quotes

## Detailed Analysis
[AI-generated detailed content would appear here]

## FAQ
**Q: What is {request.topic}?**
A: [AI-generated answer]

**Q: Why is {request.topic} important?**
A: [AI-generated answer]

## Conclusion
[AI-generated conclusion]

---
*This content was generated by PieBot SEO using Claude AI, optimized for both search engines and AI assistants.*
"""
    content.word_count = len(content.content.split())
    content.reading_time_minutes = content.word_count // 200

    await db.commit()
    await db.refresh(content)

    return content


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get content details."""
    result = await db.execute(
        select(GeneratedContent)
        .join(Site)
        .where(GeneratedContent.id == content_id, Site.owner_id == current_user.id)
    )
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return content


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: int,
    updates: dict,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Update content."""
    result = await db.execute(
        select(GeneratedContent)
        .join(Site)
        .where(GeneratedContent.id == content_id, Site.owner_id == current_user.id)
    )
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    allowed_fields = {"title", "content", "excerpt", "meta_title", "meta_description", "focus_keyword", "status"}
    for field, value in updates.items():
        if field in allowed_fields:
            setattr(content, field, value)

    # Recalculate word count if content changed
    if "content" in updates:
        content.word_count = len(content.content.split())
        content.reading_time_minutes = content.word_count // 200

    await db.commit()
    await db.refresh(content)

    return content


@router.post("/{content_id}/optimize", response_model=ContentResponse)
async def optimize_content(
    content_id: int,
    request: ContentOptimizeRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Optimize existing content."""
    result = await db.execute(
        select(GeneratedContent)
        .join(Site)
        .where(GeneratedContent.id == content_id, Site.owner_id == current_user.id)
    )
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    # In production, this would use AI to optimize content
    # For now, just update the flags
    if request.geo_optimize:
        content.is_geo_optimized = True

    if request.target_keyword:
        content.focus_keyword = request.target_keyword

    await db.commit()
    await db.refresh(content)

    return content


@router.post("/{content_id}/publish")
async def publish_content(
    content_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Publish content to WordPress."""
    result = await db.execute(
        select(GeneratedContent)
        .join(Site)
        .where(GeneratedContent.id == content_id, Site.owner_id == current_user.id)
    )
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    # In production, this would publish to WordPress
    content.status = ContentStatus.PUBLISHED
    content.published_at = datetime.utcnow()

    await db.commit()

    return {"message": "Content published successfully", "content_id": content_id}


@router.post("/generate-meta", response_model=MetaResponse)
async def generate_meta(
    request: MetaGenerateRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Generate meta title and description for a page."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == request.site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, this would use AI to generate meta
    keyword = request.focus_keyword or "your topic"
    title = f"{keyword.title()} - Complete Guide | Your Brand"
    description = f"Discover everything about {keyword}. Expert insights, tips, and best practices to help you succeed. Learn more now!"

    return MetaResponse(
        title=title[:60],
        description=description[:155],
        title_length=len(title[:60]),
        description_length=len(description[:155]),
        keyword_in_title=keyword.lower() in title.lower(),
        keyword_in_description=keyword.lower() in description.lower(),
    )


# Topical Maps
@router.get("/topical-maps/", response_model=List[TopicalMapResponse])
async def list_topical_maps(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
):
    """List all topical maps."""
    query = (
        select(TopicalMap)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(TopicalMap.site_id == site_id)

    result = await db.execute(query.order_by(TopicalMap.created_at.desc()))
    return result.scalars().all()


@router.post("/topical-maps/", response_model=TopicalMapResponse, status_code=status.HTTP_201_CREATED)
async def create_topical_map(
    request: TopicalMapCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Generate a new topical map using AI."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == request.site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    # In production, this would use AI to generate the topical map
    topical_map = TopicalMap(
        site_id=request.site_id,
        name=request.name,
        main_topic=request.main_topic,
        description=request.description,
        topics={
            "pillar": {
                "keyword": request.main_topic,
                "search_volume": 1000,
                "content_id": None,
                "status": "planned",
            },
            "clusters": [
                {
                    "keyword": f"{request.main_topic} guide",
                    "search_volume": 500,
                    "status": "planned",
                },
                {
                    "keyword": f"{request.main_topic} tips",
                    "search_volume": 400,
                    "status": "planned",
                },
                {
                    "keyword": f"best {request.main_topic}",
                    "search_volume": 300,
                    "status": "planned",
                },
            ],
        },
        total_topics=4,
        total_search_volume=2200,
        ai_generated=True,
    )

    db.add(topical_map)
    await db.commit()
    await db.refresh(topical_map)

    return topical_map


@router.get("/topical-maps/{map_id}", response_model=TopicalMapResponse)
async def get_topical_map(
    map_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get topical map details."""
    result = await db.execute(
        select(TopicalMap)
        .join(Site)
        .where(TopicalMap.id == map_id, Site.owner_id == current_user.id)
    )
    topical_map = result.scalar_one_or_none()

    if not topical_map:
        raise HTTPException(status_code=404, detail="Topical map not found")

    return topical_map
