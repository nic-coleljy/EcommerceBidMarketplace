# Deployment

A single deployment repo which contains all the services.

## Getting started

```bash
git clone --recursive https://gitlab.com/cs302-2022/g1-team1/deployment.git

# Deploy using the various scripts
docker compose up -d --build

# Visit the main landing page
# http://localhost:3030
```

## Updating

```bash
# Pull the latest from all repo
git submodule update --remote --merge
```

## Kubernetes deployment

To run this, you would require `minikube` to be installed.

Another requirements:

- Ingress addon
- Dashboard addon

```bash
cd deployments

kubectl delete secret gitlab-registry-access

kubectl create secret docker-registry gitlab-registry-access \
--docker-server=registry.gitlab.com \
--docker-username=gitlab+deploy-token-1480703 \
--docker-password=K9NQsaB3na4QEb98zH-a

kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/
```
