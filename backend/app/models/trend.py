import json
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.database import Base


class Trend(Base):
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    platform = Column(String(50), nullable=False)  # youtube | tiktok | reels | google
    score = Column(Float, default=0.0)             # 0–100
    category = Column(String(100), nullable=True)
    view_count = Column(Integer, nullable=True)
    tags = Column(Text, nullable=True)             # JSON-encoded list
    collected_at = Column(DateTime, default=datetime.utcnow)
    raw_data = Column(Text, nullable=True)          # JSON-encoded raw payload

    # ------------------------------------------------------------------ #
    # Helpers for JSON fields
    # ------------------------------------------------------------------ #
    def get_tags(self) -> list:
        if self.tags:
            try:
                return json.loads(self.tags)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    def set_tags(self, tags: list) -> None:
        self.tags = json.dumps(tags)

    def get_raw_data(self) -> dict:
        if self.raw_data:
            try:
                return json.loads(self.raw_data)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}

    def set_raw_data(self, data: dict) -> None:
        self.raw_data = json.dumps(data)
