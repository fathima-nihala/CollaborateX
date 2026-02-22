# Task Collaboration System - Deployment Guide

## Overview

This document outlines the deployment strategy for the Task Collaboration System, including prerequisites, deployment options, and recommendations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer / Reverse Proxy             │
│                     (Nginx / HAProxy / CloudFlare)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
       ┌────────▼────────┐      ┌────────▼────────┐
       │  Backend API    │      │    Frontend     │
       │  (Node.js)      │      │   (React/Vite)  │
       │  Containers     │      │   Containers    │
       │  (3-5 instances)│      │   (2-3 instances)
       └────────┬────────┘      └────────┬────────┘
                │                         │
       ┌────────▼────────────────────────▼─────────┐
       │  PostgreSQL Database                      │
       │  (Managed or Self-Hosted with Replication)│
       └────────────────────────────────────────────┘
```

## Prerequisites

All deployment options require:

### System Requirements
- **CPU**: Minimum 2 vCPU
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 20GB SSD (50GB recommended)
- **Network**: Stable 100Mbps connection minimum

### Required Services
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+) - for local/self-hosted
- **PostgreSQL 12+** - can be managed or dockerized
- **Node.js 20+** - only for non-containerized deployments

### Environment Configuration
- Valid JWT secrets (32+ characters each)
- SSL/TLS certificates for HTTPS
- Domain name registered and configured
- Email service (for future notifications)

## Deployment Options Analysis

### Option 1: Docker Compose (Local/Development)
**Cost**: Free (Self-hosted hardware)  
**Difficulty**: Beginner-friendly  
**Scalability**: Limited to single machine  
**Maintenance**: Moderate

#### Prerequisites:
- Docker installed and running
- Docker Compose installed
- 4GB+ RAM available
- Port 5000, 5173, 5432 available

#### Steps:

1. **Clone and setup:**
```bash
git clone <repo>
cd collaboratex
```

2. **Configure environment:**
```bash
# Update JWT secrets and database credentials
nano docker-compose.yml
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **Initialize database:**
```bash
docker-compose exec backend npm run db:migrate
```

5. **Verify deployment:**
```bash
# Check service health
curl http://localhost:5000/api/health
open http://localhost:5173
```

#### Pros:
- Fast deployment
- Easy local testing
- No cloud costs
- Full control

#### Cons:
- Single point of failure
- Limited scalability
- Manual backups required
- No built-in redundancy

---

### Option 2: AWS ECS/Fargate (Recommended for Cloud)
**Cost**: $100-500/month depending on load  
**Difficulty**: Intermediate  
**Scalability**: Excellent, auto-scaling  
**Maintenance**: Low

#### Prerequisites:
- AWS account with appropriate IAM permissions
- Docker images pushed to ECR
- RDS PostgreSQL instance
- AWS CLI configured

#### Architecture:
```
Cloudfront CDN → ALB → ECS Fargate Tasks → RDS PostgreSQL
            ↓
        S3 (Frontend Static Assets)
```

#### Steps:

1. **Create ECR repositories:**
```bash
# Backend
aws ecr create-repository --repository-name collaboratex-backend

# Frontend
aws ecr create-repository --repository-name collaboratex-frontend
```

2. **Push Docker images:**
```bash
# Build and push backend
docker build -t collaboratex-backend:1.0 ./backend
aws ecr get-login-password | docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.<region>.amazonaws.com
docker tag collaboratex-backend:1.0 <account-id>.dkr.ecr.<region>.amazonaws.com/collaboratex-backend:1.0
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/collaboratex-backend:1.0
```

3. **Create RDS PostgreSQL:**
```bash
aws rds create-db-instance \
  --db-instance-identifier collaboratex-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 100 \
  --master-username admin \
  --master-user-password <strong-password> \
  --db-name collaboratex_db \
  --backup-retention-period 30 \
  --multi-az
```

