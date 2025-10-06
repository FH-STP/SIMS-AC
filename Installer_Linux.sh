#!/bin/bash

echo ""
echo " Setting up SIMS Project Structure for Docker..."
echo "==================================================="
echo ""

# --- Create Directories ---
mkdir -p api frontend nginx
echo " Created directories: /api, /frontend, /nginx"
echo ""

# --- Create Placeholder Dockerfiles and NGINX Config ---
if [ ! -f "api/Dockerfile" ]; then
    echo "FROM scratch" > api/Dockerfile
    echo " Created placeholder: /api/Dockerfile"
fi
if [ ! -f "frontend/Dockerfile" ]; then
    echo "FROM scratch" > frontend/Dockerfile
    echo " Created placeholder: /frontend/Dockerfile"
fi
if [ ! -f "nginx/Dockerfile" ]; then
    echo -e "FROM nginx:alpine\nCOPY nginx.conf /etc/nginx/nginx.conf" > nginx/Dockerfile
    echo " Created placeholder: /nginx/Dockerfile"
fi
if [ ! -f "nginx/nginx.conf" ]; then
    cat <<EOF > nginx/nginx.conf
events {}
http {
    server {
        listen 80;
        location / {
            proxy_pass http://frontend:80;
        }
        location /api/ {
            proxy_pass http://api:80;
        }
    }
}
EOF
    echo " Created placeholder: /nginx/nginx.conf"
fi
echo ""

# --- Create .env file if it doesn't exist ---
if [ ! -f ".env" ]; then
    echo " Creating .env file with default credentials..."
    cat <<EOF > .env
# Passwords for the databases
SQL_PASSWORD=YourStrong!SQLPa55word
MONGO_USER=simsadmin
MONGO_PASSWORD=YourStrong!MongoPa55word
EOF
    echo " IMPORTANT: Review and change the default passwords in the .env file!"
else
    echo " .env file already exists, skipping creation."
fi
echo ""

# --- Run Docker Compose ---
echo "==================================================="
echo " Starting Docker containers in the background..."
echo ""
docker-compose up --build -d

echo ""
echo "==================================================="
echo " Setup complete! The application is starting."
echo " - NGINX is available at http://localhost"
echo " - Use \"docker-compose down\" to stop all containers."
echo ""
