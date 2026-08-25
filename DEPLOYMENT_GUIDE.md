# Multi-Environment Deployment Guide — SLR Membership (Single VPS) via GitHub Actions

This guide provides complete instructions for configuring the GitHub Actions CI/CD pipeline to deploy Smart Life Rewards (SLR) Membership Frontend on a single VPS across two isolated environments:
- **Production (`prod`)**: Automatically triggered on push/merge to the `main` branch.
- **Development (`dev`)**: Automatically triggered on push/merge to the `develop` branch.
- **Manual Trigger**: Can be manually executed via **Actions > Run workflow** by selecting the target environment (`prod` or `dev`).

---

## 1. Single VPS Multi-Environment Isolation Strategy

To ensure `prod` and `dev` environments run side-by-side on the same VPS without conflicts, we isolate containers, host ports, and project names via environment variables:

| Component | Production (`prod`) | Development (`dev`) |
|-----------|----------------------|---------------------|
| **Git Branch** | `main` | `develop` |
| **Target Directory (`DEPLOY_PATH`)** | `/home/ubuntu/frontend/slr-membership` | `/home/ubuntu/frontend/slr-membership-dev` |
| **Compose Project Name (`APP_NAME`-`NODE_ENV`)** | `slr-membership-production` | `slr-membership-development` |
| **Container Name (`CONTAINER_NAME`)** | `slr-membership-production` | `slr-membership-development` |
| **Host Port (`APP_PORT`)** | `3001` | `3000` |
| **Docker Container Image Tag** | `ghcr.io/...:prod` (`:latest`) | `ghcr.io/...:dev` |

---

## 2. GitHub Secrets & Variables Configuration

Navigate to your GitHub repository (**slr-membership**) > **Settings > Secrets and variables > Actions**.

### A. Repository Secrets (for Sensitive Keys)
Go to **Secrets** tab -> Click **New repository secret**:
- `SSH_KEY`: Private SSH Key (`~/.ssh/id_rsa`)
- `GHCR_PAT`: *(Optional)* Personal Access Token for GitHub Container Registry

---

### B. Repository Variables (for General Settings)
Go to **Variables** tab -> Click **New repository variable**:

#### Shared Variables
- `SSH_HOST`: VPS IP Address (e.g., `123.45.67.89`)
- `SSH_USER`: SSH Username (e.g., `ubuntu`)
- `SSH_PORT`: `22`

#### Environment-Specific Variables

##### Production Variables
- `DEPLOY_PATH_PROD`: `/home/ubuntu/frontend/slr-membership`
- `ENV_FILE_PROD`: *(Production `.env` content below)*

```env
APP_NAME=slr-membership
NODE_ENV=production
APP_PORT=3001

AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://membership.smartliferewards.com.au
NEXT_PUBLIC_API_URL=https://api.smartliferewards.com.au
```

---

##### Development Variables
- `DEPLOY_PATH_DEV`: `/home/ubuntu/frontend/slr-membership-dev`
- `ENV_FILE_DEV`: *(Development `.env` content below)*

```env
APP_NAME=slr-membership
NODE_ENV=development
APP_PORT=3000

AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://dev-membership.smartliferewards.com.au
NEXT_PUBLIC_API_URL=https://dev-api.smartliferewards.com.au
```

---

## 3. Nginx Reverse Proxy Configuration on VPS

Since `prod` runs on host port `3001` and `dev` runs on host port `3000`, configure Nginx on your VPS as follows:

### Production Nginx Server Block (`membership.smartliferewards.com.au`)
```nginx
server {
    listen 80;
    server_name membership.smartliferewards.com.au;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Development Nginx Server Block (`dev-membership.smartliferewards.com.au`)
```nginx
server {
    listen 80;
    server_name dev-membership.smartliferewards.com.au;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Deployment Workflow Summary

1. **Push to `main` Branch**:
   - Targets the `prod` configuration.
   - Deploys `ENV_FILE_PROD` to `DEPLOY_PATH_PROD` (`/home/ubuntu/frontend/slr-membership`).
   - Runs `docker compose up -d` on port `3001`.

2. **Push to `develop` Branch**:
   - Targets the `dev` configuration.
   - Deploys `ENV_FILE_DEV` to `DEPLOY_PATH_DEV` (`/home/ubuntu/frontend/slr-membership-dev`).
   - Runs `docker compose up -d` on port `3000`.

Both environments run completely isolated on the same VPS.
