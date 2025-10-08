@ECHO OFF

:: =======================================================
::       SIMS Project Setup Logic for Windows
:: =======================================================

ECHO.
ECHO =======================================================
ECHO        SIMS Project Setup for Windows
ECHO =======================================================
ECHO.

:: Step 1: Copy source directories from .\setup to the root
ECHO [+] Copying source configurations to the root directory...
XCOPY setup\api api\ /E /I /Y > NUL
XCOPY setup\frontend frontend\ /E /I /Y > NUL
XCOPY setup\nginx nginx\ /E /I /Y > NUL
XCOPY setup\mssql-init mssql-init\ /E /I /Y > NUL
XCOPY setup\mongo-init mongo-init\ /E /I /Y > NUL

:: Step 2: Create directories for persistent data
ECHO [+] Creating directories for persistent data...
MKDIR data\sql > NUL 2>&1
MKDIR data\mongo > NUL 2>&1
MKDIR data\grafana > NUL 2>&1
MKDIR data\portainer > NUL 2>&1
ECHO.

:: Step 3: Create the .env file with default values
ECHO [+] Creating default .env file...
(
    ECHO # Docker Environment Configuration (auto-generated)
    ECHO SQL_PASSWORD=YourStrong!SQLPa55word
    ECHO MONGO_USER=simsadmin
    ECHO MONGO_PASSWORD=YourStrong!MongoPa55word
    ECHO UID=1000
    ECHO GID=1000
) > .env
ECHO [!] IMPORTANT: The .env file has been created with default values.
ECHO.

:: Step 4: Start Docker Compose
ECHO [+] Starting Docker containers in detached mode...
docker compose up --build -d

ECHO.
ECHO =======================================================
ECHO    Setup Complete! The application is starting.
ECHO    (See README.md for specific service URLs)
ECHO =======================================================
ECHO.
