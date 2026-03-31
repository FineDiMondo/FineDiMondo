from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from datetime import datetime
from typing import List

router = APIRouter(prefix="/social", tags=["social"])


class SocialImportRequest(BaseModel):
    platform: str  # "facebook", "instagram"
    page_id: str
    access_token: str


class SocialSyncStatus(BaseModel):
    platform: str
    last_sync: datetime
    status: str  # "syncing", "completed", "failed"
    events_imported: int
    artists_found: int


class CrosspostRequest(BaseModel):
    event_id: int
    platforms: List[str]  # ["facebook", "instagram", "whatsapp"]
    message: str


@router.post("/import")
async def import_from_social(
    request: SocialImportRequest,
    background_tasks: BackgroundTasks
):
    """
    Importa eventi da Facebook o Instagram.

    Per ora è un mock. In produzione userebbe:
    - Facebook Graph API per scaricare event
    - Instagram Business API per content
    """

    if request.platform not in ["facebook", "instagram"]:
        raise HTTPException(status_code=400, detail="Platform not supported")

    # Simulazione import
    background_tasks.add_task(simulate_import, request.platform)

    return {
        "status": "importing",
        "platform": request.platform,
        "message": f"Importazione da {request.platform} avviata in background"
    }


@router.get("/sync-status", response_model=SocialSyncStatus)
async def get_sync_status(platform: str = "facebook"):
    """Ritorna lo stato dell'ultima sincronizzazione"""

    # Mock data
    return SocialSyncStatus(
        platform=platform,
        last_sync=datetime.now(),
        status="completed",
        events_imported=10,
        artists_found=25
    )


@router.post("/crosspost")
async def crosspost_event(
    request: CrosspostRequest,
    background_tasks: BackgroundTasks
):
    """
    Pubblica un evento su multiple piattaforme contemporaneamente.

    Supporta:
    - Facebook (da pagina ufficiale)
    - Instagram (da business account)
    - WhatsApp (broadcast)
    """

    valid_platforms = {"facebook", "instagram", "whatsapp"}
    invalid = set(request.platforms) - valid_platforms

    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Piattaforme non supportate: {invalid}"
        )

    background_tasks.add_task(
        simulate_crosspost,
        request.event_id,
        request.platforms,
        request.message
    )

    return {
        "status": "posting",
        "event_id": request.event_id,
        "platforms": request.platforms,
        "message": "Cross-posting avviato su tutte le piattaforme"
    }


@router.get("/platforms")
async def get_supported_platforms():
    """Ritorna la lista di piattaforme supportate"""
    return {
        "platforms": [
            {
                "id": "facebook",
                "name": "Facebook",
                "description": "Pubblica su pagina Facebook",
                "requires_auth": True
            },
            {
                "id": "instagram",
                "name": "Instagram",
                "description": "Pubblica su Instagram Business",
                "requires_auth": True
            },
            {
                "id": "whatsapp",
                "name": "WhatsApp",
                "description": "Invia broadcast a contatti",
                "requires_auth": True
            }
        ]
    }


# Background tasks
def simulate_import(platform: str):
    """Simula l'importazione di eventi da social"""
    print(f"[Background] Importando eventi da {platform}...")
    # In produzione: chiamare Facebook/Instagram API, salvare nel DB


def simulate_crosspost(event_id: int, platforms: list, message: str):
    """Simula il cross-posting su multiple piattaforme"""
    print(f"[Background] Cross-posting evento {event_id} su {platforms}")
    # In produzione: pubblicare su ogni piattaforma
