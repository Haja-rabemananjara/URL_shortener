#  URL Shortener — Test Technique Seconde

> Application fullstack de raccourcissement d'URL, construite avec **NestJS**, **Next.js**, **Prisma** et **PostgreSQL**.

---

## Aperçu

L'application permet de :
- **Créer** une URL raccourcie depuis une interface web
- **Rediriger** automatiquement un code court vers l'URL originale
- **Lister** toutes les URLs raccourcies avec leurs statistiques de clics
- **Supprimer** un lien
- **Personnaliser** le code court (optionnel)
- **Visualiser** des stats globales (total liens, clics)

---

## Architecture

```
url-shortener/
├── backend/          # NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── urls/     # Module URLs (controller, service, DTOs)
│   │   ├── prisma/   # PrismaService (connexion DB)
│   │   └── main.ts   # Bootstrap + Swagger
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── test/         # Tests e2e (Supertest)
├── frontend/         # Next.js  + Tailwind CSS
│   └── src/
│       ├── app/      # App Router (page.tsx, layout.tsx)
│       ├── components/  # ShortenForm, UrlCard, StatsBar
│       └── lib/      # Client API (axios)
├── docker-compose.yml
└── README.md
```

---

## Lancement rapide (Docker)

### Prérequis
- [Docker](https://www.docker.com/) + Docker Compose

### Démarrage

```bash
# 1. Cloner le repo
git clone git@github.com:Haja-rabemananjara/URL_shortener.git
cd url-shortener

# 2. Copier les variables d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Lancer tous les services
docker compose up --build
```

L'application est disponible sur :
| Service    | URL                               |
|------------|-----------------------------------|
| Frontend   | http://localhost:3000             |
| Backend    | http://localhost:3001             |
| Swagger    | http://localhost:3001/api/docs    |
| PostgreSQL | localhost:5432                    |

---

## Développement local (sans Docker)

### Prérequis
- Node.js 24.13.0
- PostgreSQL (ou lancer uniquement la DB via Docker)

### Backend

```bash
# Démarrer uniquement la base de données
docker compose up postgres -d

# Installer les dépendances
cd backend
npm install

# Variables d'environnement
cp .env.example .env

# Générer le client Prisma et lancer les migrations
npx prisma generate
npx prisma migrate deploy

# Démarrer en mode développement
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## Tests

### Backend — Tests unitaires

```bash
cd backend
npm test
# avec coverage
npm run test:cov
```

**Ce qui est testé :**
- `UrlsService` : création, déduplication, code personnalisé, conflits, suppression, stats
- `UrlsController` : création, listing, stats

### Backend — Tests e2e (nécessite PostgreSQL)

```bash
cd backend
npm run test:e2e
```

**Ce qui est testé :**
- `POST /api/urls` — création, déduplication, validation, code personnalisé, conflit
- `GET /api/urls` — listing
- `GET /:shortCode` — redirection 302, 404 si inexistant
- `DELETE /api/urls/:id` — suppression

### Frontend — Tests de composants

```bash
cd frontend
npm test
```

**Ce qui est testé :**
- `ShortenForm` : rendu, désactivation bouton, soumission réussie, gestion d'erreur API, affichage résultat, options avancées
- `UrlCard` : affichage, badge "Nouveau", copie presse-papiers, suppression avec/sans confirmation

---

## API Reference

| Méthode  | Endpoint            | Description                        |
|----------|---------------------|------------------------------------|
| `POST`   | `/api/urls`         | Créer une URL raccourcie           |
| `GET`    | `/api/urls`         | Lister toutes les URLs             |
| `DELETE` | `/api/urls/:id`     | Supprimer une URL                  |
| `GET`    | `/:shortCode`       | Rediriger vers l'URL originale     |

### POST /api/urls — Corps de la requête

```json
{
  "originalUrl": "https://example.com/some/very/long/path",
  "customCode": "mon-lien"  // optionnel, 3-20 chars
}
```

### Réponse

```json
{
  "id": "clx1234abcd",
  "originalUrl": "https://example.com/some/very/long/path",
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3001/abc123",
  "clicks": 0,
  "createdAt": "2025-02-17T12:00:00.000Z"
}
```

La documentation Swagger interactive est disponible sur [http://localhost:3001/docs](http://localhost:3001/docs).

---

## 🛠 Stack Technique

| Couche       | Technologie                         |
|--------------|-------------------------------------|
| Backend      | NestJS   , TypeScript               |
| ORM          | Prisma 7                            |
| Base données | PostgreSQL                          |
| Frontend     | Next.js (App Router), TypeScript    |
| Styles       | Tailwind CSS                        |
| Tests back   | Jest + Supertest                    |
| Tests front  | Jest + React Testing Library        |
| DevOps       | Docker, Docker Compose              |
| Docs API     | Swagger                             |

---

## ✨ Fonctionnalités bonus

- **Déduplication** : si une URL longue est déjà raccourcie, l'URL existante est retournée
- **Code personnalisé** : l'utilisateur peut choisir son propre code court
- **Compteur de clics** : chaque redirection incrémente le compteur
- **Stats globales** : nombre total de liens et de clics
- **Documentation Swagger** : interface interactive sur `/api/docs`
- **Validation** : DTOs stricts avec `class-validator`, messages d'erreur en français
- **UI soignée** : animations, états de chargement, skeleton loaders, copie presse-papiers

---

## 🔧 Variables d'environnement

### Backend (`backend/.env`)

| Variable        | Défaut                                         | Description             |
|-----------------|------------------------------------------------|-------------------------|
| `DATABASE_URL`  | `postgresql://postgres:postgres@localhost:5432/urlshortener` | Connexion PostgreSQL |
| `PORT`          | `3001`                                         | Port du serveur         |
| `BASE_URL`      | `http://localhost:3001`                        | URL publique du backend |
| `FRONTEND_URL`  | `http://localhost:3000`                        | URL du frontend (CORS)  |

### Frontend (`frontend/.env.local`)

| Variable              | Défaut                    | Description         |
|-----------------------|---------------------------|---------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001`   | URL de l'API        |
