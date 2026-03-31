from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.sql import func
from app.db import Base


class EventEntityMapping(Base):
    """Mapping tra eventi e artisti/band"""
    __tablename__ = "event_entity_mapping"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("venue_events.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=True)  # performer, organizer, sponsor, etc.
    created_at = Column(DateTime, server_default=func.now())
