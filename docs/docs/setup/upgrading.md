---
id: upgrading
---

# Upgrading

### Upgrade to a new version

As Swiss DataShare is in early stage, see the release notes for breaking changes before upgrading.

#### Docker / Podman Compose

With Docker:
```bash
docker compose pull
docker compose up -d
```

With Podman (recommended for security):
```bash
podman-compose pull
podman-compose up -d
```

#### Systemd Service

For systemd service installations, upgrade by pulling the latest image and restarting the service:

```bash
# Pull the latest image
sudo podman pull registry.swissmakers.ch/infra/swiss-datashare:latest

# Restart the service (this will stop the old container and start a new one)
sudo systemctl restart swiss-datashare-container.service
```

The service will automatically recreate the container with the new image on restart.

### Portainer

1. In your container page, click on Recreate.
2. Check the Re-Pull image toggle.
3. Click on Recreate.

#### Stand-alone

1. Stop the running app
   ```bash
   pm2 stop swiss-datashare-backend swiss-datashare-frontend
   ```
2. Repeat the steps from the [installation guide](#stand-alone-installation) except the `git clone` step.

   ```bash
   cd swiss-datashare

   # Checkout the latest version
   git fetch --tags && git checkout $(git describe --tags `git rev-list --tags --max-count=1`)

   # Start the backend
   cd backend
   npm install
   npm run build
   pm2 restart swiss-datashare-backend

   # Start the frontend
   cd ../frontend
   npm install
   npm run build
   pm2 restart swiss-datashare-frontend
   ```
Note that environment variables are not picked up when using pm2 restart, if you actually want to change configs, you need to run ````pm2 --update-env restart````
