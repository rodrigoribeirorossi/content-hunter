"""
Celery scheduler — periodic tasks that auto-collect trends every 6 hours.

Setup:
    celery -A app.scheduler worker --loglevel=info
    celery -A app.scheduler beat  --loglevel=info
"""

import os
import logging

from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

celery_app = Celery("content_hunter", broker=CELERY_BROKER_URL)

# ---- Beat schedule -------------------------------------------------------
celery_app.conf.beat_schedule = {
    "collect-trends-every-6h": {
        "task": "app.scheduler.collect_all_trends",
        "schedule": crontab(minute=0, hour="*/6"),
    },
}
celery_app.conf.timezone = "UTC"


# ---- Tasks ---------------------------------------------------------------

@celery_app.task(name="app.scheduler.collect_all_trends")
def collect_all_trends():
    """Collect trends from all sources and persist them to the database."""
    from app.database import SessionLocal
    from app.api.routes.trends import _save_trend
    from app.collectors.youtube_collector import collect_youtube_shorts
    from app.collectors.google_trends_collector import collect_google_trends
    from app.collectors.tiktok_collector import collect_tiktok_trends

    db = SessionLocal()
    saved = 0
    try:
        for item in collect_youtube_shorts():
            _save_trend(db, item, "youtube")
            saved += 1

        for item in collect_google_trends(geo="BR"):
            _save_trend(db, item, "google")
            saved += 1

        for item in collect_tiktok_trends():
            _save_trend(db, item, "tiktok")
            saved += 1

        db.commit()
        logger.info("Scheduled collection finished — saved %d trends", saved)
    except Exception as exc:
        logger.exception("Scheduled collection failed: %s", exc)
        db.rollback()
    finally:
        db.close()

    return saved
