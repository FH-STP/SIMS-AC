#!/bin/bash

# This file contains all the core logic for the Linux setup process.

function main_setup() {
    echo ""
    echo "======================================================="
    echo "        SIMS Project Setup Script for Linux"
    echo "======================================================="
    echo ""

    # Step 1: Copy source directories from ./setup to the root
    echo "[+] Copying source configurations to the root directory..."
    cp -r ./setup/api ./setup/frontend ./setup/nginx ./setup/mssql-init ./setup/mongo-init .

    # Step 2: Create directories for persistent data
    echo "[+] Creating directories for persistent data..."
    mkdir -p data/sql data/mongo data/grafana data/portainer

    echo ""

    # Step 3: Create the .env file with detected user permissions
    echo "[+] Creating .env file with detected user permissions..."
    cat > .env << EOL
# Docker Environment Configuration (auto-generated)
SQL_PASSWORD=YourStrong!SQLPa55word
MONGO_USER=simsadmin
MONGO_PASSWORD=YourStrong!MongoPa55word
UID=$(id -u)
GID=$(id -g)
EOL
    echo "[!] IMPORTANT: The .env file has been created with your user permissions."
    echo ""

    # Step 4: Start Docker Compose
    echo "[+] Starting Docker containers in detached mode..."
    docker compose up --build -d

    echo ""
    echo "======================================================="
    echo "   Setup Complete! The application is starting."
    echo "   (See README.md for specific service URLs)"
    echo "======================================================="
    echo ""
}
