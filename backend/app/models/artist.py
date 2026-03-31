from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.db import Base


class Entity(Base):
    """Modello per artisti, band e collettivi"""
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    entity_name = Column(String(255), nullable=False, index=True)
    entity_type = Column(String(50), nullable=True)  # band, collective, artist, etc.
    description = Column(Text, nullable=True)
    image_url = Column(String(512), nullable=True)
    image_path = Column(String(512), nullable=True)

    # Social Links
    spotify_url = Column(String(512), nullable=True)
    instagram_handle = Column(String(100), nullable=True)
    instagram_url = Column(String(512), nullable=True)
    facebook_url = Column(String(512), nullable=True)
    facebook_id = Column(String(100), nullable=True)
    youtube_url = Column(String(512), nullable=True)
    bandcamp_url = Column(String(512), nullable=True)
    soundcloud_url = Column(String(512), nullable=True)
    website_url = Column(String(512), nullable=True)
    email = Column(String(255), nullable=True)

    # Metadata
    follower_count = Column(Integer, nullable=True)
    genres = Column(String(500), nullable=True)  # comma-separated
    social_links = Column(JSON, nullable=True)  # json object with all links

    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
