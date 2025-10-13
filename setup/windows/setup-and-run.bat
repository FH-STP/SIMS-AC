@ECHO OFF

:: =======================================================
::       SIMS Project Setup Logic for Windows
:: =======================================================

ECHO.
ECHO =======================================================
ECHO        SIMS Project Setup for Windows
ECHO =======================================================
ECHO.

:: Check if Docker is running
ECHO [+] Checking Docker status...
docker info >NUL 2>&1
if %ERRORLEVEL% neq 0 (
    ECHO [!] ERROR: Docker is not running or not installed.
    ECHO [!] Please start Docker Desktop and try again.
    PAUSE
    EXIT /B 1
)
ECHO [✓] Docker is running.

:: Step 1: Stop any existing containers
ECHO [+] Stopping existing containers...
docker compose down >NUL 2>&1
ECHO.

:: Step 2: Create directories for persistent data in the root folder
ECHO [+] Creating directories for persistent data...
if not exist "data" MKDIR data
if not exist "data\sql" MKDIR data\sql
if not exist "data\mongo" MKDIR data\mongo  
if not exist "data\grafana" MKDIR data\grafana
if not exist "data\portainer" MKDIR data\portainer
ECHO [✓] Directories created.
ECHO.

:: Step 3: Create the .env file with default values
ECHO [+] Creating default .env file...
if not exist ".env" (
    (
        ECHO # Docker Environment Configuration ^(auto-generated^)
        ECHO SQL_PASSWORD=YourStrong!SQLPa55word
        ECHO MONGO_USER=simsadmin
        ECHO MONGO_PASSWORD=YourStrong!MongoPa55word
        ECHO UID=1000
        ECHO GID=1000
    ) > .env
    ECHO [✓] .env file created with default values.
) else (
    ECHO [!] .env file already exists, using existing configuration.
)
ECHO.

:: Step 4: Clean up old volumes and containers
ECHO [+] Cleaning up old Docker resources...
docker system prune -f >NUL 2>&1
ECHO.

:: Step 5: Use Windows-optimized compose file
ECHO [+] Using Windows-optimized Docker Compose configuration...
if exist "docker-compose.windows.yml" (
    ECHO [+] Starting Docker containers with Windows configuration...
    docker compose -f docker-compose.windows.yml up --build -d
) else (
    ECHO [!] Windows compose file not found, using default...
    docker compose up --build -d
)

:: Step 6: Wait for services to start
ECHO.
ECHO [+] Waiting for services to start...
timeout /t 10 /nobreak >NUL 2>&1

:: Step 7: Check container status
ECHO [+] Checking container status...
docker compose ps

ECHO.
ECHO =======================================================
ECHO    Setup Complete! The application is starting.
ECHO    
ECHO    Service URLs:
ECHO    - Frontend:  http://localhost:8080
ECHO    - API:       http://localhost:5321
ECHO    - Grafana:   http://localhost:3000 (admin/admin)
ECHO    - Portainer: https://localhost:9443
ECHO    - SQL Server: localhost:1433 (sa/YourStrong!SQLPa55word)
ECHO    - MongoDB:   localhost:27017
ECHO    
ECHO    If SQL Server issues persist, check logs with:
ECHO    docker logs sims-ac-sql-db-1
ECHO =======================================================
ECHO.


