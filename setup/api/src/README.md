# SIMS - Security Incident Management System API

## 📋 Projektübersicht

SIMS (Security Incident Management System) ist eine ASP.NET Core 8.0 Web API zur Verwaltung von Sicherheitsvorfällen. Das System bietet eine vollständige Backend-Lösung für die Erfassung, Verfolgung und Verwaltung von Sicherheitsvorfällen mit JWT-basierter Authentifizierung und rollenbasierter Autorisierung.

## 🏗️ Architektur

### Technologie-Stack
- **Framework**: ASP.NET Core 8.0
- **Sprache**: C# (.NET 8)
- **Authentifizierung**: JWT Bearer Token
- **Datenbank**: SQL Server (mit Dapper ORM)
- **API-Dokumentation**: Swagger/OpenAPI
- **Zusätzliche Features**: CORS-Unterstützung für Frontend-Integration

### Projektstruktur
```
src/
├── Controllers/           # API-Controller
│   ├── AccountController.cs    # Benutzerkonto-Verwaltung
│   ├── ConclusionController.cs # Abschluss-Verwaltung
│   ├── IncidentController.cs   # Vorfall-Verwaltung
│   └── UserController.cs       # Benutzer-Verwaltung
├── Models/               # Datenmodelle
│   ├── Conclusion.cs          # Abschluss-Modell
│   ├── Incident.cs            # Vorfall-Modell
│   ├── LoginRequest.cs        # Login-Anfrage-Modell
│   ├── LoginResponse.cs       # Login-Antwort-Modell
│   ├── PasswordChange.cs      # Passwort-Änderungs-Modell
│   └── User.cs               # Benutzer-Modell
├── Services/             # Geschäftslogik
│   └── JwtService.cs          # JWT-Token-Service
├── Misc/                 # Hilfsfunktionen
│   ├── KonstantenSIMS.cs      # Systemkonstanten
│   └── Logging.cs             # Logging-Utilities
├── Properties/
│   └── launchSettings.json    # Entwicklungseinstellungen
├── appsettings.json      # Anwendungskonfiguration
├── appsettings.Development.json # Entwicklungskonfiguration
├── Program.cs            # Anwendungseinstiegspunkt
└── sims.csproj          # Projektdatei
```

## 🚀 Installation und Setup

### Voraussetzungen
- .NET 8.0 SDK
- SQL Server (LocalDB oder vollständige Installation)
- Visual Studio 2022 oder VS Code mit C#-Extension

### Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd SIMS-AC/setup/api/src
   ```

2. **NuGet-Pakete installieren**
   ```bash
   dotnet restore
   ```

3. **Datenbank konfigurieren**
   - Verbindungsstring in `appsettings.json` anpassen
   - Datenbank-Schema erstellen (siehe Datenbankstruktur)

4. **JWT-Konfiguration**
   - JWT-Schlüssel und Konfiguration in `appsettings.json` überprüfen
   - Bei Bedarf neuen JWT-Schlüssel generieren

## ⚙️ Konfiguration

### appsettings.json
```json
{
  "JwtConfig": {
    "Issuer": "http://localhost:5231",
    "Audience": "http://localhost:5231",
    "Key": "[Ihr-JWT-Schlüssel]",
    "TokenValidityMins": 30
  },
  "ConnectionStrings": {
    "DefaultConnection": "[Ihre-Datenbankverbindung]"
  }
}
```

### Umgebungsvariablen
- `ASPNETCORE_ENVIRONMENT`: Development/Production
- Datenbank-Verbindungsstrings können über Umgebungsvariablen überschrieben werden

## 🏃‍♂️ Anwendung starten

### Entwicklungsumgebung
```bash
dotnet run
```

Die API ist dann verfügbar unter:
- HTTP: `http://localhost:5231`
- HTTPS: `https://localhost:7279`
- Swagger UI: `http://localhost:5231/swagger`

### Produktionsumgebung
```bash
dotnet publish -c Release
dotnet run --environment Production
```

## 📚 API-Endpunkte

### Authentifizierung
- `POST /Account/login` - Benutzeranmeldung
- `POST /Account/logout` - Benutzerabmeldung
- `POST /Account/change-password` - Passwort ändern

### Benutzerverwaltung
- `GET /User` - Alle Benutzer abrufen
- `GET /User/{id}` - Benutzer nach ID abrufen
- `POST /User` - Neuen Benutzer erstellen
- `PUT /User/{id}` - Benutzer aktualisieren
- `DELETE /User/{id}` - Benutzer löschen

