"""
PieBot SEO - Main Application Entry Point
AI-Powered SEO Automation Platform by BakeMorePies.com
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_client import make_asgi_app

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging

# Setup structured logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Environment: {settings.ENVIRONMENT}")

    # Initialize database tables (in production, use Alembic migrations)
    if settings.DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    yield

    # Shutdown
    print("Shutting down PieBot SEO...")
    await engine.dispose()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## PieBot SEO - Advanced AI-Powered SEO Automation Platform

    PieBot SEO automates all aspects of SEO including:

    - **Technical SEO**: Site audits, schema markup, Core Web Vitals, indexing
    - **On-Page SEO**: Meta optimization, internal linking, content structure
    - **Local SEO**: GBP automation, reviews, citations via Yext
    - **Content SEO**: AI-powered content generation with Claude
    - **Link Building**: Outreach automation, PR distribution
    - **GEO/LLM SEO**: AI visibility tracking, citation monitoring, E-E-A-T optimization

    ### Integrations
    - SEMrush for keyword and competitor analysis
    - Yext for citation management
    - Google Business Profile for local SEO
    - WordPress/Kinsta with AIOSEO/Yoast support
    - Claude AI for content generation

    Built by [BakeMorePies.com](https://bakemorepies.com)
    """,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Prometheus metrics endpoint
if settings.PROMETHEUS_ENABLED:
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-Powered SEO Automation Platform by BakeMorePies.com",
        "docs": "/api/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else settings.WORKERS,
    )
