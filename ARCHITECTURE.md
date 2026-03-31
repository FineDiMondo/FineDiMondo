# Architettura di Fine Di Mondo

Documento che descrive l'architettura del sistema Fine Di Mondo con due ambienti di deployment.

---

## Panoramica

Fine Di Mondo è un'applicazione web per la gestione di eventi musicali, artisti e integrazione con social media.

```
┌──────────────────────────────────────────────────────────────┐
│                      Fine Di Mondo Architecture               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────┐         ┌────────────────────┐  │
│  │   Sviluppo/Collaudo    │         │    Produzione      │  │
│  │   (Kubernetes Local)   │         │  (Google Cloud)    │  │
│  └────────────────────────┘         └────────────────────┘  │
│  ┌────────────────────────────┐  ┌──────────────────────┐  │
│  │                            │  │                      │  │
│  │  ┌──────────┐ ┌─────────┐ │  │  ┌────────────────┐  │  │
│  │  │ Frontend │ │ Backend │ │  │  │  Cloud Run     │  │  │
│  │  │ (Nginx)  │ │ (FastAPI)│ │  │  │  (Managed)    │  │  │
│  │  └──────────┘ └─────────┘ │  │  └────────────────┘  │  │
│  │       │            │       │  │                      │  │
│  │  Kubernetes        │       │  │  Auto-scaling       │  │
│  │  Cluster (mywire) │       │  │  Zero-ops           │  │
│  └───────┼────────────┼───────┘  └──────────────────────┘  │
│          │            │                                      │
│          └────┬───────┘                                      │
│               │                                              │
│          ┌────▼───────────┐                                  │
│          │                │                                  │
│          │  Cloud SQL     │                                  │
│          │  PostgreSQL    │                                  │
│          │  (34.76.47.191)│                                  │
│          │                │                                  │
│          └────────────────┘                                  │
│                                                               │
│  ┌──────────────────────────────┐                           │
│  │   Servizi Condivisi          │                           │
│  ├──────────────────────────────┤                           │
│  │ • Cloud Storage (Locandine)  │                           │
│  │ • Vertex AI (Gemini)         │                           │
│  │ • Social APIs                │                           │
│  └──────────────────────────────┘                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. Componenti Principali

### Frontend (Angular 17)
- **Stack**: Angular standalone components, Bootstrap 5, TypeScript
- **Moduli**:
  - **Dashboard**: Gestione eventi (CRUD admin)
  - **Archive**: Archivio pubblico artisti
  - **Social**: Gestione social media (FB/IG/WhatsApp)
  - **Analytics**: Dashboard analytics con KPI

### Backend (Python FastAPI)
- **Stack**: FastAPI, SQLAlchemy ORM, Pydantic
- **Moduli**:
  - **Events**: API CRUD per eventi
  - **Artists**: API CRUD per artisti/band
  - **Admin**: API per analisi Vertex AI
  - **Social**: API importazione/crosspost
  - **Analytics**: API aggregazioni dati

### Database (PostgreSQL)
- **Host**: Cloud SQL (34.76.47.191)
- **Database**: kyuss_retro
- **Tabelle principali**:
  - `venue_events` (216 eventi)
  - `entities` (413 artisti)
  - `event_entity_mapping` (associazioni)

### Servizi di Supporto
- **Cloud Storage**: Locandine poster
- **Vertex AI**: Gemini per estrazione artisti
- **Social APIs**: Facebook, Instagram, WhatsApp

---

## 2. Ambiente di Sviluppo - Kubernetes Locale

### Infrastruttura

```
mywire.org Cluster
├── Namespace: danielworkspace
├── Deployments:
│   ├── finedimondo-backend (2 replicas)
│   ├── finedimondo-frontend (2 replicas)
├── Services:
│   ├── finedimondo-backend (ClusterIP:8080)
│   ├── finedimondo-frontend (NodePort:30080)
├── Ingress:
│   └── finedimondo-ingress (finedimondo.local)
├── ConfigMap:
│   └── finedimondo-config (variabili ambiente)
└── Secrets:
    └── finedimondo-secrets (credenziali)
```

### Flusso Deployment (Kubernetes)

```
1. GitHub Push (develop branch)
   ↓
2. Cloud Build Trigger
   ↓
3. Build Docker Images
   → registry.finedimondo.mywire.org
   ↓
4. Kustomize Deploy
   → Kubernetes (mywire.org)
   ↓
5. Rolling Update
   → finedimondo-backend/frontend
   ↓
6. Health Checks
   → /api/health
```

### Accesso Sviluppo

**Port Forward:**
```bash
kubectl port-forward svc/finedimondo-frontend 3000:80    # Frontend
kubectl port-forward svc/finedimondo-backend 8080:8080    # Backend
```

**URL:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080/api`

### Resource Limits (Kubernetes)

| Component | Memory Request | Memory Limit | CPU Request | CPU Limit |
|-----------|---|---|---|---|
| Backend | 256Mi | 512Mi | 100m | 500m |
| Frontend | 128Mi | 256Mi | 50m | 200m |

---

## 3. Ambiente di Produzione - Google Cloud Run

### Infrastruttura

