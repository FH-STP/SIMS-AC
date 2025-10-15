#!/bin/bash

# =======================================================
#      SIMS Project Setup Script for Linux/macOS
# =======================================================

echo ""
echo "======================================================="
echo "        SIMS Project Setup for Linux/macOS"
echo "======================================================="
echo ""

# --- SCRIPT START ---

# Step 1: Create all necessary directories for persistent data (bind mounts).
# postgres_storage, n8n_storage, ollama_storage, qdrant_storage
# are managed by Docker and do not need local folders created here.
echo "[+] Creating directories for persistent data..."
mkdir -p data/sql data/mongo data/grafana data/portainer shared
echo ""

# Step 2: Create .env file with all required credentials and settings.
echo "[+] Creating default .env file..."
cat > .env << EOL
# Docker Environment Configuration (auto-generated)

# Core SIMS Credentials
SQL_PASSWORD=YourStrong!SQLPa55word
MONGO_USER=simsadmin
MONGO_PASSWORD=YourStrong!MongoPa55word
GRAFANA_ADMIN_PASSWORD=admin123!

# n8n + Postgres Credentials
POSTGRES_USER=n8n
POSTGRES_PASSWORD=YourPostgresPassword!
POSTGRES_DB=n8n

# n8n Security Credentials (auto-generated)
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
N8N_USER_MANAGEMENT_JWT_SECRET=$(openssl rand -hex 32)

# Linux Permissions
UID=$(id -u)
GID=$(id -g)
EOL
echo "[!] IMPORTANT: The .env file has been created with default values."
echo ""

# Step 3: Docker Compose.
# This command uses the "cpu" profile as a safe default, which is crucial
# to avoid errors on systems without a compatible GPU.
echo "[+] Starting Docker containers in detached mode (CPU profile)..."
docker compose --profile cpu up --build -d

echo ""
echo "======================================================="
echo "   Setup Complete! The application is starting."
echo "   (See README.md for specific service URLs)"
echo "======================================================="
echo ""