4. **Create ECS Cluster:**
```bash
aws ecs create-cluster --cluster-name collaboratex-cluster
```

5. **Create Task Definitions:**
```json
{
  "family": "collaboratex-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account>.dkr.ecr.<region>.amazonaws.com/collaboratex-backend:1.0",
      "portMappings": [{
        "containerPort": 5000,
        "hostPort": 5000,
        "protocol": "tcp"
      }],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://..."},
        {"name": "JWT_SECRET", "value": "${JWT_SECRET}"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/collaboratex-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

6. **Create ALB (Application Load Balancer):**
```bash
aws elbv2 create-load-balancer \
  --name collaboratex-alb \
  --subnets subnet-1 subnet-2 \
  --security-groups sg-xxxxx \
  --scheme internet-facing
```

7. **Deploy ECS Service:**
```bash
aws ecs create-service \
  --cluster collaboratex-cluster \
  --service-name collaboratex-backend \
  --task-definition collaboratex-backend \
  --desired-count 3 \
  --launch-type FARGATE \
  --load-balancers targetGroupArn=arn:...,containerName=backend,containerPort=5000
```

#### Pros:
- Auto-scaling capabilities
- Managed security and updates
- Global CDN support
- Built-in monitoring (CloudWatch)
- High availability with multi-AZ
- Pay only for what you use

#### Cons:
- Steeper learning curve
- AWS vendor lock-in
- Requires IAM expertise
- Costs can vary unpredictably

---

### Option 3: DigitalOcean App Platform
**Cost**: $12-48/month (App Platform) + $15/month (Managed Database)  
**Difficulty**: Beginner-friendly  
**Scalability**: Good (scaling tiers)  
**Maintenance**: Very low

#### Prerequisites:
- DigitalOcean account
- Docker images built locally

#### Steps:

1. **Deploy via DigitalOcean CLI:**
```bash
doctl apps create --spec app.yaml
```

2. **app.yaml configuration:**
```yaml
name: collaboratex
services:
  - name: backend
    github:
      branch: main
      repo: your-org/collaboratex
      build_command: npm run build
    http_port: 5000
    source_dir: backend
    envs:
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${db.connection_string}
    
  - name: frontend
    github:
      branch: main
      repo: your-org/collaboratex
      build_command: npm run build
    source_dir: frontend
    http_port: 5173
    routes:
      - path: /

databases:
  - engine: PG
    name: db
    version: "15"
```

3. **Push to GitHub:**
```bash
git push origin main
```

4. **Monitor deployment:**
```bash
doctl apps list
doctl apps get-logs <app-id>
```

#### Pros:
- Simplest deployment process
- Competitive pricing
- Automatic GitHub deployment
- Managed databases
- Excellent documentation

#### Cons:
- Less customization than AWS
- Smaller ecosystem
- Limited regional options

---

### Option 4: Kubernetes (Advanced/Production)
**Cost**: $100-500+/month  
**Difficulty**: Advanced  
**Scalability**: Unlimited  
**Maintenance**: High

#### Platforms:
- **AWS EKS**: $0.10/hour per cluster + compute
- **DigitalOcean Kubernetes**: $10-120/month
- **Google GKE**: Similar to AWS
- **Self-hosted**: On-premise or VPS

#### Prerequisites:
- Kubernetes cluster running
- kubectl configured
- Helm (package manager)
- Container registry access

#### Architecture:
```yaml
Ingress (Nginx) 
  ├── Backend Service (3+ replicas)
  ├── Frontend Service (2+ replicas)
  └── Database (StatefulSet or Managed RDS)
