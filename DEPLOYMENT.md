# Guida Deployment - Fine Di Mondo

Questo documento descrive come deployare l'applicazione su due ambienti:
- **Sviluppo/Collaudo**: Kubernetes locale (mywire.org)
- **Produzione**: Google Cloud Run

---

## 1. Ambiente di Sviluppo - Kubernetes Locale (mywire.org)

### Prerequisiti
- Accesso al cluster Kubernetes su `mywire.org`
- `kubectl` configurato per il cluster
- Docker images pushate su `registry.finedimondo.mywire.org`
- `kustomize` installato (opzionale, ma consigliato)

### Setup Credenziali Harbor Registry

```bash
kubectl create secret docker-registry harbor-registry-credentials \
  --docker-server=registry.finedimondo.mywire.org \
  --docker-username=your-username \
  --docker-password=your-password \
  -n danielworkspace
```

### Deploy con Kustomize (Consigliato)

```bash
# Dall'interno della cartella del progetto
cd kubernetes
kustomize build . | kubectl apply -f -
```

Oppure applicare manualmente:

```bash
# 1. Creare namespace
kubectl apply -f kubernetes/namespace.yaml

# 2. Creare ConfigMap e Secrets
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml

# 3. Deploy backend e frontend
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

# 4. Setup Ingress
kubectl apply -f kubernetes/ingress.yaml
```

### Verificare il Deploy

```bash
# Controllare status dei pod
kubectl get pods -n danielworkspace

# Vedere i log
kubectl logs -n danielworkspace -l app=finedimondo-backend -f
kubectl logs -n danielworkspace -l app=finedimondo-frontend -f

# Port forward per testing
kubectl port-forward -n danielworkspace svc/finedimondo-backend 8080:8080
kubectl port-forward -n danielworkspace svc/finedimondo-frontend 3000:80
```

### Accedere all'Applicazione (Localhost)

**Frontend**: http://localhost:3000 (con port-forward)
**Backend API**: http://localhost:8080/api/health (con port-forward)

### Configurazione nel Cluster

Se il cluster ha un Ingress controller (nginx):

```bash
# Aggiungere al /etc/hosts per testing
127.0.0.1 finedimondo.local

# Accedere tramite Ingress
http://finedimondo.local/        # Frontend
http://finedimondo.local/api/    # Backend API
```

### Aggiornare le Immagini

```bash
# 1. Buildare le immagini localmente
docker build -t registry.finedimondo.mywire.org/daniel/finedimondo-backend:latest ./backend
docker build -t registry.finedimondo.mywire.org/daniel/finedimondo-frontend:latest ./frontend

# 2. Pushare su Harbor Registry
docker push registry.finedimondo.mywire.org/daniel/finedimondo-backend:latest
docker push registry.finedimondo.mywire.org/daniel/finedimondo-frontend:latest

# 3. Trigger rolling update nel cluster
kubectl rollout restart deployment/finedimondo-backend -n danielworkspace
kubectl rollout restart deployment/finedimondo-frontend -n danielworkspace
```

---

## 2. Ambiente di Produzione - Google Cloud Run

### Prerequisiti
- Google Cloud project: `freedomrun-491323`
- Cloud Build configurato
- Accesso a Google Cloud SDK (`gcloud`)

### Deploy Automatico con Cloud Build

Cloud Build monitorerà il repository e deplorerà automaticamente:

```bash
# Verificare Cloud Build trigger
gcloud builds list --project=freedomrun-491323

# Triggerare un build manualmente
gcloud builds submit --config=backend/cloudbuild.yaml ./backend --project=freedomrun-491323
gcloud builds submit --config=frontend/cloudbuild.yaml ./frontend --project=freedomrun-491323
```

### Deploy Manuale

```bash
# Backend
gcloud run deploy finedimondo-backend \
  --source ./backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --project=freedomrun-491323

# Frontend
gcloud run deploy finedimondo-frontend \
  --source ./frontend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --project=freedomrun-491323
```

