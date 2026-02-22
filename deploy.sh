#!/bin/bash

# CollaborateX EC2 Deployment Script

# 1. Ask for the public IP
read -p "Enter your EC2 Public IP address: " PUBLIC_IP

if [ -z "$PUBLIC_IP" ]; then
    echo "Error: Public IP is required."
    exit 1
fi

# 2. Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat <<EOF > .env
PUBLIC_IP=$PUBLIC_IP
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 12)
EOF
    echo ".env file created with generated secrets."
else
    echo ".env file already exists. Updating PUBLIC_IP..."
    sed -i "s/PUBLIC_IP=.*/PUBLIC_IP=$PUBLIC_IP/" .env
fi

# 3. Pull/Build and Start
echo "Starting Docker containers..."
docker-compose up -d --build

echo "------------------------------------------------"
echo "Deployment Complete!"
echo "Frontend: http://$PUBLIC_IP"
echo "Backend:  http://$PUBLIC_IP:5000/api"
echo "------------------------------------------------"
echo "Use 'docker-compose logs -f' to view logs."
