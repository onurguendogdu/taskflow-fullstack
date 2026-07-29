# GitHub Setup

Empfohlener Repository-Name: `taskflow-fullstack`

Beschreibung:

> Full-stack task management app with Node.js, Express, MongoDB, REST API, validation, filtering, OIDC-ready auth and automated API tests.

Empfohlene Topics:

`nodejs` `express` `mongodb` `javascript` `rest-api` `full-stack` `openapi` `docker` `portfolio`

## Neues Repository veröffentlichen

Das Portfolio-Projekt liegt bewusst ohne den alten `.git`-Ordner vor. So bleibt die neue, stark überarbeitete Portfolio-Edition getrennt vom ursprünglichen Projektverlauf. Der Projekt-Hintergrund wird im README transparent genannt.

### GitHub CLI

```bash
git init
git add .
git commit -m "feat: publish TaskFlow portfolio edition"
git branch -M main
gh repo create taskflow-fullstack --public --source=. --remote=origin --push
```

### Ohne GitHub CLI

1. Auf GitHub ein leeres öffentliches Repository `taskflow-fullstack` erstellen.
2. Danach lokal:

```bash
git init
git add .
git commit -m "feat: publish TaskFlow portfolio edition"
git branch -M main
git remote add origin https://github.com/onurguendogdu/taskflow-fullstack.git
git push -u origin main
```

## Nach dem ersten `npm install`

`npm install` erzeugt lokal eine aktuelle `package-lock.json`. Diese Datei anschließend committen:

```bash
cd backend
npm install
npm test
cd ..
git add backend/package-lock.json
git commit -m "chore: add dependency lockfile"
git push
```
