# Task Collaboration System - Backend API

A secure, scalable REST API for project and task management with role-based access control.

## Architecture Overview

### Design Decisions

#### 1. **Framework: Express.js**
- Lightweight and flexible
- Large ecosystem and community support
- Easy to understand layered architecture
- Excellent middleware support

#### 2. **Database: PostgreSQL with Prisma ORM**
- **Why PostgreSQL**: Robust relational database with excellent ACID compliance
- **Why Prisma**: Type-safe ORM, automatic migrations, excellent DX
- **Scalability**: Proper indexing on frequently queried columns (email, status, priority)
- **Data Integrity**: Foreign key constraints and cascading deletes

#### 3. **Authentication: JWT with Refresh Tokens**
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) stored in DB for secure rotation
- **Benefits**: Stateless scalability, token can be validated offline, refresh mechanism prevents long-term exposure
- **Storage**: Refresh tokens stored in database for invalidation/logout capability

#### 4. **Authorization: Role-Based Access Control (RBAC)**
- **Global Roles**: ADMIN, MANAGER, USER
- **Project Roles**: Can differ per project (allows managers to have limited access to specific projects)
- **Granular Permissions**: Enforced at service layer for integrity
- **Examples**:
  - Only project ADMIN can modify/delete project
  - Only task creator or project admin can delete task
  - All project members can view project tasks

#### 5. **Input Validation: Zod**
- Type-safe schema validation
- Clear error messages with field-level details
- Validation at route layer before reaching business logic
- Prevents invalid data from entering the system

#### 6. **Logging Strategy**
- **Winston Logger**: Production-grade logging with multiple transports
- **File Rotation**: 5MB max file size with 5 file rotation
- **Log Levels**: info, warn, error separated into appropriate files
- **Context**: Each log includes timestamp, service name, and relevant metadata
- **Development**: Color-coded console output for easy debugging

#### 7. **Error Handling**
- **Custom Error Classes**: AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError
- **Centralized Handler**: All errors pass through middleware for consistent formatting
- **Proper HTTP Status Codes**: 400, 401, 403, 404, 409, 500
- **Error Responses**: Consistent format with error details in development mode

#### 8. **Performance Considerations**
- **Database Indexing**: Indexes on frequently filtered columns (email, status, priority, foreign keys)
- **Pagination**: Prevents loading entire datasets (default 10 items/page)
- **Field Selection**: Explicit `select` to avoid fetching unnecessary columns
- **Connection Pooling**: Prisma handles optimal connection management
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Compression**: gzip compression on all responses
- **Caching Headers**: Set-Cache-Control headers in middleware layer (can be extended)

#### 9. **Security Best Practices**
- **Helmet.js**: Sets secure HTTP headers
- **CORS**: Restricted to configured origins
- **Password Hashing**: Bcrypt with 10 salt rounds (configurable)
- **JWT Secrets**: Environment variables (never hardcoded)
- **Input Sanitization**: Zod validation
- **Rate Limiting**: Prevents brute force attacks
- **HTTPS Ready**: Runs behind reverse proxy/load balancer
- **Token Refresh Rotation**: Old tokens invalidated after refresh
- **No Sensitive Data in JWT**: Only id, email, role included

## Project Structure

```
src/
├── index.ts                 # Application entry point
├── app.ts                   # Express app configuration
├── types/
│   └── index.ts             # TypeScript interfaces and enums
├── schemas/
│   └── validation.ts        # Zod validation schemas
├── middleware/
│   ├── auth.ts              # JWT authentication & RBAC
│   ├── validation.ts        # Request validation
│   └── errorHandler.ts      # Error handling
├── controllers/
│   ├── auth.controller.ts   # Authentication endpoints
│   ├── project.controller.ts # Project management
│   └── task.controller.ts   # Task management
├── services/
│   ├── auth.service.ts      # Authentication business logic
│   ├── project.service.ts   # Project business logic
│   └── task.service.ts      # Task business logic
├── routes/
│   ├── auth.routes.ts       # Auth endpoints
│   ├── project.routes.ts    # Project endpoints
│   └── task.routes.ts       # Task endpoints
├── utils/
│   ├── logger.ts            # Winston logger configuration
│   └── errors.ts            # Custom error classes
└── prisma/
    └── schema.prisma        # Database models and schema
```

### Layered Architecture

```
Request → Routes → Middleware (Validation, Auth) → Controllers → Services → Database
                        ↓
                    Error Handler → Response
```

- **Routes**: Define endpoints and map to controllers
- **Controllers**: Handle request/response, call services
- **Services**: Business logic and orchestration
- **Database**: Prisma ORM with PostgreSQL

This separation ensures:
- Easy testing (mock services in controllers)
- Reusable business logic
- Clear responsibility boundaries
- Scalability for larger applications

## Database Schema

### Key Models

