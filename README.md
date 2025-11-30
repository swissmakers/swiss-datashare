# <div align="center">Swiss DataShare</div>

[![Repository](https://img.shields.io/badge/GitHub-swissmakers/swiss--datashare-blue)](https://github.com/swissmakers/swiss-datashare)

---

Swiss DataShare is a self-hosted file sharing platform and an alternative for WeTransfer. Originally forked from Pingvin Share, this project is now actively maintained and developed by **Swissmakers GmbH** to serve our customers and the open-source community.

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

## 🚀 Get Started

### Installation with Docker (recommended)

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
      - "./data:/opt/app/backend/data"
      - "./data/images:/opt/app/frontend/public/img"
```

#### Using Docker Compose

1. Download the `docker-compose.yml` file
2. Run `docker compose up -d`

The website is now listening on `http://localhost:3000`, have fun with Swiss DataShare!

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

#### Building Docker Image

To build your own Docker image:

```bash
docker build -t swiss-datashare:latest .
```

Or use the provided script:

```bash
npm run deploy:dev
```

This will build a multi-platform image (linux/amd64, linux/arm64) and push it to the registry.

## 📚 Documentation

For more installation options and advanced configurations, please refer to the [documentation](https://github.com/swissmakers/swiss-datashare).

## 🏢 About Swissmakers GmbH

Swiss DataShare is actively maintained and developed by **Swissmakers GmbH**. We are committed to providing a reliable, secure, and feature-rich file sharing solution for our customers and the open-source community.

- **Repository**: [https://github.com/swissmakers/swiss-datashare](https://github.com/swissmakers/swiss-datashare)
- **Active Development**: Yes, we continuously develop and improve Swiss DataShare
- **Customer Support**: We provide support for our customers using this application

## 🤝 Contribute

We welcome contributions! You can help by:
- Translating Swiss DataShare to your language
- Contributing to the codebase
- Reporting bugs and suggesting features

## 📄 License

This project is licensed under the BSD-2-Clause license.
