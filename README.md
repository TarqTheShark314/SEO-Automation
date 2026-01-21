# PieBot SEO - Advanced AI-Powered SEO Automation Platform

![PieBot SEO](https://bakemorepies.com/assets/piebot-logo.png)

> **By BakeMorePies.com** - The most advanced SEO automation platform that goes beyond traditional SEO to include GEO (Generative Engine Optimization) for AI search visibility.

## Overview

PieBot SEO is an enterprise-grade, AI-powered SEO automation platform that automates 99%+ of SEO tasks across all domains:

- **Technical SEO** - Automated audits, schema markup, indexing, Core Web Vitals
- **On-Page SEO** - Meta optimization, internal linking, content structure
- **Local SEO** - GBP automation, review management, citation building
- **Content SEO** - AI-powered content generation, topical maps, optimization
- **Link Building** - Automated outreach, PR distribution, backlink monitoring
- **GEO/LLM SEO** - AI search visibility, citation tracking, E-E-A-T optimization

## Key Differentiators from Competitors

| Feature | PieBot SEO | OTTO SEO | Others |
|---------|-----------|----------|--------|
| GEO/LLM Visibility Tracking | ✅ Advanced | ✅ Basic | ❌ |
| Multi-AI Content Generation | ✅ Claude, GPT, Gemini | ✅ Single | ❌ |
| WordPress Deep Integration | ✅ Native | ✅ Pixel | ❌ |
| E-E-A-T Auto-Optimization | ✅ Full | ❌ | ❌ |
| Predictive SEO Analytics | ✅ ML-Powered | ❌ | ❌ |
| Multi-Site Management | ✅ Unlimited | ✅ Limited | ✅ |
| White-Label Support | ✅ Full | ✅ | Varies |
| API-First Architecture | ✅ Full REST/GraphQL | ❌ | Varies |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PieBot SEO Platform                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Dashboard  │  │   API       │  │  Scheduler  │  │  Workers    │    │
│  │  (Next.js)  │  │  (FastAPI)  │  │  (Celery)   │  │  (Celery)   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│         └────────────────┴────────────────┴────────────────┘            │
│                                   │                                      │
│  ┌────────────────────────────────┴────────────────────────────────┐    │
│  │                      Core Services Layer                         │    │
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬─────────┤    │
│  │Technical │ On-Page  │  Local   │ Content  │   Link   │   GEO   │    │
│  │   SEO    │   SEO    │   SEO    │   SEO    │ Building │LLM SEO  │    │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴─────────┘    │
│                                   │                                      │
│  ┌────────────────────────────────┴────────────────────────────────┐    │
│  │                     Integration Layer                            │    │
│  ├────────┬────────┬────────┬────────┬────────┬────────┬──────────┤    │
│  │SEMrush │  Yext  │  GBP   │ Claude │GSC/GA4 │WordPress│ Indexing│    │
│  └────────┴────────┴────────┴────────┴────────┴────────┴──────────┘    │
│                                   │                                      │
│  ┌────────────────────────────────┴────────────────────────────────┐    │
│  │              Data Layer (PostgreSQL + Redis + S3)                │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/bakemorepies/piebot-seo.git
cd piebot-seo

# Using Docker (Recommended)
docker-compose up -d

# Or manual setup
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Core
DATABASE_URL=postgresql://user:pass@localhost:5432/piebot_seo
REDIS_URL=redis://localhost:6379/0

# AI Services
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key  # Optional fallback

# Google Services
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GSC_SITE_URL=https://yoursite.com

# SEMrush
SEMRUSH_API_KEY=your_semrush_api_key

# Yext
YEXT_API_KEY=your_yext_api_key
YEXT_ACCOUNT_ID=your_account_id

# WordPress
WP_APPLICATION_PASSWORD=your_app_password
```

## Modules

### 1. Technical SEO (`/backend/app/modules/technical_seo/`)
- Automated site audits with 200+ checkpoints
- Schema markup generation (JSON-LD)
- Dynamic sitemap generation
- Robots.txt optimization
- Core Web Vitals monitoring
- Broken link detection & auto-fixing
- Canonical URL management
- Instant indexing via Google/Bing APIs

### 2. On-Page SEO (`/backend/app/modules/onpage_seo/`)
- AI-powered meta title/description optimization
- Heading structure analysis (H1-H6)
- Internal linking suggestions & automation
- Image alt text generation
- Content readability scoring
- Keyword density optimization
- Featured snippet optimization

### 3. Local SEO (`/backend/app/modules/local_seo/`)
- Google Business Profile automation
- Automated GBP posts with AI content
- Review monitoring & AI-powered responses
- Q&A automation for GBP
- Citation management via Yext
- Local keyword tracking
- NAP consistency checker

### 4. Content SEO (`/backend/app/modules/content_seo/`)
- AI content generation (Claude-powered)
- Topical map generation
- Content gap analysis
- Content optimization scoring
- Knowledge base builder
- Landing page generator
- Content calendar automation

### 5. Link Building (`/backend/app/modules/link_building/`)
- Backlink monitoring & analysis
- Automated outreach campaigns
- Press release distribution
- Digital PR automation
- Competitor backlink analysis
- Toxic link detection
- Disavow file generation

### 6. GEO/LLM SEO (`/backend/app/modules/geo_seo/`)
- **AI Visibility Tracking** - Monitor mentions across ChatGPT, Claude, Gemini, Perplexity
- **Citation Analysis** - Track how AI cites your content
- **E-E-A-T Scoring** - Automated expertise/authority analysis
- **AI-Optimized Content** - Structure content for LLM comprehension
- **Entity Optimization** - Knowledge graph enhancement
- **Social Signal Tracking** - Reddit, Quora, forum monitoring

### 7. WordPress Integration (`/backend/app/modules/wordpress/`)
- Direct WordPress REST API integration
- AIOSEO/Yoast plugin compatibility
- One-click optimization deployment
- Content publishing automation
- Real-time sync with WordPress
- Kinsta-optimized caching integration

## API Documentation

Full API documentation available at `/api/docs` (Swagger) or `/api/redoc` (ReDoc).

### Key Endpoints

```
POST   /api/v1/sites                    # Add new site
GET    /api/v1/sites/{id}/audit         # Run full audit
POST   /api/v1/sites/{id}/optimize      # Deploy optimizations
GET    /api/v1/sites/{id}/geo-visibility # GEO visibility report
POST   /api/v1/content/generate         # AI content generation
GET    /api/v1/analytics/dashboard      # Analytics overview
```

## Configuration

### Site Configuration Example

```json
{
  "site_url": "https://example.com",
  "cms": "wordpress",
  "integrations": {
    "wordpress": {
      "api_url": "https://example.com/wp-json",
      "username": "admin",
      "app_password": "xxxx xxxx xxxx xxxx"
    },
    "seo_plugin": "aioseo",
    "google_search_console": true,
    "google_analytics": true,
    "semrush_project_id": "12345"
  },
  "automation": {
    "technical_seo": {
      "auto_fix_broken_links": true,
      "auto_generate_schema": true,
      "auto_optimize_images": true
    },
    "content": {
      "auto_generate_meta": true,
      "auto_internal_linking": true,
      "ai_provider": "claude"
    },
    "local_seo": {
      "auto_gbp_posts": true,
      "auto_review_replies": true,
      "post_frequency": "weekly"
    }
  }
}
```

## Deployment

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

Helm charts available in `/deploy/kubernetes/`.

```bash
helm install piebot-seo ./deploy/kubernetes/piebot-seo
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Proprietary - BakeMorePies.com. All rights reserved.

## Support

- Documentation: https://docs.bakemorepies.com/piebot-seo
- Email: support@bakemorepies.com
- Discord: https://discord.gg/bakemorepies
