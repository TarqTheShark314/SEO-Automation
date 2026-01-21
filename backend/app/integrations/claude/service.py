"""
PieBot SEO - Claude AI Integration Service
AI-powered content generation, optimization, and analysis
"""

from typing import Optional, List, Dict, Any
import json

from anthropic import AsyncAnthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ClaudeService:
    """Service for interacting with Claude AI for SEO content generation."""

    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL
        self.max_tokens = settings.CONTENT_MAX_TOKENS
        self.temperature = settings.CONTENT_TEMPERATURE

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_content(
        self,
        topic: str,
        content_type: str,
        focus_keyword: Optional[str] = None,
        secondary_keywords: Optional[List[str]] = None,
        target_word_count: int = 1500,
        tone: str = "professional",
        brand_voice: Optional[str] = None,
        geo_optimize: bool = True,
        include_tldr: bool = True,
        include_faq: bool = True,
    ) -> Dict[str, Any]:
        """
        Generate SEO-optimized content using Claude AI.

        Args:
            topic: The main topic to write about
            content_type: Type of content (blog_post, landing_page, etc.)
            focus_keyword: Primary keyword to target
            secondary_keywords: Additional keywords to include
            target_word_count: Approximate word count target
            tone: Writing tone (professional, casual, technical, etc.)
            brand_voice: Brand voice guidelines
            geo_optimize: Whether to optimize for AI search engines
            include_tldr: Include TL;DR summary
            include_faq: Include FAQ section

        Returns:
            Dictionary with generated content and metadata
        """
        geo_instructions = ""
        if geo_optimize:
            geo_instructions = """
## GEO (Generative Engine Optimization) Requirements:
- Start with a TL;DR block summarizing the key points in 2-3 sentences
- Include specific statistics and data points with citations where possible
- Add expert quotes with proper attribution
- Structure content in clear, digestible sections (ideal for LLM parsing)
- Include authoritative outbound links to reputable sources
- Add a FAQ section with common questions and concise answers
- Use bullet points and numbered lists for easy scanning
- Ensure each section can stand alone as a complete thought
- Include the author's expertise/credentials if applicable
"""

        system_prompt = f"""You are an expert SEO content writer specializing in creating high-quality,
optimized content that ranks well in both traditional search engines and AI-powered search tools
(ChatGPT, Claude, Gemini, Perplexity).

Your content must be:
1. Well-researched and factually accurate
2. Optimized for the target keyword while maintaining natural readability
3. Structured with proper heading hierarchy (H1, H2, H3)
4. Engaging and valuable to readers
5. Original and not duplicate existing content

{geo_instructions}

Writing Style:
- Tone: {tone}
- Target word count: {target_word_count} words
{f'- Brand voice: {brand_voice}' if brand_voice else ''}
"""

        keywords_text = ""
        if focus_keyword:
            keywords_text += f"Primary keyword: {focus_keyword}\n"
        if secondary_keywords:
            keywords_text += f"Secondary keywords: {', '.join(secondary_keywords)}\n"

        user_prompt = f"""Create a {content_type.replace('_', ' ')} about: {topic}

{keywords_text}

Requirements:
- Create a compelling, SEO-optimized title
- Write a meta description (max 155 characters)
- {f'Include a TL;DR summary at the beginning' if include_tldr else ''}
- Structure with proper H2 and H3 headings
- Include internal linking opportunities (mark with [INTERNAL LINK: topic])
- Include external linking opportunities to authoritative sources
- {f'Add a FAQ section with 3-5 common questions' if include_faq else ''}
- End with a clear call-to-action

Output the content in the following JSON format:
{{
    "title": "SEO-optimized title here",
    "meta_title": "Meta title (max 60 chars)",
    "meta_description": "Meta description (max 155 chars)",
    "content_markdown": "Full article in markdown format",
    "content_html": "Full article in HTML format",
    "tldr": "TL;DR summary if requested",
    "faq": [
        {{"question": "Q1", "answer": "A1"}},
        ...
    ],
    "internal_link_suggestions": ["topic1", "topic2"],
    "external_sources": ["url1", "url2"],
    "word_count": 1500,
    "reading_time_minutes": 7
}}
"""

        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )

            # Extract the response content
            content_text = response.content[0].text

            # Parse the JSON response
            # Find JSON in the response
            json_start = content_text.find('{')
            json_end = content_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = content_text[json_start:json_end]
                result = json.loads(json_str)
            else:
                # If no JSON found, structure the response
                result = {
                    "title": topic,
                    "content_markdown": content_text,
                    "content_html": f"<article>{content_text}</article>",
                }

            # Add metadata
            result["tokens_used"] = response.usage.input_tokens + response.usage.output_tokens
            result["model_used"] = self.model
            result["geo_optimized"] = geo_optimize

            logger.info(f"Generated content for topic: {topic}", tokens=result["tokens_used"])
            return result

        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            raise

    async def generate_meta_tags(
        self,
        page_content: str,
        focus_keyword: Optional[str] = None,
        current_title: Optional[str] = None,
        current_description: Optional[str] = None,
    ) -> Dict[str, str]:
        """
        Generate optimized meta title and description for a page.

        Returns:
            Dictionary with optimized title and description
        """
        prompt = f"""Analyze the following page content and generate optimized meta tags.

Page Content:
{page_content[:3000]}  # Limit content length

{f'Focus Keyword: {focus_keyword}' if focus_keyword else ''}
{f'Current Title: {current_title}' if current_title else ''}
{f'Current Description: {current_description}' if current_description else ''}

Generate:
1. Meta Title (max 60 characters, include focus keyword near the beginning)
2. Meta Description (max 155 characters, include focus keyword, compelling call-to-action)

Output as JSON:
{{"title": "...", "description": "..."}}
"""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=500,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start != -1:
            return json.loads(content[json_start:json_end])
        return {"title": "", "description": ""}

    async def generate_schema_markup(
        self,
        page_content: str,
        page_type: str,
        page_url: str,
        organization_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate JSON-LD schema markup for a page.

        Args:
            page_content: The page content to analyze
            page_type: Type of page (article, product, local_business, etc.)
            page_url: URL of the page
            organization_name: Name of the organization

        Returns:
            JSON-LD schema markup
        """
        prompt = f"""Generate comprehensive JSON-LD schema markup for the following page.

Page Type: {page_type}
Page URL: {page_url}
{f'Organization: {organization_name}' if organization_name else ''}

Page Content:
{page_content[:2000]}

Generate appropriate schema markup including:
- Primary schema type for the page
- Organization/Author schema if applicable
- BreadcrumbList schema
- FAQPage schema if there are Q&A elements

Output ONLY valid JSON-LD (no markdown code blocks):
"""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text
        # Try to parse as JSON
        try:
            # Find JSON array or object
            if content.strip().startswith('['):
                json_start = content.find('[')
                json_end = content.rfind(']') + 1
            else:
                json_start = content.find('{')
                json_end = content.rfind('}') + 1

            if json_start != -1:
                return json.loads(content[json_start:json_end])
        except json.JSONDecodeError:
            pass

        return {}

    async def generate_gbp_post(
        self,
        business_name: str,
        post_type: str,
        topic: Optional[str] = None,
        offer_details: Optional[str] = None,
        event_details: Optional[str] = None,
    ) -> Dict[str, str]:
        """
        Generate a Google Business Profile post.

        Returns:
            Dictionary with post content and call-to-action
        """
        prompt = f"""Create an engaging Google Business Profile post for {business_name}.

Post Type: {post_type}
{f'Topic: {topic}' if topic else ''}
{f'Offer Details: {offer_details}' if offer_details else ''}
{f'Event Details: {event_details}' if event_details else ''}

Requirements:
- Maximum 1500 characters
- Engaging and action-oriented
- Include relevant emojis
- End with a clear call-to-action
- Local SEO optimized

Output as JSON:
{{
    "content": "Post content here",
    "suggested_cta": "LEARN_MORE|BOOK|ORDER|SIGN_UP|CALL",
    "hashtags": ["#tag1", "#tag2"]
}}
"""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=500,
            temperature=0.8,
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start != -1:
            return json.loads(content[json_start:json_end])
        return {"content": content, "suggested_cta": "LEARN_MORE", "hashtags": []}

    async def generate_review_reply(
        self,
        review_text: str,
        rating: int,
        reviewer_name: Optional[str] = None,
        business_name: str = "our business",
    ) -> str:
        """
        Generate a professional reply to a customer review.

        Returns:
            Reply text
        """
        sentiment = "positive" if rating >= 4 else "negative" if rating <= 2 else "neutral"

        prompt = f"""Generate a professional, empathetic reply to this {sentiment} customer review.

Business: {business_name}
Rating: {rating}/5 stars
{f'Reviewer: {reviewer_name}' if reviewer_name else ''}

Review:
"{review_text}"

Requirements:
- Thank the customer
- Address specific points mentioned in the review
- {f'Express gratitude and invite them back' if rating >= 4 else 'Apologize sincerely and offer to make it right'}
- Keep it professional but warm
- Maximum 300 characters
- Do not use generic responses

Reply:"""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=300,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text.strip()

    async def analyze_content_for_geo(
        self,
        content: str,
        focus_keyword: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze content for GEO optimization and provide recommendations.

        Returns:
            Analysis results and recommendations
        """
        prompt = f"""Analyze the following content for Generative Engine Optimization (GEO) -
optimizing for AI search engines like ChatGPT, Claude, Gemini, and Perplexity.

Content:
{content[:4000]}

{f'Focus Keyword: {focus_keyword}' if focus_keyword else ''}

Analyze and score (0-100) the following GEO factors:
1. TL;DR presence and quality
2. Statistics and data points (with citations)
3. Expert quotes and attributions
4. Content structure (LLM-friendly chunking)
5. FAQ presence and quality
6. E-E-A-T signals
7. Citation quality

Output as JSON:
{{
    "overall_geo_score": 75,
    "scores": {{
        "tldr": 80,
        "statistics": 60,
        "quotes": 40,
        "structure": 85,
        "faq": 70,
        "eeat": 65,
        "citations": 55
    }},
    "recommendations": [
        "Add TL;DR summary at the beginning",
        "Include 3-5 specific statistics with sources",
        ...
    ],
    "missing_elements": ["expert_quotes", "statistics"],
    "strengths": ["good_structure", "clear_headings"]
}}
"""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}],
        )

        content_text = response.content[0].text
        json_start = content_text.find('{')
        json_end = content_text.rfind('}') + 1
        if json_start != -1:
            return json.loads(content_text[json_start:json_end])
        return {"overall_geo_score": 0, "recommendations": []}

    async def generate_topical_map(
        self,
        main_topic: str,
        industry: Optional[str] = None,
        target_audience: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive topical map for content strategy.

        Returns:
            Topical map with pillar and cluster topics
        """
        prompt = f"""Create a comprehensive topical map for SEO content strategy.

Main Topic: {main_topic}
{f'Industry: {industry}' if industry else ''}
{f'Target Audience: {target_audience}' if target_audience else ''}

Generate a topical map with:
1. One main pillar topic
2. 5-7 cluster topics
3. 3-5 subtopics for each cluster
4. Estimated search volume ranges
5. Content type recommendations

Output as JSON:
{{
    "pillar": {{
        "topic": "Main pillar topic",
        "keyword": "primary keyword",
        "search_volume_range": "1000-5000",
        "content_type": "ultimate_guide"
    }},
    "clusters": [
        {{
            "topic": "Cluster 1",
            "keyword": "cluster keyword",
            "search_volume_range": "500-1000",
            "content_type": "how_to_guide",
            "subtopics": [
                {{"topic": "Subtopic 1", "keyword": "...", "search_volume_range": "100-500"}},
                ...
            ]
        }},
        ...
    ],
    "internal_linking_strategy": "Description of how to link between pieces",
    "content_calendar_suggestion": "Suggested publishing order and frequency"
}}
"""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start != -1:
            return json.loads(content[json_start:json_end])
        return {}


# Singleton instance
claude_service = ClaudeService()
