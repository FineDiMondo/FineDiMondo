# Fine Di Mondo - Event Management System

Archivio e gestione centralizzata di eventi, artisti e integrazione con social media per l'associazione **Fine di Mondo APS**.

## Architettura

- **Backend**: Python FastAPI su Cloud Run
- **Frontend**: Angular su Cloud Run
- **Database**: PostgreSQL su Google Cloud SQL
- **AI**: Vertex AI (Gemini 2.5 Flash) per estrazione automatica artisti
- **Storage**: Google Cloud Storage per locandine

## Setup Locale

### Prerequisiti

- Python 3.11+
- Node.js 20+
- Google Cloud SDK
- Docker
- PostgreSQL (per testing locale)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configura le variabili di ambiente
cp .env.example .env
# Modifica .env con le tue credenziali

# Esegui il server
python main.py
```

Il backend sarà disponibile a `http://localhost:8080`
API docs: `http://localhost:8080/api/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Il frontend sarà disponibile a `http://localhost:4200`

## API Endpoints

### Events
- `GET /api/events` - Lista eventi con filtri
- `GET /api/events/{id}` - Dettagli evento
- `POST /api/events` - Crea evento (admin)
- `PUT /api/events/{id}` - Aggiorna evento (admin)
- `DELETE /api/events/{id}` - Elimina evento (admin)
- `GET /api/events/{id}/artists` - Artisti evento

### Artists
- `GET /api/artists` - Lista artisti con ricerca
- `GET /api/artists/{id}` - Dettagli artista
- `GET /api/artists/{id}/events` - Eventi artista
- `POST /api/artists` - Crea artista (admin)
- `PUT /api/artists/{id}` - Aggiorna artista (admin)
- `DELETE /api/artists/{id}` - Elimina artista (admin)

### Admin
- `POST /api/admin/analyze-event` - Analizza evento con Gemini per estrarre artisti

### Health
- `GET /api/health` - Health check
- `GET /api` - Root endpoint

## Deployment su Google Cloud

### Backend Deployment

```bash
cd backend
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=europe-west1,_SERVICE=finedimondo-backend
```

### Frontend Deployment

```bash
cd frontend
npm run build
gcloud run deploy finedimondo-frontend \
  --source . \
  --platform managed \
  --region europe-west1
```

## Database Schema

### Tabelle Principali

- `venue_events` - Eventi con informazioni dettagliate
- `entities` - Artisti, band, collettivi con link social
- `event_entity_mapping` - Relazione tra eventi e artisti
- `users` - Utenti del sistema
- `organizations` - Organizzazioni partner

## Variabili di Ambiente

Vedi `.env.example` per la lista completa.

### Critiche
- `CLOUDSQL_CONNECTION_NAME` - Connessione Cloud SQL
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Credenziali database
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `VERTEX_AI_PROJECT`, `VERTEX_AI_LOCATION` - Vertex AI config
- `JWT_SECRET_KEY` - Chiave segreta JWT (cambia in produzione!)

## Struttura del Progetto

```
FineDiMondo/
├── backend/                      # Python FastAPI
│   ├── main.py                  # Entry point
│   ├── app/
│   │   ├── models/              # SQLAlchemy models
│   │   ├── routes/              # API endpoints
│   │   ├── schemas/             # Pydantic models
│   │   ├── services/            # Business logic (Vertex AI, etc)
│   │   ├── middleware.py        # CORS, auth
│   │   └── config.py            # Configuration
│   ├── requirements.txt
│   ├── Dockerfile
│   └── cloudbuild.yaml          # GCP CI/CD
├── frontend/                     # Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/         # Feature modules
│   │   │   ├── services/        # API client, Auth, etc
│   │   │   ├── interceptors/    # HTTP interceptors
│   │   │   └── app.component.ts
│   │   ├── environments/        # Config per env
│   │   └── styles.scss
│   ├── package.json
│   ├── angular.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── cloudbuild.yaml          # GCP CI/CD
├── CREDENZIALI_ACCESSO.md       # Secrets (non commitare!)
└── README.md
```

## Prossimi Passi

1. **Fase 4**: Social Integration (Facebook/Instagram import)
2. **Fase 5**: Analytics API
3. **Fase 7**: Dashboard Admin completo
4. **Fase 8**: Archivio pubblico artisti
5. **Fase 10**: Dashboard analytics con chart
6. **Fase 11**: Setup completo CI/CD con Cloud Build

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Contribuire

Questo è un progetto privato. Per modifiche, fare pull request sulla branch di feature.

## Licenza

Proprietario: Fine di Mondo APS
