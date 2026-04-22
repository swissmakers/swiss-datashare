# <div align="center">Swiss DataShare</div>

[![Repository](https://img.shields.io/badge/GitHub-swissmakers/swiss--datashare-blue)](https://github.com/swissmakers/swiss-datashare)

---

Swiss DataShare is a self-hosted file sharing platform and an alternative for WeTransfer. Originally forked from Pingvin Share, this project is now actively maintained and developed by **Swissmakers GmbH** to serve our customers and the community.

## ✨ Features

- Share files using a link
- Unlimited file size (restricted only by disk space)
- Set an expiration date for shares
- Secure shares with visitor limits and passwords
- Email recipients
- Reverse shares
- OIDC and LDAP authentication
- Integration with ClamAV for security scans
- Different file providers: local storage and S3

## 🖼️ App Walkthrough

### 1) Login
![App login screen](docs/static/img/1-app-login.png)
The login page where the user authenticates to access Swiss DataShare.

### 2) Home
![App home dashboard](docs/static/img/2-app-home.png)
The main dashboard where the user lands after login and where he/she can start sharing files or requesting data.

### 3) Home - Shares
![App home with shares](docs/static/img/3-app-home-shares.png)
Here a user can show existing shares. "My shares" are created and send data-(shares) by the user itself. "Data Requests" will be described later, but here is also the overview of past data requests.

### 4) Share Data
![Share data action](docs/static/img/4-app-share-data.png)
Data can be shared by Drag & Drop to the marked field or selected by the "Select files" button. If all is uploaded a user clicks on "Share Data" button.

### 5) Share Data Form
![Share data form](docs/static/img/5-app-share-data-form.png)
This will open the share configuration form where the user can enter a title and note and set the expiration and other sharing options. (e.g. password protection)

### 6) Share Data Done
![Share data completed](docs/static/img/6-app-share-data-done.png)
After clicking "Share Data" in the form above, the secret-link with the user share is generated in the background and the link is shown to the user, which he/she can now send to the recipient -> add to the mail.

### 7) Share Link Received
![Share link received](docs/static/img/7-app-share-data-link-recived.png)
This shows the received test share, where the recipient has opened the secure-link from his mail.

### 8) Share Link Preview
![Share link preview](docs/static/img/8-app-share-data-link-recived-preview.png)
He can now all download or before download also open up the preview.

### 9) Own Shares
![Own shares listing](docs/static/img/9-app-shares-own-shares.png)
This is the user's own shares list where he can track and manage what was shared.

### 10) Request Data
![Request data action](docs/static/img/10-app-request-data.png)
The request-data flow is if you need files / data from a client that does not have a account on Swiss DataShare. By clicking "Create" on the "Data Requests" page the following form is opened, where the user can configure his data request and then click "Create" to generate the data-request-link.

### 11) Request Link Received - Upload
![Request link upload page](docs/static/img/11-app-request-data-link-recived-upload.png)
The recipient that opens the link, can directly start uploading his data and also add a optional message to the request owner. As soon as all is done the client only needs to click on "Finish upload".

### 12) Request Link Received - Done
![Request upload completed](docs/static/img/12-app-request-data-link-recived-done.png)
A upload completion should be shown, that confirms that all went well.

### 13) Requested Data Received
![Requested data received](docs/static/img/13-app-request-data-recived.png)
If the requester configered to recive a mail, as soon as the "upload finishes" he will get a message with the new secure-link where he can access the data. (login needed). If not configured he can check the "Data Requests" overview (see 15).

### 14) Requested Data Preview
![Requested data preview](docs/static/img/14-app-request-data-recived-preview.png)
Here as well a preview is possible before downloading.

### 15) Request Data Shares
![Request data shares overview](docs/static/img/15-app-request-data-shares.png)
The mentioned request-share overview where the user can monitors all request-based data exchanges.

## 🚀 Get Started

> **Security Recommendation**: For production environments, we recommend using **Podman** and **Podman Compose** instead of Docker for enhanced security. Podman runs rootless by default and provides better isolation. All examples below work with both Docker and Podman, but Podman is preferred for security-conscious deployments.

### Installation with Docker/Podman (recommended)

#### Using Prebuilt Image

We provide a prebuilt container image that you can use directly:

```yaml
services:
  swiss-datashare:
    image: registry.swissmakers.ch/infra/swiss-datashare:latest
    restart: unless-stopped
    ports:
      - 3000:3000
    environment:
      - TRUST_PROXY=false
    volumes:
      - "./data:/opt/app/backend/data:Z"
      - "./data/images:/opt/app/frontend/public/img:Z"
```

**SELinux Note**: When using Podman on systems with SELinux enabled (e.g., RHEL, CentOS, Fedora), use the `:Z` or `:z` suffix on volume mounts:
- `:Z` - Sets the SELinux context to be private and unshared (recommended for single-container use)
- `:z` - Sets the SELinux context to be shared (use when multiple containers need access)
- Without a suffix, SELinux may block container access to mounted volumes

#### Using Docker Compose / Podman Compose

1. Download the `docker-compose.yml` file
2. Run with Docker: `docker compose up -d` or with Podman: `podman-compose up -d`

**Note**: We recommend using `podman-compose` for better security. Podman runs rootless by default and provides enhanced isolation compared to Docker.

The webapp is now listening on `http://localhost:3000`, have fun with Swiss DataShare!

#### Production Setup with Systemd Service

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

### Manual Build

If you want to build the project manually from source, follow these steps:

#### Prerequisites

- Node.js 22 or higher
- npm (comes with Node.js)
- Docker (optional, for building the container image)

#### Building the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/swissmakers/swiss-datashare.git
   cd swiss-datashare
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Build the backend:**
   ```bash
   cd backend
   npm run build
   ```
   This will compile the NestJS backend and create the `dist` directory.

4. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   This will compile the Next.js frontend and create the `.next` directory.

5. **Run the application:**
   ```bash
   # Start the backend (from backend directory)
   npm run prod
   
   # In another terminal, start the frontend (from frontend directory)
   npm run start
   ```

#### Building Container Image

To build your own container image with Docker:

```bash
docker build -t swiss-datashare:latest .
```

Or with Podman (recommended for security):

```bash
podman build -t swiss-datashare:latest .
```

Or use the provided script:

```bash
npm run deploy:dev
```

This will build a multi-platform image (linux/amd64, linux/arm64) and push it to the registry.

## 📚 Documentation

For more installation options and advanced configurations, please refer to the [documentation](https://github.com/swissmakers/swiss-datashare).

## 🏢 About Swissmakers GmbH

Swiss DataShare is actively maintained and developed by **Swissmakers GmbH**. We are committed to providing a reliable, secure, and feature-rich file sharing solution for our customers and the broader user community.

- **Repository**: [https://github.com/swissmakers/swiss-datashare](https://github.com/swissmakers/swiss-datashare)
- **Active Development**: Yes, we continuously develop and improve Swiss DataShare
- **Customer Support**: We provide support for our customers using this application

## 🤝 Contribute

We welcome contributions! You can help by:
- Translating Swiss DataShare to your language
- Contributing to the codebase
- Reporting bugs and suggesting features

## 📄 License

This project is licensed under **PolyForm Noncommercial 1.0.0**.

- Noncommercial use is allowed under the PolyForm Noncommercial terms.
- Commercial use is **not** granted by default.
- Commercial use requires a separate commercial license from **Swissmakers GmbH**.

See:

- [`LICENSE`](LICENSE)
- [`COMMERCIAL-LICENSE.md`](COMMERCIAL-LICENSE.md)

Historical attribution is preserved, including:

- Copyright (c) 2022, Elias Schneider
