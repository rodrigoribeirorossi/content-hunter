import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.script import Script
from app.models.trend import Trend
from app.schemas.script import ScriptRead, ScriptGenerateRequest
from app.ai.script_generator import generate_script

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=list[ScriptRead])
def list_scripts(
    saved_only: bool = Query(False),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """List all generated scripts. Use saved_only=true to show bookmarked scripts only."""
    query = db.query(Script)
    if saved_only:
        query = query.filter(Script.is_saved.is_(True))
    scripts = query.order_by(Script.created_at.desc()).limit(limit).all()
    return [_serialize_script(s) for s in scripts]


@router.post("/generate", response_model=ScriptRead, status_code=201)
def generate_script_endpoint(
    request: ScriptGenerateRequest,
    db: Session = Depends(get_db),
):
    """Generate a new AI script for a given trend_id or custom topic."""
    topic = request.topic

    # Resolve topic from trend if trend_id is provided
    if request.trend_id and not topic:
        trend = db.query(Trend).filter(Trend.id == request.trend_id).first()
        if not trend:
            raise HTTPException(status_code=404, detail=f"Trend {request.trend_id} not found")
        topic = trend.title

    if not topic:
        raise HTTPException(status_code=422, detail="Provide either 'trend_id' or 'topic'")

    # Call Ollama
    ai_result = generate_script(topic=topic, niche=request.niche, platform=request.platform)

    script = Script(
        trend_id=request.trend_id,
        title=ai_result.get("title") or topic,
        hook=ai_result.get("hook"),
        script_body=ai_result.get("script_body"),
        thumbnail_suggestion=ai_result.get("thumbnail_suggestion"),
        estimated_duration=ai_result.get("estimated_duration", "60-90s"),
        platform=request.platform,
        niche=request.niche,
        is_saved=False,
    )
    # Store hashtags as JSON
    hashtags = ai_result.get("hashtags") or []
    script.hashtags = json.dumps(hashtags)

    db.add(script)
    db.commit()
    db.refresh(script)
    return _serialize_script(script)


@router.patch("/{script_id}/save", response_model=ScriptRead)
def toggle_save_script(script_id: int, db: Session = Depends(get_db)):
    """Toggle the is_saved flag on a script."""
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    script.is_saved = not script.is_saved
    db.commit()
    db.refresh(script)
    return _serialize_script(script)


def _serialize_script(s: Script) -> dict:
    hashtags = []
    if s.hashtags:
        try:
            hashtags = json.loads(s.hashtags)
        except (json.JSONDecodeError, TypeError):
            hashtags = []
    return {
        "id": s.id,
        "trend_id": s.trend_id,
        "title": s.title,
        "hook": s.hook,
        "script_body": s.script_body,
        "thumbnail_suggestion": s.thumbnail_suggestion,
        "estimated_duration": s.estimated_duration,
        "hashtags": hashtags,
        "platform": s.platform,
        "niche": s.niche,
        "created_at": s.created_at,
        "is_saved": s.is_saved,
    }
