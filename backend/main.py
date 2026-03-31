from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.config import settings
from app.db import engine, Base
from app.middleware import setup_middleware

# Crea le tabelle nel database
Base.metadata.create_all(bind=engine)

# Crea l'app FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="API per la gestione di eventi, artisti e integrazione social",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Setup middleware (CORS, autenticazione)
setup_middleware(app)


@app.get("/api/health")
async def health_check():
    """Health check endpoint per Cloud Run"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": "1.0.0"
        }
    )


@app.get("/api")
async def root():
    """Root endpoint API"""
    return {
        "message": "Welcome to Fine Di Mondo API",
        "docs": "/api/docs",
        "health": "/api/health"
    }


# Import e includi i router
from app.routes import events_router, artists_router
from app.routes.admin import router as admin_router

# Includi i router nell'app
app.include_router(events_router, prefix="/api")
app.include_router(artists_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=settings.DEBUG
    )
