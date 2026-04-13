"""
YouTube Shorts collector — uses yt-dlp to fetch trending Shorts metadata.

TODO: For enhanced results, set YOUTUBE_API_KEY in .env and the collector
      will also query the YouTube Data API v3 for richer metadata.
"""

from __future__ import annotations

import os
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def collect_youtube_shorts(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    max_results: int = 20,
) -> list[dict]:
    """
    Fetch trending YouTube Shorts metadata.

    Parameters
    ----------
    keyword : str, optional
        Search keyword to filter results (e.g. "football", "futebol").
    category : str, optional
        Category label stored on the trend record.
    max_results : int
        Maximum number of results to return.

    Returns
    -------
    list[dict]
        Each item has keys: title, view_count, tags, channel, url, platform.
    """
    try:
        import yt_dlp  # noqa: F401
    except ImportError:
        logger.error("yt-dlp is not installed. Run: pip install yt-dlp")
        return []

    search_query = keyword if keyword else "youtube shorts trending"
    url = f"ytsearch{max_results}:{search_query} shorts"

    ydl_opts = {
        "quiet": True,
        "extract_flat": True,
        "skip_download": True,
        "no_warnings": True,
    }

    results: list[dict] = []
    try:
        import yt_dlp

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            entries = info.get("entries", []) if info else []

            for entry in entries:
                if not entry:
                    continue
                results.append(
                    {
                        "title": entry.get("title", ""),
                        "view_count": entry.get("view_count"),
                        "tags": entry.get("tags") or [],
                        "channel": entry.get("channel") or entry.get("uploader", ""),
                        "url": entry.get("webpage_url") or entry.get("url", ""),
                        "platform": "youtube",
                        "category": category,
                        "raw_data": {
                            "video_id": entry.get("id"),
                            "duration": entry.get("duration"),
                            "like_count": entry.get("like_count"),
                            "comment_count": entry.get("comment_count"),
                            "thumbnail": entry.get("thumbnail"),
                        },
                    }
                )
    except Exception as exc:
        logger.exception("Error collecting YouTube Shorts: %s", exc)

    logger.info("YouTube collector returned %d results", len(results))
    return results