### Configurare Environment Variables in Cloud Run

```bash
# Backend
gcloud run deploy finedimondo-backend \
  --set-env-vars CLOUDSQL_CONNECTION_NAME=freedomrun-491323:europe-west1:kyuss-instance \
  --region europe-west1 \
  --project=freedomrun-491323

# Frontend
gcloud run deploy finedimondo-frontend \
  --set-env-vars API_URL=https://finedimondo-backend-[SERVICE-URL]/api \
  --region europe-west1 \
  --project=freedomrun-491323
```

### URL di Produzione

Dopo il deploy su Cloud Run:

```
Backend:  https://finedimondo-backend-[HASH].run.app
Frontend: https://finedimondo-frontend-[HASH].run.app
```

### Configurare Custom Domain

```bash
# Mappare dominio personalizzato
gcloud run domain-mappings create \
  --service=finedimondo-backend \
  --domain=api.finedimondo.org \
  --region=europe-west1 \
  --project=freedomrun-491323

gcloud run domain-mappings create \
  --service=finedimondo-frontend \
  --domain=finedimondo.org \
  --region=europe-west1 \
  --project=freedomrun-491323
```

---

## 3. Pipeline CI/CD

### Sviluppo → Staging → Produzione

```
GitHub Push
    ↓
Cloud Build Trigger (Kubernetes)
    ↓
Build Images (Harbor Registry)
    ↓
Deploy a Kubernetes (mywire.org)
    ↓
Testing Manuale
    ↓
Cloud Build Trigger (Cloud Run)
    ↓
Build Images (Artifact Registry)
    ↓
Deploy a Cloud Run (Produzione)
```

### GitHub Branch Strategy

- `develop`: Deploy automatico a Kubernetes (staging)
- `main/master`: Deploy automatico a Cloud Run (produzione)

---

## 4. Troubleshooting

### Pod non parte su Kubernetes

```bash
kubectl describe pod <pod-name> -n danielworkspace
kubectl logs <pod-name> -n danielworkspace
```

### Problemi di connessione al Database

```bash
# Verificare credenziali
kubectl get secret finedimondo-secrets -n danielworkspace -o yaml

# Testare connessione
kubectl run -it --rm debug --image=postgres:15 --restart=Never -n danielworkspace \
  -- psql -h 34.76.47.191 -U kyuss_admin -d kyuss_retro
```

### Problemi di Ingress

```bash
kubectl describe ingress finedimondo-ingress -n danielworkspace
kubectl get events -n danielworkspace
```

### Cloud Run Logs

```bash
gcloud run logs read finedimondo-backend --region europe-west1 --project=freedomrun-491323
gcloud run logs read finedimondo-frontend --region europe-west1 --project=freedomrun-491323
```

---

## 5. Monitoring e Logging

### Kubernetes

```bash
# Monitor real-time
kubectl top nodes
kubectl top pods -n danielworkspace

# Streaming logs
kubectl logs -f -n danielworkspace -l app=finedimondo-backend
```

### Google Cloud Run

```bash
# Cloud Logging
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Cloud Monitoring Dashboard
# https://console.cloud.google.com/monitoring
```

---

## 6. Rollback

### Kubernetes

```bash
# Vedere history
kubectl rollout history deployment/finedimondo-backend -n danielworkspace

# Rollback all'ultima versione
kubectl rollout undo deployment/finedimondo-backend -n danielworkspace

# Rollback a una revisione specifica
kubectl rollout undo deployment/finedimondo-backend --to-revision=2 -n danielworkspace
```

### Google Cloud Run

```bash
gcloud run deploy finedimondo-backend \
  --image [PREVIOUS-IMAGE-URL] \
  --region europe-west1 \
  --project=freedomrun-491323
```

---

*Ultimo aggiornamento: 31 Marzo 2026*
