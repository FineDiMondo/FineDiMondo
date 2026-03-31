from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc
from datetime import datetime, timedelta
from app.db import get_db
from app.models.event import VenueEvent
from app.models.artist import Entity

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
async def get_analytics_overview(db: Session = Depends(get_db)):
    """KPI generali del sistema"""

    total_events = db.query(func.count(VenueEvent.id)).scalar()
    total_artists = db.query(func.count(Entity.id)).scalar()
    active_events = db.query(func.count(VenueEvent.id)).filter(
        VenueEvent.is_active == True
    ).scalar()

    # Eventi negli ultimi 30 giorni
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_events = db.query(func.count(VenueEvent.id)).filter(
        VenueEvent.created_at >= thirty_days_ago
    ).scalar()

    return {
        "total_events": total_events or 0,
        "total_artists": total_artists or 0,
        "active_events": active_events or 0,
        "recent_events_30days": recent_events or 0,
        "engagement_rate": 75.5,  # Mock data
        "last_updated": datetime.now()
    }


@router.get("/events")
async def get_event_trends(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db)
):
    """Trend mensili degli eventi"""

    trends = []
    for i in range(months):
        month_start = datetime.now() - timedelta(days=30 * (i + 1))
        month_end = datetime.now() - timedelta(days=30 * i)

        count = db.query(func.count(VenueEvent.id)).filter(
            VenueEvent.created_at >= month_start,
            VenueEvent.created_at <= month_end
        ).scalar()

        trends.append({
            "month": month_start.strftime("%B %Y"),
            "events_count": count or 0,
            "date": month_start.isoformat()
        })

    return {
        "period_months": months,
        "trends": sorted(trends, key=lambda x: x["date"])
    }


@router.get("/artists")
async def get_artist_trends(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Top artisti per numero di eventi"""

    from app.models.mapping import EventEntityMapping

    top_artists = db.query(
        Entity.id,
        Entity.entity_name,
        Entity.entity_type,
        func.count(EventEntityMapping.event_id).label("event_count")
    ).join(
        EventEntityMapping,
        Entity.id == EventEntityMapping.entity_id
    ).group_by(
        Entity.id,
        Entity.entity_name,
        Entity.entity_type
    ).order_by(
        desc("event_count")
    ).limit(limit).all()

    return {
        "top_artists": [
            {
                "id": artist[0],
                "name": artist[1],
                "type": artist[2],
                "event_count": artist[3]
            }
            for artist in top_artists
        ],
        "limit": limit
    }


@router.get("/social")
async def get_social_engagement(db: Session = Depends(get_db)):
    """Engagement sui social media"""

    # Mock data - in produzione userebbe le metriche da Facebook/Instagram API
    return {
        "platforms": {
            "facebook": {
                "followers": 1250,
                "posts": 45,
                "engagement_rate": 8.3,
                "avg_likes": 102,
                "avg_comments": 12
            },
            "instagram": {
                "followers": 3450,
                "posts": 89,
                "engagement_rate": 12.5,
                "avg_likes": 450,
                "avg_comments": 28
            },
            "whatsapp": {
                "subscribers": 567,
                "broadcasts_sent": 23,
                "open_rate": 94.2,
                "click_rate": 45.3
            }
        },
        "total_reach": 5267,
        "total_engagement": 2847,
        "last_updated": datetime.now()
    }


@router.get("/dashboard")
async def get_dashboard_data(db: Session = Depends(get_db)):
    """Dati completi per il dashboard analytics"""

    overview = await get_analytics_overview(db)
    events_trend = await get_event_trends(months=6, db=db)
    top_artists = await get_artist_trends(limit=5, db=db)
    social = await get_social_engagement(db)

    return {
        "overview": overview,
        "events_trend": events_trend,
        "top_artists": top_artists,
        "social": social,
        "generated_at": datetime.now()
    }


@router.get("/export")
async def export_analytics(format: str = Query("json", regex="^(json|csv)$")):
    """Esporta dati analytics in JSON o CSV"""
    # Placeholder per export
    return {
        "status": "export_ready",
        "format": format,
        "download_url": f"/api/analytics/download/{format}"
    }