```
Google Cloud Platform
├── Project: freedomrun-491323
├── Region: europe-west1
├── Services:
│   ├── finedimondo-backend
│   │   └── Cloud Run (Managed)
│   ├── finedimondo-frontend
│   │   └── Cloud Run (Managed)
├── Cloud Build Triggers
│   ├── main branch → finedimondo-backend
│   └── main branch → finedimondo-frontend
├── Artifact Registry
│   └── europe-west1-docker.pkg.dev/...
└── Cloud SQL
    └── kyuss_retro (PostgreSQL)
```

### Flusso Deployment (Cloud Run)

```
1. GitHub Push (main/master branch)
   ↓
2. Cloud Build Trigger (Automatic)
   ↓
3. Build Docker Images
   → Artifact Registry
   ↓
4. Deploy to Cloud Run
   → Managed Service
   ↓
5. Environment Variables
   → Set via Cloud Run Console
   ↓
6. Auto-scaling
   → 0 (idle) to N instances
   ↓
7. Health Checks
   → /api/health
```

### Configurazione Cloud Run

**Backend:**
- Memory: 512Mi
- CPU: 1
- Timeout: 3600s
- Concurrency: default
- Auto-scaling: 0-100 instances

**Frontend:**
- Memory: 256Mi
- CPU: 1
- Timeout: 3600s
- Concurrency: default
- Auto-scaling: 0-100 instances

### URL Produzione

```
Backend:  https://finedimondo-backend-[HASH].run.app/api
Frontend: https://finedimondo-frontend-[HASH].run.app
```

Opzionalmente con custom domain:
```
Backend:  https://api.finedimondo.org
Frontend: https://finedimondo.org
```

---

## 4. Flusso Dati

### Richiesta Tipica (Frontend → Backend → Database)

```
Browser (Frontend)
    ↓ GET /api/events
Frontend Service (Angular)
    ↓ HttpClient
Backend Service (FastAPI)
    ↓ GET /api/events
Backend API Endpoint
    ↓ SQLAlchemy Query
PostgreSQL (kyuss_retro)
    ↓ Result Set
Backend API Response (JSON)
    ↓ HTTP 200
Frontend Service (RxJS)
    ↓ Observable.subscribe()
Component Template
    ↓ Angular Binding
Browser Display
```

### Integrazione Vertex AI (Gemini)

```
Admin Interface
    ↓ POST /api/admin/analyze-event
Backend Endpoint
    ↓ Extract event text
Vertex AI (Gemini)
    ↓ LLM Analysis
Artist List (JSON)
    ↓ Create entities
PostgreSQL
    ↓ Update relations
Response to Frontend
    ↓ Show results
```

### Integrazione Social Media

```
Frontend Social Component
    ↓ POST /api/social/import
Backend Social API
    ↓ Request Facebook Graph API
    ↓ Request Instagram Graph API
Social APIs
    ↓ Return events
Backend Processing
    ↓ Map to DB schema
PostgreSQL
    ↓ Insert/Update
Response to Frontend
    ↓ Show status
```

---

## 5. Sicurezza

### Autenticazione

- **Frontend → Backend**: JWT Token
- **Google Cloud**: Service Accounts
- **Database**: Username/Password + IP Whitelist

### Autorizzazione

- **Admin Routes**: JWT + Role check
- **Public Routes**: Unauthenticated
- **CORS**: Configured per environment

### Dati Sensibili

- **`.env` files**: Git ignored
- **Secrets**: Kubernetes Secrets / Google Secret Manager
- **Database Password**: Stored in Secret Manager

---

## 6. Monitoring e Logging

### Kubernetes (Sviluppo)

```bash
# Logs
kubectl logs -f deployment/finedimondo-backend -n danielworkspace

# Metrics
kubectl top pods -n danielworkspace

# Events
kubectl get events -n danielworkspace
```

### Google Cloud (Produzione)

```bash
# Cloud Logging
gcloud logging read "resource.type=cloud_run_revision"

# Cloud Monitoring
# https://console.cloud.google.com/monitoring

# Cloud Trace
# https://console.cloud.google.com/traces
```

---

## 7. Disaster Recovery

### Backup Database

```bash
# Backup Cloud SQL
gcloud sql backups create finedimondo-backup-$(date +%Y%m%d_%H%M%S) \
  --instance=kyuss-instance \
  --project=freedomrun-491323
```

### Rollback Deployment

**Kubernetes:**
```bash
kubectl rollout undo deployment/finedimondo-backend -n danielworkspace
```

**Cloud Run:**
```bash
gcloud run deploy finedimondo-backend \
  --image [PREVIOUS-IMAGE-URL] \
  --region europe-west1
```

---

## 8. Performance Optimization

### Frontend
- Angular production build
- Lazy loading modules
- CDN caching
- Gzip compression

### Backend
- Connection pooling
- Query optimization
- Caching (Redis optional)
- Async operations

### Database
- Indexes su query frequenti
- Replication per read-scaling
- Regular VACUUM/ANALYZE

---

## 9. Scalabilità

### Kubernetes
- Horizontal Pod Autoscaling (HPA)
- Manual replica adjustment
- Resource quotas per namespace

### Cloud Run
- Automatic scaling (0-100)
- Memory/CPU adjustment
- Concurrency tuning

### Database
- Read replicas
- Connection pooling
- Query optimization

---

*Ultimo aggiornamento: 31 Marzo 2026*
