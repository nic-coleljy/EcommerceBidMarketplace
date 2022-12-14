# Deployment

A single deployment repo which contains all the services.

## Getting started

```bash
git clone --recursive https://github.com/nic-coleljy/EcommerceBidMarketplace.git

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
--docker-username=
--docker-password=

kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/
```

<br>
<b> Credits: </b><br>
1. Chong Zhan Han <br>
2. Yuen Kah May <br>
3. Nicole Lim Jia Yi<br>
4. Teo Keng Swee <br>
5. Won Ying Keat <br>
6. Cheah King Yeh <br>
