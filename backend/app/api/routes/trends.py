import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.trend import Trend
from app.schemas.trend import TrendRead, TrendCreate
from app.collectors.youtube_collector import collect_youtube_shorts
from app.collectors.google_trends_collector import collect_google_trends
from app.collectors.tiktok_collector import collect_tiktok_trends

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=list[TrendRead])
def list_trends(
    platform: Optional[str] = Query(None, description="Filter by platform: youtube, tiktok, reels, google"),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """List all collected trends, optionally filtered by platform, ordered by score."""
    query = db.query(Trend)
    if platform:
        query = query.filter(Trend.platform == platform)
    trends = query.order_by(Trend.score.desc()).limit(limit).all()

    # Deserialize JSON fields before returning
    result = []
    for t in trends:
        trend_dict = {
            "id": t.id,
            "title": t.title,
            "platform": t.platform,
            "score": t.score,
            "category": t.category,
            "view_count": t.view_count,
            "tags": t.get_tags(),
            "collected_at": t.collected_at,
            "raw_data": t.get_raw_data(),
        }
        result.append(trend_dict)
    return result


@router.post("/collect", status_code=202)
def trigger_collection(db: Session = Depends(get_db)):
    """Manually trigger all collectors and save results to the database."""
    saved_count = 0

    # YouTube Shorts
    try:
        youtube_data = collect_youtube_shorts()
        for item in youtube_data:
            _save_trend(db, item, "youtube")
            saved_count += 1
    except Exception as exc:
        logger.exception("YouTube collector failed: %s", exc)

    # Google Trends
    try:
        google_data = collect_google_trends(geo="BR")
        for item in google_data:
            _save_trend(db, item, "google")
            saved_count += 1
    except Exception as exc:
        logger.exception("Google Trends collector failed: %s", exc)

    # TikTok
    try:
        tiktok_data = collect_tiktok_trends()
        for item in tiktok_data:
            _save_trend(db, item, "tiktok")
            saved_count += 1
    except Exception as exc:
        logger.exception("TikTok collector failed: %s", exc)

    db.commit()
    return {"status": "collection triggered", "saved": saved_count}


def _save_trend(db: Session, item: dict, platform: str) -> Trend:
    trend = Trend(
        title=item.get("title", ""),
        platform=platform,
        score=item.get("score", 50.0),
        category=item.get("category"),
        view_count=item.get("view_count"),
    )
    trend.set_tags(item.get("tags") or [])
    trend.set_raw_data(item.get("raw_data") or {})
    db.add(trend)
    return trend
