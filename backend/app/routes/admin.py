from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db import get_db
from app.models.event import VenueEvent
from app.models.artist import Entity
from app.models.mapping import EventEntityMapping
from app.services.vertex_ai import vertex_ai_service

router = APIRouter(prefix="/admin", tags=["admin"])


class AnalyzeEventRequest(BaseModel):
    event_id: int


@router.post("/analyze-event")
async def analyze_event_with_gemini(
    request: AnalyzeEventRequest,
    db: Session = Depends(get_db)
):
    """Analizza un evento con Gemini per estrarre artisti automaticamente"""

    # Recupera l'evento
    event = db.query(VenueEvent).filter(VenueEvent.id == request.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Chiama Gemini per analizzare
    combined_text = f"{event.event_name}. {event.event_description or ''}"
    analysis = vertex_ai_service.analyze_event_for_artists(
        event_description=event.event_description or "",
        event_name=event.event_name
    )

    # Crea o aggiorna gli artisti nel database
    created_artists = []
    for artist_data in analysis.get("artists", []):
        # Cerca se esiste già
        existing_artist = db.query(Entity).filter(
            Entity.entity_name.ilike(artist_data["name"])
        ).first()

        if existing_artist:
            artist = existing_artist
        else:
            artist = Entity(
                entity_name=artist_data["name"],
                entity_type=artist_data.get("type", "artist"),
                genres=",".join(artist_data.get("genres", []))
            )
            db.add(artist)
            db.flush()  # Flush per ottenere l'id senza commit

        created_artists.append({
            "id": artist.id,
            "name": artist.entity_name,
            "is_new": existing_artist is None
        })

        # Crea il mapping event-artist
        existing_mapping = db.query(EventEntityMapping).filter(
            EventEntityMapping.event_id == request.event_id,
            EventEntityMapping.entity_id == artist.id
        ).first()

        if not existing_mapping:
            mapping = EventEntityMapping(
                event_id=request.event_id,
                entity_id=artist.id,
                role=artist_data.get("type", "performer")
            )
            db.add(mapping)

    db.commit()

    return {
        "event_id": request.event_id,
        "event_name": event.event_name,
        "analysis": analysis,
        "created_artists": created_artists,
        "message": f"Found and linked {len(created_artists)} artists"
    }
