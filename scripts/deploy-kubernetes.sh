#!/bin/bash

# Script di deployment automatico per Kubernetes (mywire.org)
# Uso: ./deploy-kubernetes.sh [namespace] [registry-url]

set -e

# Default values
NAMESPACE=${1:-danielworkspace}
REGISTRY=${2:-registry.finedimondo.mywire.org}
KUBE_CONTEXT=${3:-mywire-cluster}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fine Di Mondo - Kubernetes Deployment ===${NC}"
echo "Namespace: $NAMESPACE"
echo "Registry: $REGISTRY"
echo "Context: $KUBE_CONTEXT"
echo ""

# 1. Switch to correct context
echo -e "${YELLOW}[1/7] Switching to Kubernetes context...${NC}"
kubectl config use-context $KUBE_CONTEXT || {
    echo -e "${RED}Error: Could not switch to context '$KUBE_CONTEXT'${NC}"
    echo "Available contexts:"
    kubectl config get-contexts
    exit 1
}

# 2. Create namespace if not exists
echo -e "${YELLOW}[2/7] Creating namespace...${NC}"
kubectl apply -f kubernetes/namespace.yaml

# 3. Update registry URL in manifests
echo -e "${YELLOW}[3/7] Updating registry URL in manifests...${NC}"
sed -i "s|registry\.finedimondo\.mywire\.org|$REGISTRY|g" kubernetes/*.yaml

# 4. Create secrets
echo -e "${YELLOW}[4/7] Creating Docker registry credentials...${NC}"
read -p "Harbor Registry Username: " HARBOR_USER
read -sp "Harbor Registry Password: " HARBOR_PASS
echo ""

kubectl create secret docker-registry harbor-registry-credentials \
  --docker-server=$REGISTRY \
  --docker-username=$HARBOR_USER \
  --docker-password=$HARBOR_PASS \
  --docker-email=admin@finedimondo.org \
  -n $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

# 5. Apply ConfigMap and Secrets
echo -e "${YELLOW}[5/7] Applying ConfigMap and Secrets...${NC}"
kubectl apply -f kubernetes/configmap.yaml -n $NAMESPACE
kubectl apply -f kubernetes/secret.yaml -n $NAMESPACE

# 6. Deploy applications using Kustomize
echo -e "${YELLOW}[6/7] Deploying applications with Kustomize...${NC}"
cd kubernetes
kustomize build . | kubectl apply -n $NAMESPACE -f -
cd ..

# 7. Verify deployment
echo -e "${YELLOW}[7/7] Verifying deployment...${NC}"
echo ""
echo -e "${GREEN}Waiting for pods to be ready...${NC}"
kubectl rollout status deployment/finedimondo-backend -n $NAMESPACE --timeout=5m
kubectl rollout status deployment/finedimondo-frontend -n $NAMESPACE --timeout=5m

echo ""
echo -e "${GREEN}=== Deployment Status ===${NC}"
kubectl get all -n $NAMESPACE
echo ""

# Show access information
echo -e "${GREEN}=== Application Access ===${NC}"
echo ""
echo "Frontend Service: finedimondo-frontend (NodePort 30080)"
echo "Backend Service: finedimondo-backend (ClusterIP 8080)"
echo ""
echo "To access the application:"
echo "  kubectl port-forward -n $NAMESPACE svc/finedimondo-frontend 3000:80"
echo "  kubectl port-forward -n $NAMESPACE svc/finedimondo-backend 8080:8080"
echo ""
echo "Then visit:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080/api/health"
echo ""

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
