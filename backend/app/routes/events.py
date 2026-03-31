from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from datetime import datetime
from app.db import get_db
from app.models.event import VenueEvent
from app.schemas.event import EventCreate, EventUpdate, EventResponse

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
async def list_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: str = Query("", min_length=0),
    category: str = Query(None),
    is_active: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Lista gli eventi con filtri e ricerca"""
    query = db.query(VenueEvent).filter(VenueEvent.is_active == is_active)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                VenueEvent.event_name.ilike(search_pattern),
                VenueEvent.event_description.ilike(search_pattern),
                VenueEvent.venue_name.ilike(search_pattern)
            )
        )

    if category:
        query = query.filter(VenueEvent.event_category == category)

    events = query.order_by(desc(VenueEvent.event_date)).offset(skip).limit(limit).all()
    return events


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Recupera i dettagli di un evento"""
    event = db.query(VenueEvent).filter(VenueEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuovo evento (admin only)"""
    db_event = VenueEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event: EventUpdate,
    db: Session = Depends(get_db)
):
    """Aggiorna un evento (admin only)"""
    db_event = db.query(VenueEvent).filter(VenueEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Elimina un evento (admin only)"""
    db_event = db.query(VenueEvent).filter(VenueEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted successfully"}


@router.get("/{event_id}/artists")
async def get_event_artists(event_id: int, db: Session = Depends(get_db)):
    """Recupera gli artisti associati a un evento"""
    from app.models.artist import Entity
    from app.models.mapping import EventEntityMapping

    event = db.query(VenueEvent).filter(VenueEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    artists = db.query(Entity).join(
        EventEntityMapping,
        Entity.id == EventEntityMapping.entity_id
    ).filter(EventEntityMapping.event_id == event_id).all()

    return artists
