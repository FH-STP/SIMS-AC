@echo off
echo =======================================================
echo          SIMS Project Setup Script for Windows
echo =======================================================

echo.
echo [+] Creating project directory structure...
mkdir api > nul 2>&1
mkdir frontend > nul 2>&1
mkdir nginx > nul 2>&1
mkdir data > nul 2>&1
mkdir data\sql > nul 2>&1
mkdir data\mongo > nul 2>&1
mkdir data\grafana > nul 2>&1
mkdir data\portainer > nul 2>&1

echo.
echo [+] Creating Dockerfiles and advanced nginx.conf...

(
    echo # Use the official Microsoft ASP.NET runtime as a base image.
    echo # This creates a lean Linux container with everything needed to run a compiled .NET app.
    echo FROM mcr.microsoft.com/dotnet/aspnet:8.0
    echo.
    echo # Set the working directory inside the container
    echo WORKDIR /app
    echo # This command is a standard Linux trick to keep the container running indefinitely.
    echo # It "tails" a special file that never ends, which prevents the container from
    echo # successfully completing its task and exiting.
    echo # This is crucial for keeping the container alive so NGINX and other services can connect to it.
    echo CMD ["tail", "-f", "/dev/null"]
) > api\Dockerfile

(
    echo # Use the lightweight official NGINX image as a base
    echo FROM nginx:alpine
    echo.
    echo # Create a simple placeholder HTML file to show it's working
    echo RUN echo ^'^<h1^>Frontend is Running! ^</h1^>^' ^> /usr/share/nginx/html/index.html
) > frontend\Dockerfile

(
    echo # Use the official NGINX image
    echo FROM nginx:alpine
    echo.
    echo # Remove the default NGINX configuration file
    echo RUN rm /etc/nginx/nginx.conf
    echo.
    echo # Copy your custom configuration file from the nginx folder into the container
    echo COPY nginx.conf /etc/nginx/nginx.conf
) > nginx\Dockerfile

(
    echo events { }
    echo http {
    echo     server {
    echo         listen 80;
    echo         location / {
    echo             proxy_pass http://frontend:80;
    echo         }
    echo         location /api/ {
    echo             proxy_pass http://api:8080/;
    echo         }
    echo         location /grafana/ {
    echo             proxy_pass http://grafana:3000/;
    echo         }
    echo         location /portainer/ {
    echo             proxy_pass http://portainer:9000/;
    echo         }
    echo     }
    echo }
) > nginx\nginx.conf

echo.
echo [+] Creating default .env file with placeholder credentials...
(
    echo # Default passwords for the databases
    echo SQL_PASSWORD=YourStrong!SQLPa55word
    echo MONGO_USER=simsadmin
    echo MONGO_PASSWORD=YourStrong!MongoPa55word
) > .env
echo [!] IMPORTANT: The .env file has been created with default passwords.

echo.
echo [+] Starting Docker containers in detached mode...
docker compose up --build -d

echo.
echo =======================================================
echo      Setup Complete! The application is starting.
echo      Access everything through http://localhost
echo      (See README.md for specific service URLs)
echo =======================================================
