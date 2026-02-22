# ☁️ AWS EC2 Deployment Guide (IP-Based)

This guide explains how to host CollaborateX on an AWS EC2 instance using its Public IP address (no domain name required).

## 1. AWS EC2 Setup

### Launch Instance
1.  Go to the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2.  Click **Launch Instance**.
3.  **Name**: `CollaborateX-Server`
4.  **OS**: `Ubuntu 22.04 LTS`
5.  **Instance Type**: `t3.micro` (Free Tier eligible) or `t3.small` (recommended for better performance).
6.  **Key Pair**: Create a new one or select an existing `.pem` file.

### Configure Security Group (Firewall)
In the **Network settings** section, ensure these Inbound rules are added:

| Type | Port | Source | Purpose |
| :--- | :--- | :--- | :--- |
| SSH | 22 | My IP | For terminal access |
| HTTP | 80 | 0.0.0.0/0 | For the Web Frontend |
| Custom TCP | 5000 | 0.0.0.0/0 | For the Backend API |

---

## 2. Server Configuration

Connect to your server via SSH:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Install Docker
Run these commands to install Docker and Docker Compose:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```
*Note: Exit the SSH session and log back in for the group changes to apply.*

---

## 3. Deploying CollaborateX

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd collaboratex
```

### Step 2: Create .env File
Create a `.env` file in the root folder:
```bash
cat <<EOF > .env
PUBLIC_IP=YOUR_EC2_PUBLIC_IP_HERE
JWT_SECRET=your_secure_secret_key
JWT_REFRESH_SECRET=your_secure_refresh_key
POSTGRES_PASSWORD=your_database_password
EOF
```
**Important**: Replace `YOUR_EC2_PUBLIC_IP_HERE` with your actual EC2 Public IP address.

### Step 3: Start the Containers
```bash
docker-compose up -d --build
```

---

## 4. Accessing the Application

Once the build is complete:
- **Frontend (Web UI)**: `http://YOUR_EC2_PUBLIC_IP`
- **Backend API**: `http://YOUR_EC2_PUBLIC_IP:5000/api`

---

## 💡 Troubleshooting

### Containers not starting?
Check the logs:
```bash
docker-compose logs -f
```

### Page doesn't load?
- Double check your **Security Groups** in AWS to ensure ports 80 and 5000 are open.
- Ensure the `PUBLIC_IP` in your `.env` file exactly matches your EC2 Public IP. If you change it, you **must** rebuild: `docker-compose up -d --build`.

### Database Connection Error?
Ensure the `POSTGRES_PASSWORD` is consistent between what's defined in `.env` and what's used in the code (the updated `docker-compose.yml` handles this automatically via variables).
