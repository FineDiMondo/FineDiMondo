from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Crea il motore SQLAlchemy per Cloud SQL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verifica connessioni prima di usarle
    pool_recycle=3600,   # Ricicla connessioni ogni ora
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base per i modelli
Base = declarative_base()


def get_db():
    """Dipendenza FastAPI per ottenere una sessione database"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
