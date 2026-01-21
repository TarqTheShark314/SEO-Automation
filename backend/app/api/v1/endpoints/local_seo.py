"""
PieBot SEO - Local SEO Endpoints
GBP management, reviews, and local optimization
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
from app.models.local_seo import GBPLocation, GBPPost, Review, GBPPostType, GBPPostStatus, ReviewStatus, ReviewSource

router = APIRouter()


# Pydantic schemas
class GBPLocationResponse(BaseModel):
    id: int
    site_id: int
    gbp_location_id: str
    business_name: str
    primary_category: Optional[str]

    address_line1: Optional[str]
    city: Optional[str]
    state: Optional[str]
    postal_code: Optional[str]

    phone: Optional[str]
    website: Optional[str]

    total_reviews: int
    average_rating: float
    profile_completeness: int

    auto_post_enabled: bool
    auto_reply_enabled: bool

    last_synced_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class GBPPostCreate(BaseModel):
    location_id: int
    post_type: GBPPostType = GBPPostType.WHATS_NEW
    content: str
    title: Optional[str] = None
    call_to_action_type: Optional[str] = None
    call_to_action_url: Optional[str] = None
    image_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    ai_generate: bool = False


class GBPPostResponse(BaseModel):
    id: int
    location_id: int
    post_type: GBPPostType
    status: GBPPostStatus

    title: Optional[str]
    content: str
    call_to_action_type: Optional[str]
    call_to_action_url: Optional[str]
    image_url: Optional[str]

    ai_generated: bool
    scheduled_at: Optional[datetime]
    published_at: Optional[datetime]

    views: int
    clicks: int

    created_at: datetime

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    id: int
    location_id: int
    source: ReviewSource
    external_review_id: str

    reviewer_name: Optional[str]
    rating: int
    review_text: Optional[str]

    sentiment_score: Optional[float]
    sentiment_label: Optional[str]

    status: ReviewStatus
    response_text: Optional[str]
    response_ai_generated: bool
    responded_at: Optional[datetime]

    requires_attention: bool
    review_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewReplyRequest(BaseModel):
    response_text: Optional[str] = None
    ai_generate: bool = True


class AutoPostSettingsUpdate(BaseModel):
    auto_post_enabled: bool
    post_frequency: str = "weekly"
    post_types: List[str] = ["whats_new"]
    include_cta: bool = True
    cta_type: str = "LEARN_MORE"


@router.get("/locations", response_model=List[GBPLocationResponse])
async def list_locations(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
):
    """List all GBP locations."""
    query = (
        select(GBPLocation)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(GBPLocation.site_id == site_id)

    result = await db.execute(query.order_by(GBPLocation.created_at.desc()))
    return result.scalars().all()


@router.get("/locations/{location_id}", response_model=GBPLocationResponse)
async def get_location(
    location_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get GBP location details."""
    result = await db.execute(
        select(GBPLocation)
        .join(Site)
        .where(GBPLocation.id == location_id, Site.owner_id == current_user.id)
    )
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    return location


