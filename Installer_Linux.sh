#!/bin/bash
echo "======================================================="
echo "         SIMS Project Setup Script for Linux"
echo "======================================================="

echo ""
echo "[+] Creating project directory structure..."
mkdir -p api frontend nginx data/sql data/mongo data/grafana data/portainer

echo ""
echo "[+] Creating Dockerfiles and advanced nginx.conf..."

cat <<EOF > api/Dockerfile
# Use the official Microsoft ASP.NET runtime as a base image.
# This creates a lean Linux container with everything needed to run a compiled .NET app.
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Set the working directory inside the container
WORKDIR /app


# This command is a standard Linux trick to keep the container running indefinitely.
# It "tails" a special file that never ends, which prevents the container from
# successfully completing its task and exiting.
# This is crucial for keeping the container alive so NGINX and other services can connect to it.
CMD ["tail", "-f", "/dev/null"]
EOF

cat <<EOF > frontend/Dockerfile
# Use the lightweight official NGINX image as a base
FROM nginx:alpine

# Create a simple placeholder HTML file to show it's working
RUN echo '<h1>Frontend is Running!</h1>' > /usr/share/nginx/html/index.html
EOF

cat <<EOF > nginx/Dockerfile
# Use the official NGINX image
FROM nginx:alpine

# Remove the default NGINX configuration file
RUN rm /etc/nginx/nginx.conf

# Copy your custom configuration file from the nginx folder into the container
COPY nginx.conf /etc/nginx/nginx.conf
EOF

cat <<EOF > nginx/nginx.conf
events { }
http {
    server {
        listen 80;
        location / {
            proxy_pass http://frontend:80;
        }
        location /api/ {
            proxy_pass http://api:8080/;
        }
        location /grafana/ {
            proxy_pass http://grafana:3000/;
        }
        location /portainer/ {
            proxy_pass http://portainer:9000/;
        }
    }
}
EOF

echo ""
echo "[+] Creating default .env file with placeholder credentials..."
cat <<EOF > .env
# Default passwords for the databases
SQL_PASSWORD=YourStrong!SQLPa55word
MONGO_USER=simsadmin
MONGO_PASSWORD=YourStrong!MongoPa55word
EOF
echo "[!] IMPORTANT: The .env file has been created with default passwords."

echo ""
echo "[+] Starting Docker containers in detached mode..."
docker compose up --build -d

echo ""
echo "======================================================="
echo "      Setup Complete! The application is starting."
echo "      Access everything through http://localhost"
echo "      (See README.md for specific service URLs)"
echo "======================================================="