### Vorfallverwaltung
- `GET /Incident` - Alle Vorfälle abrufen
- `GET /Incident/{id}` - Vorfall nach ID abrufen
- `POST /Incident` - Neuen Vorfall erstellen
- `PUT /Incident/{id}` - Vorfall aktualisieren
- `DELETE /Incident/{id}` - Vorfall löschen

### Abschlussverwaltung
- `GET /Conclusion` - Alle Abschlüsse abrufen
- `GET /Conclusion/{id}` - Abschluss nach ID abrufen
- `POST /Conclusion` - Neuen Abschluss erstellen

## 🔐 Sicherheit

### Authentifizierung
- JWT Bearer Token basierte Authentifizierung
- Token-Gültigkeit: 30 Minuten (konfigurierbar)
- Sichere Token-Validierung mit symmetrischem Schlüssel

### Autorisierung
- Rollenbasierte Zugriffskontrolle
- **Admin Policy**: Vollzugriff auf alle Ressourcen
- **User Policy**: Eingeschränkter Zugriff basierend auf Benutzerrolle

### CORS
- Konfiguriert für Frontend-Integration
- Erlaubt alle Origins, Methods und Headers (Entwicklung)
- **Warnung**: CORS-Richtlinien für Produktion anpassen!

## 📦 Dependencies

### Hauptabhängigkeiten
- `Microsoft.AspNetCore.App` (8.0) - ASP.NET Core Framework
- `Microsoft.AspNetCore.Authentication.JwtBearer` (8.0.20) - JWT-Authentifizierung
- `Microsoft.Data.SqlClient` (6.1.2) - SQL Server-Verbindung
- `Dapper` (2.1.66) - Mikro-ORM für Datenbankzugriff
- `MongoDB.Driver` (3.5.0) - MongoDB-Support
- `Swashbuckle.AspNetCore` (6.6.2) - Swagger/OpenAPI
- `NSec.Cryptography` (25.4.0) - Kryptographie-Funktionen

## 🗄️ Datenbankstruktur

### Tabellen (erwartet)
- **Incidents**: Haupttabelle für Sicherheitsvorfälle
  - ID, OwnerID, CreatorID, Title, API_Text, Notes_Text, Severity, ConclusionID, Status, Creation_Time, IsDisabled
- **Users**: Benutzerverwaltung
- **Conclusions**: Vorfallabschlüsse

## 🧪 Tests

### Unit Tests ausführen
```bash
dotnet test
```

### API-Tests
- Verwenden Sie die bereitgestellte `sims.http`-Datei für manuelle API-Tests
- Swagger UI für interaktive API-Erkundung: `/swagger`

## 📝 Entwicklung

### Code-Stil
- Befolgt C# Coding Conventions
- Nullable Reference Types aktiviert
- Implicit Usings aktiviert

### Debugging
- Detaillierte Logging-Konfiguration in `appsettings.json`
- Entwicklungsumgebung zeigt detaillierte Fehlermeldungen
- Swagger UI für API-Debugging verfügbar

### Erweiterungen
1. Neue Controller im `Controllers/`-Ordner hinzufügen
2. Entsprechende Modelle in `Models/` erstellen
3. Services für Geschäftslogik in `Services/` implementieren
4. Datenbankzugriff über Dapper in den Controllern

## 🚀 Deployment

### Docker (Optional)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY bin/Release/net8.0/publish/ ./
ENTRYPOINT ["dotnet", "sims.dll"]
```

### IIS-Deployment
1. Projekt mit `dotnet publish -c Release` veröffentlichen
2. Ausgabeordner auf IIS-Server kopieren
3. IIS-Anwendung konfigurieren
4. Verbindungsstrings für Produktionsumgebung anpassen

## 🤝 Beitragen

1. Fork des Repositories erstellen
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📄 Lizenz

Dieses Projekt ist unter der [MIT License](LICENSE) lizenziert.

## 📞 Support

Bei Fragen oder Problemen:
- Issue im Repository erstellen
- Entwicklungsteam kontaktieren
- Dokumentation in `/swagger` konsultieren

## 🔄 Changelog

### Version 1.0.0
- Initiale API-Implementation
- JWT-Authentifizierung
- CRUD-Operationen für Incidents, Users, Conclusions
- Swagger-Dokumentation
- CORS-Unterstützung

---

**Letztes Update**: Oktober 2025