"""
PieBot SEO - API Router
Main API router that includes all endpoint routers
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    sites,
    audits,
    optimizations,
    content,
    local_seo,
    geo_seo,
    analytics,
    integrations,
    wordpress,
)

api_router = APIRouter()

# Authentication endpoints
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

# Site management
api_router.include_router(
    sites.router,
    prefix="/sites",
    tags=["Sites"],
)

# Site audits
api_router.include_router(
    audits.router,
    prefix="/audits",
    tags=["Audits"],
)

# Optimizations
api_router.include_router(
    optimizations.router,
    prefix="/optimizations",
    tags=["Optimizations"],
)

# AI Content Generation
api_router.include_router(
    content.router,
    prefix="/content",
    tags=["Content"],
)

# Local SEO (GBP, Reviews)
api_router.include_router(
    local_seo.router,
    prefix="/local-seo",
    tags=["Local SEO"],
)

# GEO/LLM SEO
api_router.include_router(
    geo_seo.router,
    prefix="/geo-seo",
    tags=["GEO/LLM SEO"],
)

# Analytics & Reporting
api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["Analytics"],
)

# External Integrations (SEMrush, Yext, etc.)
api_router.include_router(
    integrations.router,
    prefix="/integrations",
    tags=["Integrations"],
)

# WordPress Integration
api_router.include_router(
    wordpress.router,
    prefix="/wordpress",
    tags=["WordPress"],
)
