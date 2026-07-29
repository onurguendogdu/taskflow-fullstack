# TaskFlow

TaskFlow ist eine Full-Stack-Webanwendung zur Verwaltung persönlicher Aufgaben. Das Projekt kombiniert ein responsives Frontend mit einer REST-API, MongoDB-Persistenz, Validierung, API-Dokumentation und optionaler OpenID-Connect-Authentifizierung.

## Features

- Aufgaben anlegen, bearbeiten und löschen
- Status: Offen, In Arbeit, Erledigt
- Prioritäten: Niedrig, Mittel, Hoch
- Suche sowie Status- und Prioritätsfilter
- Live-Übersicht über den Aufgabenfortschritt
- REST-API mit Request-Validierung
- MongoDB-Persistenz und benutzerbezogene Datentrennung
- Swagger / OpenAPI unter `/api-docs`
- Demo-Authentifizierung für unkomplizierten lokalen Start
- optionaler OIDC/JWT-Modus für externe Identity Provider
- API-Tests mit dem integrierten Node.js Test Runner
- Docker-Setup für App + MongoDB

## Tech Stack

Frontend: HTML5, CSS3, JavaScript ES Modules  
Backend: Node.js, Express, express-validator  
Datenbank: MongoDB  
Auth: Demo-Modus oder OpenID Connect / JWT  
Testing: Node.js Test Runner  
Dokumentation: OpenAPI / Swagger  
Tooling: Docker, Git, GitHub Actions

## Lokal starten

### Variante A: Docker

```bash
docker compose up --build
```

Danach:

- App: `http://localhost:3000`
- API-Dokumentation: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

### Variante B: Node.js + lokale MongoDB

Voraussetzungen: Node.js 22+ und MongoDB.

```bash
cd backend
npm install
npm run dev
```

Standardmäßig läuft TaskFlow im Demo-Auth-Modus. Die Konfiguration kann über Umgebungsvariablen aus `.env.example` gesetzt werden.

## Tests

```bash
cd backend
npm test
```

Die API-Tests verwenden ein In-Memory-Repository und benötigen keine laufende MongoDB.

## Projektstruktur

```text
TaskFlow/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── js/
│       ├── api.js
│       ├── main.js
│       └── ui.js
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── app.js
│   │   ├── config.js
│   │   ├── openapi.js
│   │   └── server.js
│   └── tests/
├── docs/
├── docker-compose.yml
└── Dockerfile
```

## Architektur

Die Anwendung folgt einer einfachen Trennung von UI, HTTP-API und Persistenz. Express stellt die statischen Frontend-Dateien und die REST-Endpunkte bereit. Die API arbeitet über ein Repository-Interface mit MongoDB; Tests können dadurch ohne echte Datenbank ausgeführt werden.

Mehr dazu: [`docs/architecture.md`](docs/architecture.md)

## Sicherheit

- Keine Secrets im Repository
- OIDC-Zugangsdaten ausschließlich über Umgebungsvariablen
- HTTP-only Cookie für Access Tokens im OIDC-Modus
- serverseitige Validierung aller Task-Eingaben
- Tasks werden immer an den angemeldeten Benutzer gebunden

## Projekt-Hintergrund

Die erste Version der Anwendung entstand im Rahmen eines Hochschulprojekts. Für diese Portfolio-Version wurde das Projekt eigenständig strukturell überarbeitet und erweitert: neue Projektarchitektur, portable Authentifizierung, Prioritäten, Suche und Filter, überarbeitetes Frontend, Repository-Schicht, Docker-Setup, Tests, Dokumentation und Entfernung projektspezifischer Zugangsdaten.

## Lizenz

MIT
