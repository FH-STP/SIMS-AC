# Windows SQL Server Problem - Lösung

## Problem
Das SQL Server Container funktionierte nicht unter Windows aufgrund von:
1. Fehlender .env Datei
2. UID/GID Problemen (Linux-spezifisch)  
3. Volume-Mapping Problemen
4. Komplexe Initialisierungsskripte

## Lösung

### 1. Windows-optimierte Docker Compose Datei erstellt
- `docker-compose.windows.yml` für Windows-spezifische Konfiguration
- Verwendet Docker Volumes statt Bind Mounts für bessere Windows-Kompatibilität
- Separater Init-Container für SQL-Setup

### 2. Erstellte Dateien
- `.env` - Umgebungsvariablen
- `docker-compose.windows.yml` - Windows-optimierte Konfiguration
- Verbesserte `setup\windows\setup-and-run.bat`

## Verwendung

### Für Windows:
```powershell
# Verwende die Windows-Setup-Datei
.\setup_windows.bat

# Oder manuell mit Windows Compose:
docker compose -f docker-compose.windows.yml up -d
```

### Services nach dem Start:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:5000  
- **Grafana**: http://localhost:3000 (admin/admin)
- **Portainer**: https://localhost:9443
- **SQL Server**: localhost:1433 (sa/YourStrong!SQLPa55word)
- **MongoDB**: localhost:27017

### Logs überprüfen:
```powershell
# SQL Server Logs
docker logs sims-ac-sql-db-1

# Alle Container Status
docker ps

# Setup-Logs (einmalig)
docker logs sims-ac-sql-init-1
```

### Problembehebung:
1. Stelle sicher, dass Docker Desktop läuft
2. Verwende `docker compose -f docker-compose.windows.yml down -v` um alles zurückzusetzen
3. Bei Portproblemen: Überprüfe ob Ports bereits belegt sind

## Was funktioniert jetzt:
✅ SQL Server startet erfolgreich
✅ SIMS-Datenbank wird automatisch erstellt  
✅ Alle Services sind erreichbar
✅ Windows-kompatible Volume-Mounts
✅ Automatische Initialisierung