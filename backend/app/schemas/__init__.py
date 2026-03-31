# Schemas package
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.artist import ArtistCreate, ArtistUpdate, ArtistResponse

__all__ = [
    "EventCreate", "EventUpdate", "EventResponse",
    "ArtistCreate", "ArtistUpdate", "ArtistResponse"
]
