# 🚀 CollaborateX: Enterprise-Grade Task Collaboration

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Docker Support](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![AWS Support](https://img.shields.io/badge/AWS-Enabled-orange.svg)](https://aws.amazon.com/)

**CollaborateX** is a high-performance, full-stack task management and collaboration platform. Engineered for stability and scalability, it leverages a modern micro-service-ready architecture to deliver a seamless experience for teams of all sizes.

---

## 🏛️ System Architecture

CollaborateX is designed with a detached Frontend/Backend architecture, ensuring independent scalability and security.

- **Frontend**: A high-fidelity React 19 SPA served via Nginx, optimized for performance and aesthetic excellence.
- **Backend**: A robust RESTful API built with Express.js 5 and TypeScript, featuring a multi-stage production environment.
- **Data Layer**: PostgreSQL 16 managed by Prisma ORM for type-safe database interactions and automated migrations.
- **Infrastructure**: Containerized with Docker for "build once, run anywhere" reliability.

---

## ✨ Key Capabilities

### 🛡️ Security & Access Control
- **Advanced Auth**: JWT-based authentication with cryptographically secure refresh token rotation.
- **RBAC**: Robust Role-Based Access Control (Admin/User) integrated deeply into project and task layers.
- **Data Protection**: Industry-standard Bcrypt hashing and SQL injection prevention via Prisma.
- **Rate Limiting**: Integrated protection against automated attacks and brute-force attempts.

### 👥 Team Operations
- **Project Dynamics**: Full lifecycle management for projects including creation, updates, and secure archival.
- **Member Ecosystem**: Sophisticated member management allowing admins to add, remove, and promote team members.
- **Collaborative Tasks**: Granular task control with status tracking (Open → Archived), priority levels, and member assignments.

### 🎨 Premium User Experience
- **Rich Aesthetics**: Responsive, glassmorphic UI built with Tailwind CSS v4.
- **Real-time Context**: Dynamic updates, loading states, and error handling for a fluid workflow.

---

## �️ Technical Stack

| Component | Technology |
| :--- | :--- |
| **Language** | TypeScript (Strict Mode) |
| **Frontend** | React 19, Vite 7, Redux Toolkit |
| **Styling** | Tailwind CSS v4, Headless UI |
| **Backend** | Express.js 5, Node.js 20 |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Validation** | Zod (End-to-end type safety) |
| **DevOps** | Docker, Nginx, GitHub Actions (Ready) |

---

## 🚀 Rapid Deployment

CollaborateX is optimized for containerized environments. No local Node.js installation is required for deployment.

### Development / Local Run
```bash
# Clone the repository
git clone https://github.com/your-repo/collaboratex.git
cd collaboratex

# Start the environment
docker-compose up -d
```
The application will be accessible at `http://localhost`.

### AWS EC2 Deployment (Public IP)
Perfect for hosting without a domain name.
1.  **Prepare Server**: Launch an Ubuntu 22.04 instance on EC2.
2.  **Run Setup**: Use our streamlined [AWS Guide](./AWS_DEPLOYMENT.md).
3.  **Automate**: Run `./deploy.sh` on your server for zero-config startup.

---

## ⚙️ Configuration Management

The system uses a strictly typed environment configuration.

| Variable | Requirement | Description |
| :--- | :--- | :--- |
| `PUBLIC_IP` | Required (Prod) | Your EC2/Server Public IP for CORS validation. |
| `POSTGRES_PASSWORD` | Required | Master password for the database layer. |
| `JWT_SECRET` | Required | 256-bit secret for Auth Token generation. |

---

## 📂 Project Organization

```text
collaboratex/
├── backend/            # Express API with Prisma & Multi-stage Docker
├── frontend/           # React SPA with Nginx & Production Optimization
├── .dockerignore       # Global exclusion rules for optimized builds
├── docker-compose.yml  # Production-grade orchestration
├── deploy.sh           # Automated deployment script
├── DOCKER.md           # Operational documentation
└── AWS_DEPLOYMENT.md   # Cloud-specific setup guide
```

---

## 🤝 Contribution & Support

We follow strict coding standards and architectural patterns. Please review the [CONTRIBUTING.md](#) (Coming Soon) before submitting Pull Requests.

- **Issue Tracking**: Report bugs via GitHub Issues.
- **Security**: Please report vulnerabilities privately.

---

**Developed with ❤️ by the CollaborateX Team.**
