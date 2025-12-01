---
id: installation
---

# Installation

> **Security Recommendation**: For production environments, we recommend using **Podman** and **Podman Compose** instead of Docker for enhanced security. Podman runs rootless by default and provides better isolation. All examples below work with both Docker and Podman, but Podman is preferred for security-conscious deployments.

### Installation with Docker/Podman (recommended)

1. Download the `docker-compose.yml` file
2. Run with Docker: `docker compose up -d` or with Podman: `podman-compose up -d`

**Note**: We recommend using `podman-compose` for better security. Podman runs rootless by default and provides enhanced isolation compared to Docker.

**SELinux Note**: When using Podman on systems with SELinux enabled (e.g., RHEL, CentOS, Fedora), ensure your `docker-compose.yml` uses the `:Z` or `:z` suffix on volume mounts:
- `:Z` - Sets the SELinux context to be private and unshared (recommended for single-container use)
- `:z` - Sets the SELinux context to be shared (use when multiple containers need access)
- Without a suffix, SELinux may block container access to mounted volumes

The website is now listening on `http://localhost:3000`, have fun with Swiss DataShare 🐧!

### Installation with Portainer

1. In the **Stacks** menu, click the **Add stack** button
2. Give you stack a name (ex. pingvinshare)
3. In the web editor, paste the content of the [docker-compose](https://github.com/swissmakers/swiss-datashare/blob/main/docker-compose.yml) file.
4. Edit the external port and the environment variables (optional).
5. Click on **Deploy the stack**.

Your container is now listening on `http://localhost:<externalport>`, have fun with Swiss DataShare 🐧!

### Production Setup with Systemd Service

For production environments, it is recommended to use a systemd service instead of podman compose. This provides better control over container lifecycle, automatic restarts, and integration with the system's service management.

**Note**: If you are running in an environment with self-signed LDAPS and proxy certificates, you will need to set the `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable to allow connections to services with self-signed certificates.

Create a systemd service file at `/etc/systemd/system/swiss-datashare-container.service`:

```ini
[Unit]
Description=Systemd controlled container
After=network.target

[Service]
Environment="SERVICE=prod-swiss-datashare"
Type=simple
TimeoutStartSec=30s
ExecStartPre=-/usr/bin/podman rm -f "$SERVICE"
ExecStart=/usr/bin/podman run --name $SERVICE \
  --dns=172.16.10.4 \
  --dns=172.16.10.5 \
  -p 127.0.0.1:3010:3000 \
  -v /opt/podman-swiss-datashare/data:/opt/app/backend/data:Z \
  -v /opt/podman-swiss-datashare/images:/opt/app/frontend/public/img:Z \
  -e TRUST_PROXY=true \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  registry.swissmakers.ch/infra/swiss-datashare:latest
ExecReload=-/usr/bin/podman stop "$SERVICE"
ExecReload=-/usr/bin/podman rm "$SERVICE"
ExecStop=-/usr/bin/podman stop "$SERVICE"
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

**Configuration Notes:**

- **DNS servers**: Adjust the `--dns` flags to match your network's DNS servers
- **Port binding**: The example binds to `127.0.0.1:3010:3000` (localhost only). Adjust as needed for your setup
- **Volume mounts**: Update the volume paths (`/opt/podman-swiss-datashare/data` and `/opt/podman-swiss-datashare/images`) to match your desired data directories
- **SELinux labels**: The `:Z` suffix on volume mounts is required on systems with SELinux enabled (e.g., RHEL, CentOS, Fedora). Use `:Z` for private unshared volumes (recommended) or `:z` for shared volumes when multiple containers need access
- **NODE_TLS_REJECT_UNAUTHORIZED**: Set to `0` only if you need to connect to services with self-signed certificates (e.g., LDAPS, proxy). In secure environments, consider using proper certificate management instead
- **TRUST_PROXY**: Set to `true` when running behind a reverse proxy

After creating the service file, enable and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable swiss-datashare-container.service
sudo systemctl start swiss-datashare-container.service
```

Check the status with:

```bash
sudo systemctl status swiss-datashare-container.service
```

### Stand-alone Installation

Required tools:

- [Node.js](https://nodejs.org/en/download/) >= 22
- [Git](https://git-scm.com/downloads)
- [pm2](https://pm2.keymetrics.io/) for running Swiss DataShare in the background

```bash
git clone https://github.com/swissmakers/swiss-datashare
cd swiss-datashare

# Checkout the latest version
git fetch --tags && git checkout $(git describe --tags `git rev-list --tags --max-count=1`)

# Start the backend
cd backend
npm install
npm run build
pm2 start --name="swiss-datashare-backend" npm -- run prod

# Start the frontend
cd ../frontend
npm install
npm run build
API_URL=http://localhost:8080 # Set the URL of the backend, default: http://localhost:8080
pm2 start npm --name "swiss-datashare-frontend" -- run start
```

**Uploading Large Files**: By default, Swiss DataShare uses a built-in reverse proxy to reduce the installation steps. However, this reverse proxy is not optimized for uploading large files. If you wish to upload larger files, you can either use the Docker/Podman installation or set up your own reverse proxy. An example configuration for Caddy can be found in `./reverse-proxy/Caddyfile`.

The website is now listening on `http://localhost:3000`, have fun with Swiss DataShare 🐧!
