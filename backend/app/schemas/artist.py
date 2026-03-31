from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any


class ArtistBase(BaseModel):
    entity_name: str = Field(..., min_length=1, max_length=255)
    entity_type: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    spotify_url: Optional[str] = None
    instagram_handle: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    facebook_id: Optional[str] = None
    youtube_url: Optional[str] = None
    bandcamp_url: Optional[str] = None
    soundcloud_url: Optional[str] = None
    website_url: Optional[str] = None
    email: Optional[str] = None
    genres: Optional[str] = None  # comma-separated


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(BaseModel):
    entity_name: Optional[str] = None
    entity_type: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    spotify_url: Optional[str] = None
    instagram_handle: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    facebook_id: Optional[str] = None
    youtube_url: Optional[str] = None
    bandcamp_url: Optional[str] = None
    soundcloud_url: Optional[str] = None
    website_url: Optional[str] = None
    email: Optional[str] = None
    genres: Optional[str] = None


class ArtistResponse(ArtistBase):
    id: int
    is_active: bool
    image_path: Optional[str] = None
    follower_count: Optional[int] = None
    social_links: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
