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

# Step 1: Create directories for persistent data in the current folder
echo "[+] Creating directories for persistent data..."
mkdir -p data/sql data/mongo data/grafana data/portainer
echo ""

# Step 2: Create the .env file in the current folder
echo "[+] Creating default .env file..."
cat > .env << EOL
# Docker Environment Configuration (auto-generated)
SQL_PASSWORD=YourStrong!SQLPa55word
MONGO_USER=simsadmin
MONGO_PASSWORD=YourStrong!MongoPa55word
UID=$(id -u)
GID=$(id -g)
EOL
echo "[!] IMPORTANT: The .env file has been created with default values."
echo ""

# Step 3: Start Docker Compose. It will automatically find the .env file.
echo "[+] Starting Docker containers in detached mode..."
docker compose up --build -d

echo ""
echo "======================================================="
echo "   Setup Complete! The application is starting."
echo "   (See README.md for specific service URLs)"
echo "======================================================="
echo ""