#### User
- JWT authentication credentials
- Global role (ADMIN, MANAGER, USER)
- Relationships: Projects (via ProjectMember), Tasks

#### Project
- Contains multiple tasks
- Has members with per-project roles
- Created by user, managed by admins

#### ProjectMember
- Join table for Project-User many-to-many relationship
- Allows different roles per project
- Cascade delete: removing user removes membership

#### Task
- Belongs to project
- Assigned to single user or unassigned
- Status tracking (OPEN, IN_PROGRESS, IN_REVIEW, COMPLETED, ARCHIVED)
- Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- Due date support

#### RefreshToken
- Secure token storage for logout/invalidation
- Indexed by userId and expiresAt for efficient cleanup
- Automatic cleanup of expired tokens possible

### Indexing Strategy

```sql
-- Performance critical indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_task_project_id ON "Task"("projectId");
CREATE INDEX idx_task_status ON "Task"(status);
CREATE INDEX idx_task_priority ON "Task"(priority);
CREATE INDEX idx_project_member_user_id ON "ProjectMember"("userId");
CREATE INDEX idx_project_member_project_id ON "ProjectMember"("projectId");
CREATE INDEX idx_refresh_token_expires_at ON "RefreshToken"("expiresAt");
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate token

### Projects
- `POST /api/projects` - Create project (requires auth)
- `GET /api/projects` - List user's projects (paginated)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)
- `POST /api/projects/:projectId/members` - Add member (admin only)
- `DELETE /api/projects/:projectId/members/:memberId` - Remove member (admin only)

### Tasks
- `POST /api/projects/:projectId/tasks` - Create task
- `GET /api/projects/:projectId/tasks` - List project tasks (paginated, filterable)
- `GET /api/projects/:projectId/tasks/:taskId` - Get task details
- `PUT /api/projects/:projectId/tasks/:taskId` - Update task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete task (creator/admin only)

### Query Parameters
- Pagination: `page`, `limit`
- Sorting: `sortBy`, `sortOrder` (asc|desc)
- Filters: `status`, `priority`, `assignedToId`

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/collaboratex_db
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
```

### Installation

```bash
# Install dependencies
npm install

# Setup Prisma (generate client)
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build
```

## Performance Optimization Strategies

### 1. Database Query Optimization
- **Selective Field Fetching**: Use `select` to fetch only needed fields
- **Relationship Loading**: `include` only necessary relations
- **Query Batching**: Use Promise.all for parallel queries

### 2. Request/Response Optimization
- **Compression**: gzip compression enabled
- **JSON Limits**: Request body limited to 10MB
- **Pagination**: Prevents loading entire datasets

### 3. Caching (Future Enhancement)
- Redis integration for frequently accessed data
- Cache invalidation strategy for real-time data

### 4. Rate Limiting
- Prevents abuse and DDoS attacks
- Configurable per environment

## Monitoring & Observability

### Logging
- Application logs in `logs/` directory
- Errors separated in `error.log`
- Combined logs in `combined.log`

### Health Check
- `GET /api/health` - Returns server status

### Metrics (Future Enhancement)
- Response times per endpoint
- Error rates
- Database query performance

## Testing Strategy (Future Implementation)

```typescript
// Unit Tests: Services with mocked Prisma
// Integration Tests: Controllers with test database
// E2E Tests: Full API flow with real database
```

## Deployment Considerations

### Production Checklist
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure PostgreSQL with SSL
- [ ] Enable HTTPS with valid certificates
- [ ] Set NODE_ENV=production
- [ ] Configure CORS to specific domains
- [ ] Setup database backups
- [ ] Monitor application logs
- [ ] Configure rate limiting appropriately
- [ ] Use environment-specific .env files
- [ ] Setup load balancing for scaling

### Scaling Strategies
1. **Horizontal Scaling**: Run multiple instances behind load balancer
2. **Database Scaling**: Read replicas for read-heavy operations
3. **Caching Layer**: Redis for frequently accessed data
4. **Message Queue**: Background jobs with Bull/RabbitMQ

## Future Enhancements

1. **Activity Logging**: Track who changed what
2. **Notifications**: Real-time updates with WebSockets
3. **Task Comments**: Discussion thread per task
4. **File Attachments**: Upload project/task documents
5. **Export**: PDF/CSV reports
6. **Webhooks**: External integrations
7. **API Keys**: Service-to-service authentication
8. **Audit Trail**: Complete change history

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Reset database (development only)
npm run db:reset
```

### Token Issues
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
- Check token expiry times
- Verify Bearer token format in Authorization header

### CORS Issues
- Check CORS_ORIGIN matches frontend URL
- Include credentials in requests if needed

## API Response Format

All responses follow consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "pageInfo": { /* pagination details */ }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": { /* field-level errors */ }
}
```

## License

ISC
