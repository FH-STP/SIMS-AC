#!/bin/bash
echo "======================================================="
echo "         SIMS Project Setup Script for Linux"
echo "======================================================="

echo ""
echo "[+] Creating project directory structure..."
mkdir -p api
mkdir -p frontend
mkdir -p nginx
mkdir -p data/sql
mkdir -p data/mongo
mkdir -p data/grafana
mkdir -p data/portainer

echo ""
echo "[+] Creating placeholder Dockerfiles and advanced nginx.conf..."
echo "# Placeholder for API Dockerfile" > api/Dockerfile
echo "# Placeholder for Frontend Dockerfile" > frontend/Dockerfile
echo "# Placeholder for NGINX Dockerfile" > nginx/Dockerfile

cat <<EOL > nginx/nginx.conf
events {}
http {
    server {
        listen 80;
        location / { proxy_pass http://frontend; }
        location /api/ { proxy_pass http://api; }
        location /grafana/ { proxy_pass http://grafana:3000/; }
        location /portainer/ { proxy_pass http://portainer:9000/; }
        location /portainer/api/websocket/ {
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_pass http://portainer:9000/api/websocket/;
        }
    }
}
EOL

echo ""
echo "[+] Creating default .env file with placeholder credentials..."
cat <<EOL > .env
# Default Environment Variables - CHANGE FOR PRODUCTION
SQL_PASSWORD=YourStrong!SQLPa55word
MONGO_USER=simsadmin
MONGO_PASSWORD=YourStrong!MongoPa55word
EOL

echo ""
echo "[!] IMPORTANT: The .env file has been created with default passwords."

echo ""
echo "[+] Starting Docker containers in detached mode..."
sudo docker-compose up --build -d
sudo docker compose up --build -d

echo ""
echo "======================================================="
echo "     Setup Complete! The application is starting."
echo "     Access everything through http://localhost"
echo "     (See README.md for specific service URLs)"
echo "======================================================="
echo ""
