"""
Google Trends collector — uses pytrends to fetch trending searches.

Fetches trending searches for Brazil (geo='BR') and worldwide.
"""

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def collect_google_trends(
    geo: str = "BR",
    max_results: int = 20,
) -> list[dict]:
    """
    Fetch trending search topics from Google Trends.

    Parameters
    ----------
    geo : str
        ISO 3166-1 alpha-2 country code (default 'BR' for Brazil).
        Use '' for worldwide trends.
    max_results : int
        Maximum number of trending terms to return.

    Returns
    -------
    list[dict]
        Each item has keys: title, score, platform, geo.
    """
    try:
        from pytrends.request import TrendReq
    except ImportError:
        logger.error("pytrends is not installed. Run: pip install pytrends")
        return []

    results: list[dict] = []
    try:
        pytrends = TrendReq(hl="pt-BR", tz=180)

        # Daily trending searches
        trending_df = pytrends.trending_searches(pn="brazil" if geo == "BR" else "united_states")

        if trending_df is not None and not trending_df.empty:
            for term in trending_df[0].head(max_results).tolist():
                results.append(
                    {
                        "title": str(term),
                        "score": 70.0,  # Default score; real score via interest_over_time
                        "platform": "google",
                        "geo": geo,
                        "category": None,
                        "view_count": None,
                        "tags": [],
                        "raw_data": {"source": "google_trends_daily", "geo": geo},
                    }
                )
    except Exception as exc:
        logger.exception("Error collecting Google Trends: %s", exc)

    logger.info("Google Trends collector returned %d results", len(results))
    return results


def collect_interest_over_time(keyword: str, timeframe: str = "now 7-d", geo: str = "BR") -> list[dict]:
    """
    Fetch interest-over-time data for a specific keyword.

    Parameters
    ----------
    keyword : str
        The search keyword to analyze.
    timeframe : str
        Time range string supported by pytrends (e.g. 'now 7-d', 'today 1-m').
    geo : str
        ISO 3166-1 alpha-2 country code.

    Returns
    -------
    list[dict]
        Each item has keys: date, value.
    """
    try:
        from pytrends.request import TrendReq
    except ImportError:
        logger.error("pytrends is not installed. Run: pip install pytrends")
        return []

    results: list[dict] = []
    try:
        pytrends = TrendReq(hl="pt-BR", tz=180)
        pytrends.build_payload([keyword], cat=0, timeframe=timeframe, geo=geo)
        df = pytrends.interest_over_time()

        if df is not None and not df.empty and keyword in df.columns:
            for ts, row in df.iterrows():
                results.append({"date": str(ts.date()), "value": int(row[keyword])})
    except Exception as exc:
        logger.exception("Error fetching interest over time for '%s': %s", keyword, exc)

    return results
