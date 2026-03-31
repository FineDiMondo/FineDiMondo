from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.sql import func
from app.db import Base


class VenueEvent(Base):
    """Modello per gli eventi"""
    __tablename__ = "venue_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(255), nullable=False, index=True)
    event_description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=False, index=True)
    event_location = Column(String(255), nullable=True)
    venue_name = Column(String(255), nullable=True)
    event_url = Column(String(512), nullable=True)
    ticket_url = Column(String(512), nullable=True)
    poster_url = Column(String(512), nullable=True)
    poster_path = Column(String(512), nullable=True)
    facebook_event_id = Column(String(100), nullable=True, unique=True)
    instagram_post_id = Column(String(100), nullable=True)
    event_category = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
