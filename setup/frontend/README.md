# SIMS-AC Frontend

Eine moderne Web-Anwendung für das Security Incident Management System (SIMS-AC).

## Features

- **Benutzer-Authentifizierung**: Sicherer Login mit Benutzername und Passwort
- **Dashboard**: Übersichtliche Benutzeroberfläche mit Sidebar-Navigation
- **Grafana Integration**: Eingebettetes Grafana Dashboard für Datenvisualisierung
- **Incident Management**: Platzhalter für zukünftiges Incident Management System
- **Responsive Design**: Optimiert für Desktop und mobile Geräte

## Demo-Anmeldedaten

Für Testzwecke können Sie sich mit folgenden Anmeldedaten einloggen:

| Benutzername | Passwort | Rolle |
|--------------|----------|-------|
| `admin`      | `admin`  | Administrator |
| `user`       | `user`   | Benutzer |

## Struktur

```
frontend/
├── index.html          # Haupt-HTML-Datei
├── styles.css          # CSS-Styles
├── script.js           # JavaScript-Logik
├── Dockerfile          # Docker-Container-Konfiguration
└── README.md           # Diese Datei
```

## Funktionalitäten

### Login-System
- Benutzerauthentifizierung mit Formular-Validation
- Session-Management (bleibt bei Seitenaktualisierung eingeloggt)
- Sichere Abmeldung

### Dashboard
- **Grafana Tab**: Eingebettetes Grafana Dashboard (verfügbar unter `/grafana/`)
- **Incidents Tab**: Platzhalter für zukünftiges Incident Management
- **Benutzer-Menü**: Einstellungen und Profil-Optionen (in Entwicklung)

### Navigation
- Sidebar-Navigation am linken Rand
- Tool-Leiste oben (in Entwicklung)
- Benutzer-Dropdown rechts oben

## Technische Details

### Frontend-Technologien
- **HTML5**: Semantische Struktur
- **CSS3**: Moderne Styling mit Flexbox und Grid
- **Vanilla JavaScript**: Keine externen Frameworks
- **Font Awesome**: Icons
- **Responsive Design**: Mobile-First Ansatz

### Docker Integration
Die Anwendung läuft in einem NGINX-Container und ist über den NGINX Reverse Proxy erreichbar:

```yaml
# docker-compose.yml (Auszug)
frontend:
  build: ./frontend
  networks:
    - sims-net
```

### Grafana Integration
Grafana wird über ein iframe eingebettet und ist über den NGINX Reverse Proxy unter `/grafana/` erreichbar.

## Entwicklung

### Lokale Entwicklung
Für die lokale Entwicklung können Sie die Dateien direkt in einem Browser öffnen oder einen lokalen Webserver verwenden.

### Docker-Entwicklung
```bash
# Container bauen und starten
docker-compose up --build

# Anwendung öffnen
# http://localhost
```

### Anpassungen
- **Styling**: Bearbeiten Sie `styles.css` für Designänderungen
- **Funktionalität**: Erweitern Sie `script.js` für neue Features
- **Layout**: Modifizieren Sie `index.html` für strukturelle Änderungen

## Geplante Features

- [ ] Echte Backend-API Integration
- [ ] Incident Management System
- [ ] Erweiterte Benutzer-Einstellungen
- [ ] Tool-Integration in der oberen Leiste
- [ ] Erweiterte Grafana-Dashboards
- [ ] Push-Benachrichtigungen
- [ ] Multi-Language Support

## Security Features

- Client-seitige Input-Validation
- Session-Management
- CSRF-Schutz (geplant)
- Role-Based Access Control (geplant)

## Browser-Kompatibilität

Unterstützte Browser:
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Keyboard Shortcuts

- `Esc`: Schließt Modals und Dropdowns
- `Ctrl + L`: Schnelle Abmeldung (wenn eingeloggt)

## Deployment

Die Anwendung wird automatisch über Docker Compose bereitgestellt:

1. Frontend läuft auf NGINX
2. Erreichbar über Port 80
3. Grafana-Integration über Reverse Proxy
4. Alle Services im `sims-net` Netzwerk

## Troubleshooting

### Grafana lädt nicht
- Überprüfen Sie, ob der Grafana-Container läuft
- Stellen Sie sicher, dass der NGINX Reverse Proxy korrekt konfiguriert ist
- Prüfen Sie die Netzwerk-Konfiguration in `docker-compose.yml`

### Login funktioniert nicht
- Derzeit werden nur die Demo-Anmeldedaten unterstützt
- Für Produktionsumgebung muss die Backend-API implementiert werden

### Responsive Design Probleme
- Die Anwendung ist für Bildschirmgrößen ab 320px optimiert
- Bei Problemen prüfen Sie die CSS Media Queries in `styles.css`

## Changelog

### Version 1.0.0 (Aktuell)
- Initiale Version mit Login-System
- Grafana-Integration
- Responsive Design
- Demo-Authentifizierung