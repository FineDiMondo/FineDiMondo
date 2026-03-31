from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class EventBase(BaseModel):
    event_name: str = Field(..., min_length=1, max_length=255)
    event_description: Optional[str] = None
    event_date: datetime
    event_location: Optional[str] = None
    venue_name: Optional[str] = None
    event_url: Optional[str] = None
    ticket_url: Optional[str] = None
    poster_url: Optional[str] = None
    facebook_event_id: Optional[str] = None
    instagram_post_id: Optional[str] = None
    event_category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    event_description: Optional[str] = None
    event_date: Optional[datetime] = None
    event_location: Optional[str] = None
    venue_name: Optional[str] = None
    event_url: Optional[str] = None
    ticket_url: Optional[str] = None
    poster_url: Optional[str] = None
    facebook_event_id: Optional[str] = None
    instagram_post_id: Optional[str] = None
    event_category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class EventResponse(EventBase):
    id: int
    is_active: bool
    poster_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
