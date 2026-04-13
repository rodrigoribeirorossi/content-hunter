"""
TikTok collector — uses Playwright (async) to scrape trending hashtags
from the TikTok Explore page.

NOTE: TikTok actively blocks automated access. This collector provides a
      best-effort scraping approach. For production use, consider applying
      for the TikTok Research API (https://developers.tiktok.com/products/research-api/).
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

TIKTOK_EXPLORE_URL = "https://www.tiktok.com/explore"


async def collect_tiktok_trends_async(max_results: int = 20) -> list[dict]:
    """
    Async scraper that opens TikTok Explore and extracts trending hashtags.

    Returns
    -------
    list[dict]
        Each item has keys: title, platform, estimated_posts, tags.
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        logger.error("playwright is not installed. Run: pip install playwright && playwright install chromium")
        return []

    results: list[dict] = []
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            )
            page = await context.new_page()

            # TODO: TikTok may require login or show a CAPTCHA.
            #       Consider persisting cookies after a manual login session.
            await page.goto(TIKTOK_EXPLORE_URL, wait_until="networkidle", timeout=30_000)

            # Try to extract hashtag / challenge links from the explore page
            hashtag_elements = await page.query_selector_all("a[href*='/tag/']")

            seen: set[str] = set()
            for el in hashtag_elements:
                if len(results) >= max_results:
                    break
                text = (await el.inner_text()).strip().lstrip("#")
                href = await el.get_attribute("href") or ""
                if not text or text in seen:
                    continue
                seen.add(text)
                results.append(
                    {
                        "title": f"#{text}",
                        "platform": "tiktok",
                        "estimated_posts": None,  # Not reliably available without API
                        "tags": [text],
                        "category": None,
                        "view_count": None,
                        "score": 60.0,
                        "raw_data": {"source": "tiktok_explore", "href": href},
                    }
                )

            await browser.close()
    except Exception as exc:
        logger.exception("Error collecting TikTok trends: %s", exc)

    logger.info("TikTok collector returned %d results", len(results))
    return results


def collect_tiktok_trends(max_results: int = 20) -> list[dict]:
    """Sync wrapper around the async TikTok collector."""
    return asyncio.run(collect_tiktok_trends_async(max_results))
