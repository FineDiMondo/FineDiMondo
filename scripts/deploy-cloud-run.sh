#!/bin/bash

# Script di deployment automatico per Google Cloud Run
# Uso: ./deploy-cloud-run.sh [project-id] [region]

set -e

# Default values
PROJECT_ID=${1:-freedomrun-491323}
REGION=${2:-europe-west1}
BACKEND_SERVICE="finedimondo-backend"
FRONTEND_SERVICE="finedimondo-frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fine Di Mondo - Google Cloud Run Deployment ===${NC}"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}[1/4] Setting Google Cloud project...${NC}"
gcloud config set project $PROJECT_ID

# Build and deploy backend
echo -e "${YELLOW}[2/4] Building and deploying backend...${NC}"
gcloud run deploy $BACKEND_SERVICE \
  --source ./backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars \
    CLOUDSQL_CONNECTION_NAME=freedomrun-491323:europe-west1:kyuss-instance,\
    DB_USER=kyuss_admin,\
    DB_NAME=kyuss_retro,\
    DEBUG=False,\
    VERTEX_AI_PROJECT=freedomrun-491323,\
    VERTEX_AI_LOCATION=europe-west1 \
  --timeout 3600s

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "Backend URL: $BACKEND_URL"
echo ""

# Build and deploy frontend
echo -e "${YELLOW}[3/4] Building and deploying frontend...${NC}"
gcloud run deploy $FRONTEND_SERVICE \
  --source ./frontend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --set-env-vars API_URL=${BACKEND_URL}/api \
  --timeout 3600s

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "Frontend URL: $FRONTEND_URL"
echo ""

# Verify deployment
echo -e "${YELLOW}[4/4] Verifying deployment...${NC}"
echo ""

# Test backend health check
echo "Testing backend health endpoint..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" ${BACKEND_URL}/api/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✓ Backend health check: OK${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $HEALTH_CHECK)${NC}"
fi

echo ""
echo -e "${GREEN}=== Deployment URLs ===${NC}"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  ${BACKEND_URL}/api"
echo "Health:   ${BACKEND_URL}/api/health"
echo ""

# Optional: Setup custom domain
read -p "Do you want to setup custom domains? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Frontend domain (e.g., finedimondo.org): " FRONTEND_DOMAIN
    read -p "Backend domain (e.g., api.finedimondo.org): " BACKEND_DOMAIN

    echo -e "${YELLOW}Setting up custom domains...${NC}"

    gcloud run domain-mappings create \
      --service=$FRONTEND_SERVICE \
      --domain=$FRONTEND_DOMAIN \
      --region=$REGION

    gcloud run domain-mappings create \
      --service=$BACKEND_SERVICE \
      --domain=$BACKEND_DOMAIN \
      --region=$REGION

    echo -e "${GREEN}✓ Custom domains configured${NC}"
    echo "Update your DNS records:"
    echo "  $FRONTEND_DOMAIN -> $FRONTEND_URL"
    echo "  $BACKEND_DOMAIN -> ${BACKEND_URL}"
fi

echo ""
echo -e "${GREEN}✅ Cloud Run deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Visit: $FRONTEND_URL"
echo "  2. Monitor logs: gcloud run logs read $BACKEND_SERVICE --region=$REGION --limit=50"
echo "  3. View dashboard: https://console.cloud.google.com/run"
