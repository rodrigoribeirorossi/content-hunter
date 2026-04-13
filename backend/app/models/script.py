from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Script(Base):
    __tablename__ = "scripts"

    id = Column(Integer, primary_key=True, index=True)
    trend_id = Column(Integer, ForeignKey("trends.id"), nullable=True)
    title = Column(String(500), nullable=False)
    hook = Column(Text, nullable=True)                  # First ~3 seconds
    script_body = Column(Text, nullable=True)           # Full 60-90 s script
    thumbnail_suggestion = Column(Text, nullable=True)
    estimated_duration = Column(String(50), nullable=True)  # e.g. "60-90s"
    hashtags = Column(Text, nullable=True)              # JSON-encoded list
    platform = Column(String(50), nullable=True)
    niche = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_saved = Column(Boolean, default=False)

    trend = relationship("Trend", backref="scripts")
