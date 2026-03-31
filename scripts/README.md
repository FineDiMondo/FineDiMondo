# Scripts di Deployment - Fine Di Mondo

Questo direttorio contiene script di automazione per il deployment su due ambienti:
- **Kubernetes locale** (mywire.org) - Sviluppo/Collaudo
- **Google Cloud Run** - Produzione

---

## Kubernetes Deployment

### Script: `deploy-kubernetes.sh`

Deploy automatico su Kubernetes locale con configurazione automatica.

```bash
# Uso base (usa defaults)
./deploy-kubernetes.sh

# Con parametri personalizzati
./deploy-kubernetes.sh danielworkspace registry.finedimondo.mywire.org mywire-cluster

# Parametri:
# 1. Namespace (default: danielworkspace)
# 2. Registry URL (default: registry.finedimondo.mywire.org)
# 3. Kubernetes Context (default: mywire-cluster)
```

### Cosa fa lo script:

1. ✅ Switch al context Kubernetes corretto
2. ✅ Crea il namespace `danielworkspace`
3. ✅ Aggiorna gli URL del registry nei manifest
4. ✅ Crea le credenziali Docker per Harbor Registry
5. ✅ Applica ConfigMap e Secrets
6. ✅ Deploy con Kustomize (oppure manifest YAML)
7. ✅ Verifica che i pod siano pronti
8. ✅ Mostra i comandi per accedere all'applicazione

### Accesso Post-Deployment

```bash
# Port forwarding
kubectl port-forward -n danielworkspace svc/finedimondo-frontend 3000:80
kubectl port-forward -n danielworkspace svc/finedimondo-backend 8080:8080

# Accedere a:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080/api/health
```

---

## Google Cloud Run Deployment

### Script: `deploy-cloud-run.sh`

Deploy automatico su Google Cloud Run con configurazione completa.

```bash
# Uso base (usa defaults)
./deploy-cloud-run.sh

# Con parametri personalizzati
./deploy-cloud-run.sh freedomrun-491323 europe-west1

# Parametri:
# 1. Google Cloud Project ID (default: freedomrun-491323)
# 2. Region (default: europe-west1)
```

### Cosa fa lo script:

1. ✅ Verifica che gcloud CLI sia installato
2. ✅ Configura il progetto Google Cloud
3. ✅ Build e deploy del backend
4. ✅ Build e deploy del frontend
5. ✅ Configura le environment variables
6. ✅ Verifica la salute dell'applicazione
7. ✅ (Opzionale) Configura domini personalizzati

### Accesso Post-Deployment

Gli URL sono mostrati al termine dello script:

```
Frontend: https://finedimondo-frontend-[HASH].run.app
Backend:  https://finedimondo-backend-[HASH].run.app/api
Health:   https://finedimondo-backend-[HASH].run.app/api/health
```

### Configurare Domini Personalizzati

Lo script chiede se vuoi configurare domini personalizzati:

```
Frontend: finedimondo.org
Backend:  api.finedimondo.org
```

Devi poi aggiornare i DNS records nel tuo provider.

---

## Workflow di Deployment Completo

### Primo Deploy (Setup Completo)

```bash
# 1. Clonare il repository
git clone https://github.com/FineDiMondo/FineDiMondo.git
cd FineDiMondo

# 2. Rendere eseguibili gli script
chmod +x scripts/*.sh

# 3. Deploy su Kubernetes (Sviluppo)
./scripts/deploy-kubernetes.sh

# 4. (Opzionale) Deploy su Cloud Run (Produzione)
./scripts/deploy-cloud-run.sh
```

### Update Applicazione

Dopo aver fatto il push su GitHub:

```bash
# Aggiornare immagini nel registro
docker build -t registry.finedimondo.mywire.org/daniel/finedimondo-backend:latest ./backend
docker push registry.finedimondo.mywire.org/daniel/finedimondo-backend:latest

# Riavviare i pod su Kubernetes
kubectl rollout restart deployment/finedimondo-backend -n danielworkspace

# Cloud Run si aggiornerà automaticamente con Cloud Build
```

---

## Troubleshooting

### Script non è eseguibile

```bash
chmod +x scripts/deploy-kubernetes.sh
chmod +x scripts/deploy-cloud-run.sh
```

### Errore: "Command not found: kubectl" o "gcloud"

**Per Kubernetes:**
```bash
# Installare kubectl
# https://kubernetes.io/docs/tasks/tools/
```

**Per Cloud Run:**
```bash
# Installare Google Cloud SDK
# https://cloud.google.com/sdk/docs/install
```

### Errore di autenticazione su Harbor Registry

```bash
# Verificare le credenziali
docker login registry.finedimondo.mywire.org

# Creare il secret manualmente se lo script fallisce
kubectl create secret docker-registry harbor-registry-credentials \
  --docker-server=registry.finedimondo.mywire.org \
  --docker-username=your-username \
  --docker-password=your-password \
  -n danielworkspace
```

### Pod rimane in stato "Pending"

```bash
# Verificare gli eventi
kubectl describe pod <pod-name> -n danielworkspace

# Verificare le risorse disponibili
kubectl top nodes
kubectl describe node <node-name>
```

---

## Variabili Ambiente Importanti

Assicurati che queste siano configurate correttamente:

**Database Cloud SQL:**
```
CLOUDSQL_CONNECTION_NAME=freedomrun-491323:europe-west1:kyuss-instance
DB_USER=kyuss_admin
DB_PASSWORD=KyussRetro_GCP2026!
DB_NAME=kyuss_retro
```

**Vertex AI:**
```
VERTEX_AI_PROJECT=freedomrun-491323
VERTEX_AI_LOCATION=europe-west1
VERTEX_AI_MODEL=gemini-2.5-flash
```

**API URLs:**
```
KUBERNETES_API_URL=http://finedimondo-backend:8080/api
CLOUDRUN_API_URL=https://finedimondo-backend-[HASH].run.app/api
```

---

## Supporto

Per domande o problemi:
1. Consulta `DEPLOYMENT.md` per dettagli completi
2. Controlla i log: `kubectl logs` o `gcloud run logs`
3. Visita i dashboard: Kubernetes Dashboard o Google Cloud Console

---

*Ultimo aggiornamento: 31 Marzo 2026*
