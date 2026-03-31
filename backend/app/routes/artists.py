from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.db import get_db
from app.models.artist import Entity
from app.schemas.artist import ArtistCreate, ArtistUpdate, ArtistResponse

router = APIRouter(prefix="/artists", tags=["artists"])


@router.get("", response_model=list[ArtistResponse])
async def list_artists(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: str = Query("", min_length=0),
    entity_type: str = Query(None),
    is_active: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Lista gli artisti con filtri e ricerca"""
    query = db.query(Entity).filter(Entity.is_active == is_active)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Entity.entity_name.ilike(search_pattern),
                Entity.description.ilike(search_pattern),
                Entity.genres.ilike(search_pattern),
                Entity.instagram_handle.ilike(search_pattern)
            )
        )

    if entity_type:
        query = query.filter(Entity.entity_type == entity_type)

    artists = query.order_by(desc(Entity.follower_count), Entity.entity_name).offset(skip).limit(limit).all()
    return artists


@router.get("/{artist_id}", response_model=ArtistResponse)
async def get_artist(artist_id: int, db: Session = Depends(get_db)):
    """Recupera i dettagli di un artista"""
    artist = db.query(Entity).filter(Entity.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist


@router.post("", response_model=ArtistResponse)
async def create_artist(
    artist: ArtistCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuovo artista (admin only)"""
    db_artist = Entity(**artist.dict())
    db.add(db_artist)
    db.commit()
    db.refresh(db_artist)
    return db_artist


@router.put("/{artist_id}", response_model=ArtistResponse)
async def update_artist(
    artist_id: int,
    artist: ArtistUpdate,
    db: Session = Depends(get_db)
):
    """Aggiorna un artista (admin only)"""
    db_artist = db.query(Entity).filter(Entity.id == artist_id).first()
    if not db_artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    update_data = artist.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_artist, key, value)

    db.commit()
    db.refresh(db_artist)
    return db_artist


@router.delete("/{artist_id}")
async def delete_artist(artist_id: int, db: Session = Depends(get_db)):
    """Elimina un artista (admin only)"""
    db_artist = db.query(Entity).filter(Entity.id == artist_id).first()
    if not db_artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    db.delete(db_artist)
    db.commit()
    return {"message": "Artist deleted successfully"}


@router.get("/{artist_id}/events")
async def get_artist_events(artist_id: int, db: Session = Depends(get_db)):
    """Recupera gli eventi di un artista"""
    from app.models.event import VenueEvent
    from app.models.mapping import EventEntityMapping

    artist = db.query(Entity).filter(Entity.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    events = db.query(VenueEvent).join(
        EventEntityMapping,
        VenueEvent.id == EventEntityMapping.event_id
    ).filter(EventEntityMapping.entity_id == artist_id).all()

    return events
