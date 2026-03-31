# Routes package
from app.routes.events import router as events_router
from app.routes.artists import router as artists_router

__all__ = ["events_router", "artists_router"]