```

#### Example Kubernetes manifests:

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: collaboratex-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/collaboratex-backend:1.0
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP

---
apiVersion: autoscaling.k8s.io/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: collaboratex-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Deploy with:
```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
```

#### Pros:
- Industry standard for production
- Maximum scalability
- Multi-cloud capable
- Complex orchestration
- Community support

#### Cons:
- Complex learning curve
- Requires DevOps expertise
- Higher operational overhead
- Overkill for small projects

---

## Recommended Deployment Strategy

### Small Projects (< 100 concurrent users):
**→ Docker Compose (Local) or DigitalOcean App Platform**

| Criteria | Docker Compose | DigitalOcean |
|----------|---|---|
| Cost | Free (existing hardware) | $27-63/month |
| Setup Time | 30 minutes | 15 minutes |
| Scalability | Manual | Automatic (limited) |
| Maintenance | Manual | Very Low |
| **Recommendation** | Dev/Testing | **Production** |

### Medium Projects (100-1000 concurrent users):
**→ AWS ECS/Fargate or DigitalOcean Kubernetes**

| Criteria | AWS ECS | DO Kubernetes |
|----------|---|---|
| Cost | $150-350/month | $50-200/month |
| Setup Time | 1-2 hours | 45 minutes |
| Scalability | Auto-scaling | Auto-scaling |
| Maintenance | Low | Medium |
| **Recommendation** | High-scale | **Balanced** |

### Large Projects (1000+ concurrent users):
**→ Kubernetes (AWS EKS or Google GKE)**

| Criteria | AWS EKS | Google GKE |
|----------|---|---|
| Cost | $200-1000+/month | $200-1000+/month |
| Setup Time | 2-3 hours | 2-3 hours |
| Scalability | Unlimited | Unlimited |
| Maintenance | High | High |
| **Recommendation** | **AWS Ecosystem** | Google-heavy |

## **⭐ RECOMMENDED CHOICE: DigitalOcean App Platform** ⭐

### Why?
1. **Price**: $27-63/month (10x cheaper than AWS for similar workload)
2. **Ease**: GitHub-integrated deployment, zero DevOps needed
3. **Managed**: Database scaling, backups, SSL all automatic
4. **Scaling**: Can handle 100-10,000 users without issues
5. **Learning**: Perfect for teams learning deployment

### One-Click Deployment:
1. Push code to GitHub
2. Connect in DigitalOcean dashboard
3. Done! Auto-deploys on every push

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] Environment variables configured (.env files)
- [ ] Database backups configured and tested
- [ ] SSL/TLS certificates obtained and configured
- [ ] CORS properly configured for frontend domain
- [ ] Rate limiting tuned for expected load
- [ ] Logging configured and monitored
- [ ] Error tracking setup (Sentry/Rollbar - optional)
- [ ] Performance monitoring enabled (APM - optional)
- [ ] Security headers configured (Helmet.js active)
- [ ] HTTPS redirect enforced
- [ ] Health check endpoints verified
- [ ] Database migrations tested in production environment
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Incident response plan ready

## Monitoring & Observability

### Essential Metrics to Monitor
- **Application**:
  - API response time (p50, p95, p99)
  - Error rate (4xx, 5xx)
  - Request throughput (requests/sec)
  
- **Infrastructure**:
  - CPU utilization
  - Memory usage
  - Disk I/O
  - Network I/O

- **Database**:
  - Query performance
  - Connection pool status
  - Replication lag (if applicable)

### Recommended Tools
- **DigitalOcean**: Built-in monitoring
- **AWS**: CloudWatch + X-Ray
- **Sentry**: Error tracking
- **DataDog**: Full observability platform
- **New Relic**: APM and monitoring

## Database Backup Strategy

### Backup Frequency
- **Hourly** snapshots (kept for 7 days)
- **Daily** backups (kept for 30 days)
- **Weekly** backups (kept for 3 months)
- **Monthly** backups (kept for 1 year)

### Backup Locations
- Primary: Managed by provider (automated)
- Secondary: Cross-region replication
- Tertiary: S3/Cloud Storage (encrypted)

### Recovery Testing
- Test restore from backups monthly
- Document RTO (Recovery Time Objective): 1-4 hours
- Document RPO (Recovery Point Objective): < 1 hour

## Security Hardening

### Network Security
- [ ] Enable VPC/VPN
- [ ] Security groups restrict inbound to 80, 443, 5432 (internal only)
- [ ] DDoS protection enabled
- [ ] WAF (Web Application Firewall) configured

### Application Security
- [ ] HTTPS enforced (HSTS enabled)
- [ ] CORS whitelist configured
- [ ] Rate limiting active
- [ ] Input validation Zod schemas enforced
- [ ] SQL injection prevention (Prisma ORM)

### Database Security
- [ ] Encryption at rest enabled
- [ ] Encryption in transit (SSL)
- [ ] Strong password policies
- [ ] Access limited to app servers only
- [ ] Audit logging enabled

### Secrets Management
- [ ] No secrets in code or git
- [ ] Use environment variables or secrets manager
- [ ] Rotate secrets every 90 days
- [ ] Log access to secrets
- [ ] Use separate secrets per environment

## Scaling Strategy

### Horizontal Scaling (Add more servers)
1. **Stage 1** (10K users): 2 backend, 2 frontend, 1 DB
2. **Stage 2** (50K users): 4 backend, 3 frontend, 2 DB replicas
3. **Stage 3** (100K+ users): 8-10 backend, 4-5 frontend, Primary + 2 replicas

### Vertical Scaling (Bigger servers)
- Start with small instances
- Monitor CPU/memory usage
- Scale up when consistent > 70% utilization

### Caching Strategy (Reduce database load)
- Redis for session storage
- Redis for frequently accessed data
- CDN for static assets
- HTTP caching headers

### Database Optimization
- Add read replicas for read-heavy operations
- Implement connection pooling
- Optimize frequent queries
- Archive old data
- Consider sharding if > 10M records per table

## Cost Optimization

### Development Environment
- Use free tier services where available
- Scale down during off-hours
- Use spot instances where applicable

### Production Environment
- Reserve instances for baseline load
- Use spot instances for variable load
- Right-size instances (don't oversell)
- Monitor and adjust monthly

### Example Monthly Costs (Medium Project)
| Component | Cost |
|-----------|------|
| DigitalOcean App (2 containers) | $24 |
| Database (Managed PostgreSQL) | $15 |
| DNS (Route53 or similar) | $1 |
| SSL Certificate | Free |
| **Total** | **$40/month** |

## Incident Response Plan

### Critical Issues
1. **Database Down**
   - Failover to replica (automatic on managed solutions)
   - Expected downtime: < 5 minutes
   - Restore from backup if needed

2. **API Service Down**
   - Auto-restart via Healthcheck
   - Manual restart if needed
   - Expected downtime: < 2 minutes

3. **Data Loss**
   - Restore from latest backup
   - Verify data integrity
   - Run tests

4. **Security Breach**
   - Rotate all secrets immediately
   - Review audit logs
   - Notify users if data exposed
   - Deploy security patches

## Rollback Procedure

```bash
# Rollback to previous version
docker-compose down
git checkout previous-tag
docker-compose up -d

# Or with Kubernetes
kubectl rollout history deployment/collaboratex-backend
kubectl rollout undo deployment/collaboratex-backend
```

## Summary Table

| Aspect | Docker Compose | DigitalOcean | AWS | Kubernetes |
|--------|---|---|---|---|
| Cost | Free | $$ | $$$ | $$$$ |
| Setup | 30 min | 15 min | 2 hrs | 3+ hrs |
| Scalability | Poor | Good | Excellent | Unlimited |
| DevOps | Minimal | Very Low | Medium | High |
| Best For | Dev/Test | **Small/Medium** | Large Scale | Enterprise |

---

**Final Recommendation: Start with DigitalOcean App Platform, then migrate to Kubernetes if needed.**

This provides the perfect balance of ease, cost, and scalability for most projects.
