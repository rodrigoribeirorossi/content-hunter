from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class TrendBase(BaseModel):
    title: str
    platform: str
    score: float = 0.0
    category: Optional[str] = None
    view_count: Optional[int] = None
    tags: Optional[List[str]] = None


class TrendCreate(TrendBase):
    raw_data: Optional[dict] = None


class TrendRead(TrendBase):
    id: int
    collected_at: datetime
    raw_data: Optional[dict] = None

    model_config = {"from_attributes": True}
