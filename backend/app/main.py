"""
PieBot SEO - Main Application Entry Point
AI-Powered SEO Automation Platform by BakeMorePies.com
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Application lifespan manager for startup and shutdown events."""
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Database: {'Connected' if settings.DATABASE_URL else 'Not configured'}")
    print(f"Claude AI: {'Configured' if settings.ANTHROPIC_API_KEY else 'Not configured'}")
    print(f"SEMrush: {'Configured' if settings.SEMRUSH_API_KEY else 'Not configured'}")

    # Initialize database tables
    try:
        from app.core.database import engine, Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables initialized successfully")
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("The API will start but database features won't work until connection is fixed")

    yield

    # Shutdown
    print("Shutting down PieBot SEO...")
    try:
        from app.core.database import engine
        await engine.dispose()
    except Exception:
        pass


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered SEO Automation Platform by BakeMorePies.com",
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
try:
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
except Exception as e:
    print(f"Warning: Could not load API router: {e}")


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-Powered SEO Automation Platform by BakeMorePies.com",
        "docs": "/api/docs",
        "health": "/health",
    }
