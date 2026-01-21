"""
PieBot SEO - Optimizations Endpoints
SEO optimization recommendations and deployments
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
from app.models.optimization import Optimization, OptimizationDeployment, OptimizationType, OptimizationStatus, DeploymentStatus

router = APIRouter()


class OptimizationResponse(BaseModel):
    id: int
    site_id: int
    optimization_type: OptimizationType
    title: str
    description: Optional[str]
    status: OptimizationStatus

    target_url: Optional[str]
    original_value: Optional[str]
    new_value: Optional[str]
    code_snippet: Optional[str]

    estimated_impact: str
    priority_score: int
    requires_approval: bool

    is_deployed: bool
    can_rollback: bool
    auto_deploy: bool

    created_at: datetime
    deployed_at: Optional[datetime]

    class Config:
        from_attributes = True


class OptimizationCreate(BaseModel):
    site_id: int
    optimization_type: OptimizationType
    title: str
    description: Optional[str] = None
    target_url: Optional[str] = None
    original_value: Optional[str] = None
    new_value: Optional[str] = None
    code_snippet: Optional[str] = None
    estimated_impact: str = "medium"
    auto_deploy: bool = False


class BulkDeployRequest(BaseModel):
    optimization_ids: List[int]
    deployment_method: str = "pixel"  # pixel, api, manual


@router.get("/", response_model=List[OptimizationResponse])
async def list_optimizations(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
    optimization_type: Optional[OptimizationType] = None,
    status: Optional[OptimizationStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List all optimizations."""
    query = (
        select(Optimization)
        .join(Site)
        .where(Site.owner_id == current_user.id)
    )

    if site_id:
        query = query.where(Optimization.site_id == site_id)
    if optimization_type:
        query = query.where(Optimization.optimization_type == optimization_type)
    if status:
        query = query.where(Optimization.status == status)

    query = query.offset(skip).limit(limit).order_by(
        Optimization.priority_score.desc(),
        Optimization.created_at.desc(),
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/pending", response_model=List[OptimizationResponse])
async def list_pending_optimizations(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    site_id: Optional[int] = None,
):
    """List pending optimizations awaiting approval."""
    query = (
        select(Optimization)
        .join(Site)
        .where(
            Site.owner_id == current_user.id,
            Optimization.status == OptimizationStatus.PENDING,
        )
    )

    if site_id:
        query = query.where(Optimization.site_id == site_id)

    query = query.order_by(Optimization.priority_score.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{optimization_id}", response_model=OptimizationResponse)
async def get_optimization(
    optimization_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get optimization details."""
    result = await db.execute(
        select(Optimization)
        .join(Site)
        .where(Optimization.id == optimization_id, Site.owner_id == current_user.id)
    )
    optimization = result.scalar_one_or_none()

    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")

    return optimization


@router.post("/{optimization_id}/approve", response_model=OptimizationResponse)
async def approve_optimization(
    optimization_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Approve an optimization."""
    result = await db.execute(
        select(Optimization)
        .join(Site)
        .where(Optimization.id == optimization_id, Site.owner_id == current_user.id)
    )
    optimization = result.scalar_one_or_none()

    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")

    if optimization.status != OptimizationStatus.PENDING:
        raise HTTPException(status_code=400, detail="Optimization is not pending")

    optimization.status = OptimizationStatus.APPROVED
    optimization.approved_by = current_user.id
    optimization.approved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(optimization)

    return optimization


@router.post("/{optimization_id}/reject", response_model=OptimizationResponse)
async def reject_optimization(
    optimization_id: int,
    reason: Optional[str] = None,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Reject an optimization."""
    result = await db.execute(
        select(Optimization)
        .join(Site)
        .where(Optimization.id == optimization_id, Site.owner_id == current_user.id)
    )
    optimization = result.scalar_one_or_none()

    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")

    optimization.status = OptimizationStatus.REJECTED
    optimization.rejection_reason = reason

    await db.commit()
    await db.refresh(optimization)

    return optimization


@router.post("/{optimization_id}/deploy", response_model=OptimizationResponse)
async def deploy_optimization(
    optimization_id: int,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
    deployment_method: str = "pixel",
):
    """Deploy an optimization."""
    result = await db.execute(
        select(Optimization)
        .join(Site)
        .where(Optimization.id == optimization_id, Site.owner_id == current_user.id)
    )
    optimization = result.scalar_one_or_none()

    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")

    if optimization.status not in [OptimizationStatus.APPROVED, OptimizationStatus.PENDING]:
        raise HTTPException(status_code=400, detail="Optimization cannot be deployed")

    # Create deployment record
    deployment = OptimizationDeployment(
        optimization_id=optimization_id,
        method=deployment_method,
        status=DeploymentStatus.PENDING,
    )
    db.add(deployment)

    # In production, trigger actual deployment
    # background_tasks.add_task(deploy_optimization_task, optimization_id, deployment_method)

    # For now, mark as deployed
    optimization.status = OptimizationStatus.DEPLOYED
    optimization.is_deployed = True
    optimization.deployed_at = datetime.utcnow()
    optimization.deployment_method = deployment_method

    deployment.status = DeploymentStatus.SUCCESS
    deployment.success = True
    deployment.started_at = datetime.utcnow()
    deployment.completed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(optimization)

    return optimization


@router.post("/{optimization_id}/rollback", response_model=OptimizationResponse)
async def rollback_optimization(
    optimization_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Rollback a deployed optimization."""
    result = await db.execute(
        select(Optimization)
        .join(Site)
        .where(Optimization.id == optimization_id, Site.owner_id == current_user.id)
    )
    optimization = result.scalar_one_or_none()

    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")

    if not optimization.is_deployed:
        raise HTTPException(status_code=400, detail="Optimization is not deployed")

    if not optimization.can_rollback:
        raise HTTPException(status_code=400, detail="Optimization cannot be rolled back")

    # In production, trigger actual rollback
    optimization.status = OptimizationStatus.ROLLED_BACK
    optimization.is_rolled_back = True
    optimization.rolled_back_at = datetime.utcnow()

    await db.commit()
    await db.refresh(optimization)

    return optimization


@router.post("/bulk-deploy")
async def bulk_deploy_optimizations(
    request: BulkDeployRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Deploy multiple optimizations at once."""
    result = await db.execute(
        select(Optimization)
        .join(Site)
        .where(
            Optimization.id.in_(request.optimization_ids),
            Site.owner_id == current_user.id,
            Optimization.status.in_([OptimizationStatus.APPROVED, OptimizationStatus.PENDING]),
        )
    )
    optimizations = result.scalars().all()

    if not optimizations:
        raise HTTPException(status_code=404, detail="No deployable optimizations found")

    deployed_count = 0
    for opt in optimizations:
        opt.status = OptimizationStatus.DEPLOYED
        opt.is_deployed = True
        opt.deployed_at = datetime.utcnow()
        opt.deployment_method = request.deployment_method
        deployed_count += 1

    await db.commit()

    return {
        "message": f"Deployed {deployed_count} optimizations",
        "deployed_count": deployed_count,
        "deployment_method": request.deployment_method,
    }


@router.get("/summary/{site_id}")
async def get_optimization_summary(
    site_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db),
):
    """Get optimization summary for a site."""
    # Verify site ownership
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    # Get counts by status
    status_result = await db.execute(
        select(Optimization.status, func.count())
        .where(Optimization.site_id == site_id)
        .group_by(Optimization.status)
    )
    by_status = {row[0].value: row[1] for row in status_result.all()}

    # Get counts by type
    type_result = await db.execute(
        select(Optimization.optimization_type, func.count())
        .where(Optimization.site_id == site_id)
        .group_by(Optimization.optimization_type)
    )
    by_type = {row[0].value: row[1] for row in type_result.all()}

    # Get high-impact pending
    high_impact_result = await db.execute(
        select(func.count())
        .where(
            Optimization.site_id == site_id,
            Optimization.status == OptimizationStatus.PENDING,
            Optimization.estimated_impact == "high",
        )
    )
    high_impact_pending = high_impact_result.scalar()

    return {
        "total": sum(by_status.values()),
        "by_status": by_status,
        "by_type": by_type,
        "high_impact_pending": high_impact_pending,
    }
