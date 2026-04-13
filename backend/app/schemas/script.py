from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ScriptBase(BaseModel):
    title: str
    hook: Optional[str] = None
    script_body: Optional[str] = None
    thumbnail_suggestion: Optional[str] = None
    estimated_duration: Optional[str] = None
    hashtags: Optional[List[str]] = None
    platform: Optional[str] = None
    niche: Optional[str] = None
    is_saved: bool = False


class ScriptCreate(ScriptBase):
    trend_id: Optional[int] = None


class ScriptRead(ScriptBase):
    id: int
    trend_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ScriptGenerateRequest(BaseModel):
    trend_id: Optional[int] = None
    topic: Optional[str] = None
    niche: str = "general"
    platform: str = "youtube"