@router.post("/locations/{location_id}/sync")
async def sync_location(
    location_id: int,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Sync location data from GBP."""
    result = await db.execute(
        select(GBPLocation)
        .join(Site)
        .where(GBPLocation.id == location_id, Site.owner_id == current_user.id)
    )
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    # In production, trigger GBP sync
    location.last_synced_at = datetime.utcnow()
    await db.commit()

    return {"message": "Sync initiated", "location_id": location_id}


# GBP Posts
@router.get("/posts", response_model=List[GBPPostResponse])
async def list_posts(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    location_id: Optional[int] = None,
    status: Optional[GBPPostStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List all GBP posts."""
    query = (
        select(GBPPost)
        .join(GBPLocation)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if location_id:
        query = query.where(GBPPost.location_id == location_id)
    if status:
        query = query.where(GBPPost.status == status)

    query = query.offset(skip).limit(limit).order_by(GBPPost.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/posts", response_model=GBPPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: GBPPostCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Create a new GBP post."""
    # Verify location ownership
    result = await db.execute(
        select(GBPLocation)
        .join(Site)
        .where(GBPLocation.id == post_data.location_id, Site.owner_id == current_user.id)
    )
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    content = post_data.content
    ai_generated = False

    # In production, generate content with AI if requested
    if post_data.ai_generate:
        ai_generated = True
        content = f"🎉 {post_data.content}\n\nVisit us today to learn more about our latest offerings! We're committed to providing the best service to our community.\n\n#LocalBusiness #Community"

    post = GBPPost(
        location_id=post_data.location_id,
        post_type=post_data.post_type,
        status=GBPPostStatus.SCHEDULED if post_data.scheduled_at else GBPPostStatus.DRAFT,
        title=post_data.title,
        content=content,
        call_to_action_type=post_data.call_to_action_type,
        call_to_action_url=post_data.call_to_action_url,
        image_url=post_data.image_url,
        scheduled_at=post_data.scheduled_at,
        ai_generated=ai_generated,
    )

    db.add(post)
    await db.commit()
    await db.refresh(post)

    return post


@router.post("/posts/{post_id}/publish")
async def publish_post(
    post_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Publish a GBP post immediately."""
    result = await db.execute(
        select(GBPPost)
        .join(GBPLocation)
        .join(Site)
        .where(GBPPost.id == post_id, Site.owner_id == current_user.id)
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # In production, publish to GBP API
    post.status = GBPPostStatus.PUBLISHED
    post.published_at = datetime.utcnow()

    await db.commit()

    return {"message": "Post published", "post_id": post_id}


# Reviews
@router.get("/reviews", response_model=List[ReviewResponse])
async def list_reviews(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    location_id: Optional[int] = None,
    status: Optional[ReviewStatus] = None,
    rating: Optional[int] = None,
    requires_attention: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List all reviews."""
    query = (
        select(Review)
        .join(GBPLocation)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if location_id:
        query = query.where(Review.location_id == location_id)
    if status:
        query = query.where(Review.status == status)
    if rating:
        query = query.where(Review.rating == rating)
    if requires_attention is not None:
        query = query.where(Review.requires_attention == requires_attention)

    query = query.offset(skip).limit(limit).order_by(Review.review_date.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/reviews/pending", response_model=List[ReviewResponse])
async def list_pending_reviews(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """List reviews awaiting response."""
    result = await db.execute(
        select(Review)
        .join(GBPLocation)
        .join(Site)
        .where(
            Site.owner_id == current_user.id,
            Review.status == ReviewStatus.PENDING,
        )
        .order_by(Review.review_date.desc())
    )
    return result.scalars().all()


@router.post("/reviews/{review_id}/reply", response_model=ReviewResponse)
async def reply_to_review(
    review_id: int,
    reply_data: ReviewReplyRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Reply to a review."""
    result = await db.execute(
        select(Review)
        .join(GBPLocation)
        .join(Site)
        .where(Review.id == review_id, Site.owner_id == current_user.id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    response_text = reply_data.response_text
    ai_generated = False

    # Generate AI response if requested
    if reply_data.ai_generate:
        ai_generated = True
        if review.rating >= 4:
            response_text = f"Thank you so much for your wonderful {review.rating}-star review, {review.reviewer_name or 'valued customer'}! We truly appreciate your kind words and support. Your satisfaction is our top priority, and we look forward to serving you again soon!"
        else:
            response_text = f"Thank you for taking the time to share your feedback, {review.reviewer_name or 'valued customer'}. We sincerely apologize that your experience didn't meet expectations. We'd love the opportunity to make things right. Please reach out to us directly so we can address your concerns."

    review.response_text = response_text
    review.response_ai_generated = ai_generated
    review.status = ReviewStatus.RESPONDED
    review.responded_at = datetime.utcnow()

    await db.commit()
    await db.refresh(review)

    return review


@router.get("/reviews/summary/{location_id}")
async def get_review_summary(
    location_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get review summary for a location."""
    # Verify location ownership
    result = await db.execute(
        select(GBPLocation)
        .join(Site)
        .where(GBPLocation.id == location_id, Site.owner_id == current_user.id)
    )
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    # Get review stats
    rating_result = await db.execute(
        select(Review.rating, func.count())
        .where(Review.location_id == location_id)
        .group_by(Review.rating)
    )
    by_rating = {row[0]: row[1] for row in rating_result.all()}

    pending_result = await db.execute(
        select(func.count())
        .where(Review.location_id == location_id, Review.status == ReviewStatus.PENDING)
    )
    pending_count = pending_result.scalar()

    return {
        "location_id": location_id,
        "total_reviews": location.total_reviews,
        "average_rating": location.average_rating,
        "by_rating": by_rating,
        "pending_responses": pending_count,
    }


@router.put("/locations/{location_id}/auto-post-settings")
async def update_auto_post_settings(
    location_id: int,
    settings: AutoPostSettingsUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Update auto-posting settings for a location."""
    result = await db.execute(
        select(GBPLocation)
        .join(Site)
        .where(GBPLocation.id == location_id, Site.owner_id == current_user.id)
    )
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    location.auto_post_enabled = settings.auto_post_enabled
    location.post_frequency = settings.post_frequency

    await db.commit()

    return {"message": "Settings updated", "location_id": location_id}
