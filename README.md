# Task Collaboration System - Root README

A production-ready task collaboration and project management system built with Node.js, React, and PostgreSQL.

## Overview

CollaborateX is a full-stack web application designed to streamline project and task management with modern architectural patterns and best practices. It provides secure authentication, role-based access control, and a responsive user interface.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js 20+ (for development)
- PostgreSQL 12+ (if not using Docker)

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd collaboratex

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Verify services are running
curl http://localhost:5000/api/health
open http://localhost:5173
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432

### Manual Setup

#### Backend
```bash
cd backend

# Copy environment
cp .env.example .env

# Install dependencies
npm install

# Setup database
npm run db:migrate

# Start development server
npm run dev
```

#### Frontend
```bash
cd frontend

# Copy environment
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
collaboratex/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── app.ts             # Express app configuration
│   │   ├── index.ts           # Server entry point
│   │   ├── types/             # TypeScript types
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── middleware/        # HTTP middleware
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Utilities (logger, errors)
│   ├── prisma/
│   │   └── schema.prisma      # Database models
│   ├── Dockerfile             # Backend container
│   ├── package.json           # Dependencies
│   ├── tsconfig.json          # TypeScript config
│   └── README.md              # Backend documentation
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout/        # Page layouts
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux state management
│   │   ├── api/               # API client
│   │   ├── types/             # TypeScript types
│   │   ├── hooks/             # Custom React hooks
│   │   └── App.tsx            # Root component
│   ├── Dockerfile             # Frontend container
│   ├── package.json           # Dependencies
│   ├── vite.config.ts         # Vite configuration
│   └── README.md              # Frontend documentation
│
├── docker-compose.yml         # Multi-container orchestration
├── .dockerignore               # Docker build exclusions
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

## Key Features

### Authentication & Security
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Token rotation and automatic refresh
- ✅ Protected routes and API endpoints

### Project Management
- ✅ Create and manage projects
- ✅ Add team members to projects
- ✅ Project-level permissions
- ✅ Project filtering and pagination

### Task Management
- ✅ Create, update, and delete tasks
- ✅ Task status tracking (OPEN, IN_PROGRESS, IN_REVIEW, COMPLETED, ARCHIVED)
- ✅ Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Task assignment to team members
- ✅ Due date tracking
- ✅ Advanced filtering and sorting
- ✅ Pagination support

### User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Modern UI with Tailwind CSS
- ✅ Loading states and empty states
- ✅ form validation with error messages
- ✅ API error handling and retry logic
- ✅ Intuitive navigation

## API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login and get tokens
POST   /api/auth/refresh-token     - Refresh access token
POST   /api/auth/logout            - Logout and invalidate token
```

### Project Endpoints
```
POST   /api/projects               - Create project
GET    /api/projects               - List user's projects (paginated)
GET    /api/projects/:id           - Get project details
PUT    /api/projects/:id           - Update project
DELETE /api/projects/:id           - Delete project
POST   /api/projects/:id/members   - Add project member
DELETE /api/projects/:id/members/:userId - Remove project member
```

### Task Endpoints
```
POST   /api/projects/:projectId/tasks           - Create task
GET    /api/projects/:projectId/tasks           - List tasks (paginated, filterable)
GET    /api/projects/:projectId/tasks/:taskId   - Get task details
PUT    /api/projects/:projectId/tasks/:taskId   - Update task
DELETE /api/projects/:projectId/tasks/:taskId   - Delete task
```

See [Backend README](./backend/README.md) and [Frontend README](./frontend/README.md) for detailed documentation.

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.x
- **ORM**: Prisma
- **Database**: PostgreSQL 12+
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS, bcrypt
- **Testing**: Jest (prepared, not implemented)

### Frontend
- **Framework**: React 19
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Routing**: React Router v7
- **Build Tool**: Vite
- **TypeScript**: 5.9+

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Deployment Options**: 
  - Self-hosted (Docker)
  - DigitalOcean App Platform (recommended)
  - AWS ECS/Fargate
  - Kubernetes

## Development

### Install Dependencies
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### Running Locally

#### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
```

#### Option 2: Manual (separate terminals)

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Database (if not dockerized):
```bash
# Start PostgreSQL (macOS with brew)
brew services start postgresql
```

### Database Migrations
```bash
cd backend

# Create new migration
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## Production Deployment

### Quick Deployment with Docker Compose

1. **Configure environment**:
```bash
cp docker-compose.yml docker-compose.prod.yml
# Edit docker-compose.prod.yml with production settings
```

2. **Build and deploy**:
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Recommended: DigitalOcean App Platform

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide including:
- Step-by-step instructions for multiple platforms
- Cost analysis and comparison
- Security hardening checklist
- Monitoring and backup strategies
- Scaling guidelines

**TL;DR**: Use DigitalOcean App Platform for simplicity, AWS ECS for scale, or Kubernetes for enterprise needs.

## Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/collaboratex_db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Monitoring & Logging

### Logging
- **Backend**: Winston logger outputs to console and files
- **Log files**: `backend/logs/` directory
- **Log levels**: info, warn, error with timestamps

### Health Checks
- **Backend**: GET `/api/health` - Returns server status
- **Database**: Automatic connection verification
- **Frontend**: Built-in error handling and retry logic

### Application Metrics (Future Enhancement)
- Response time monitoring
- Error rate tracking
- Database query performance
- API call analytics

## Security

- ✅ HTTPS/TLS support
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing (bcrypt)
- ✅ Input validation (Zod schemas)
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection (React escaping)
- ✅ Rate limiting (100 req/15min default)
- ✅ CORS configuration
- ✅ Security headers (Helmet.js)
- ✅ Environment variable management

**Important**: Change all default secrets and credentials before deploying to production!

## Troubleshooting

### Common Issues

#### Docker containers not starting
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

#### Database connection errors
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check connection string in .env
# Format: postgresql://user:password@host:port/database
```

#### API returning 401 Unauthorized
- Verify JWT tokens in localStorage
- Check token expiry (GET /api/health)
- Make sure refresh token is valid
- Re-login if necessary

#### Frontend CORS errors
- Verify CORS_ORIGIN matches frontend URL
- Check backend is running and accessible
- Clear browser cache and cookies

See individual README files for component-specific troubleshooting.

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Create Pull Request with description

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Task comments and discussions
- [ ] File attachments
- [ ] Activity timeline/audit log
- [ ] Email notifications
- [ ] Export to PDF/CSV
- [ ] Kanban board view
- [ ] Calendar view
- [ ] Webhooks/API keys
- [ ] Dark mode
- [ ] Mobile app (React Native)

## Performance Considerations

### Backend
- Database query optimization with strategic indexes
- Pagination to prevent loading large datasets
- Connection pooling for database
- Gzip compression enabled
- Rate limiting for DDoS protection

### Frontend
- Code splitting with React Router (future)
- Component memoization
- Redux selectors optimization
- Lazy loading for images
- Tailwind CSS tree-shaking in production

### Database
- Proper indexing on frequently queried columns
- Query analysis and optimization
- Regular maintenance and vacuuming
- Backup and replication strategies

## Documentation

- **[Backend README](./backend/README.md)**: Detailed API documentation, architecture, and setup
- **[Frontend README](./frontend/README.md)**: Components, state management, styling guide
- **[Deployment Guide](./DEPLOYMENT.md)**: Production deployment strategies and options

## License

ISC

## Support

For issues and questions:
1. Check the troubleshooting sections in README files
2. Review GitHub issues
3. Create a new issue with detailed reproduction steps

---

**Happy collaborating! 🚀**
