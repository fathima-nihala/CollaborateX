# 🐳 Docker Deployment Guide

This guide provides instructions for running the CollaborateX system using Docker and Docker Compose. This setup is production-ready, featuring multi-stage builds and optimized configurations.

## 🏗️ Architecture Summary

- **PostgreSQL**: Database for data storage.
- **Backend**: Node.js Express API (Typescript) running in a multi-stage production image.
- **Frontend**: Vite-based React SPA served via Nginx.
- **Networking**: All containers communicate over a private bridge network.

## 🚀 Quick Start

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Configure Environment
Create a `.env` file in the root directory (one level above `backend` and `frontend`):

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 3. Start Services
Run the following command in the root directory:

```bash
docker-compose up -d
```

This will:
1. Build the Backend and Frontend images.
2. Start the PostgreSQL database.
3. Run Prisma migrations on the database.
4. Start the API on `http://localhost:5000`.
5. Start the Web UI on `http://localhost:8080`.

### 4. Verify Installation
- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **Backend Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🛠️ Common Operations

### Restarting a Service
```bash
docker-compose restart backend
```

### Viewing Logs
```bash
docker-compose logs -f backend
```

### Running Database Migrations
Migrations are automatically run on startup. To run them manually:
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Resetting the Database
**Warning**: This deletes all data.
```bash
docker-compose down -v
docker-compose up -d
```

---

## 🔒 Security Recommendations

1. **Change Secrets**: Always update `JWT_SECRET` and `JWT_REFRESH_SECRET` in production.
2. **Database Credentials**: Change `POSTGRES_PASSWORD` in `docker-compose.yml`.
3. **CORS Configuration**: Update `CORS_ORIGIN` in `docker-compose.yml` to match your production domain.
4. **HTTPS**: In production, use a reverse proxy (like Traefik or Nginx) with SSL certificates (Let's Encrypt).

---

## 📝 Configuration Details

### Frontend Environment Variables
The frontend uses Vite, which requires environment variables to be baked in at build time. In `docker-compose.yml`, the `VITE_API_URL` is passed as a build argument.

```yaml
frontend:
  build:
    args:
      - VITE_API_URL=http://your-domain.com/api
```

### Nginx Configuration
The frontend is served using Nginx. The configuration matches client-side routing, meaning all non-file requests are redirected to `index.html`.
