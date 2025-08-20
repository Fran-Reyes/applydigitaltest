# Products API — Code Challenge

A **NestJS + TypeORM (PostgreSQL)** API that:

- ✅ Exposes a **public products module** with pagination (max **5** per page) and filters
- ✅ Implements **soft-delete** (items do **not** come back on sync)
- ✅ Syncs products from **Contentful (CDA)** **hourly** and via a manual endpoint
- ✅ Ships a **private reports module** protected with **JWT**
- ✅ Swagger docs at `http://localhost:3000/api/docs`
- ✅ Ready for **Docker Compose**, **tests**, and **conventional commits**

---

## Table of Contents

- [Architecture](#architecture)
- [Requirements](#requirements)
- [Environment (.env)](#environment-env)
- [Run](#run)
  - [With Docker (recommended)](#with-docker-recommended)
  - [Local without Docker](#local-without-docker)
- [Contentful Sync](#contentful-sync)
- [Endpoints](#endpoints)
  - [Auth (private)](#auth-private)
  - [Products (public)](#products-public)
  - [Reports (private)](#reports-private)
- [Usage Examples](#usage-examples)
- [Tests, Lint & Coverage](#tests-lint--coverage)
- [Conventional Commits](#conventional-commits)
- [Troubleshooting](#troubleshooting)
![CI](https://github.com/Fran-Reyes/applydigitaltest/actions/workflows/ci.yml/badge.svg)

---

## Architecture

```
src/
  auth/            # Login + JWT (@nestjs/jwt) and JwtGuard
  products/        # Product entity + service/controller (public)
  reports/         # Aggregations/metrics (private with JWT)
  sync/            # Cron + manual endpoint to import from Contentful
  common/pipes/    # MaxLimitPipe (enforces limit <= 5)
```

- **SyncModule → ProductsService**: upsert by `contentfulId`, preserving `isDeleted=true`.
- **Soft-delete**: `DELETE /products/:id` sets `isDeleted=true` and does **not** resurrect on sync.
- **Swagger**: `/api/docs`.

---

## Requirements

- **Node.js 20+** (or Docker)
- **Docker Desktop** (Windows: WSL2 enabled)
- **Git**
- (Optional) `jq` for bash examples

---

## Environment (.env)

Create an **`.env`** file in the project root:

```ini
# Postgres
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=products

# Auth (demo)
AUTH_USER=admin
AUTH_PASS=admin
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1h

# Contentful (CDA)
CONTENTFUL_SPACE_ID=xxxxxx
CONTENTFUL_ACCESS_TOKEN=xxxxxx   # Delivery API token (NOT Preview/Management)
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product
CONTENTFUL_PAGE_SIZE=1000
# CONTENTFUL_USE_PREVIEW=false    # true to use Preview API

# App
PORT=3000
NODE_ENV=development
```

> Use a **Content Delivery API** token. If you must use Preview, set `CONTENTFUL_USE_PREVIEW=true`.

---

## Run

### With Docker (recommended)

```bash
docker compose up -d --build
docker compose logs -f api
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`
- DB: PostgreSQL on `localhost:5432` (see `.env`)

### Local without Docker

```bash
npm ci
npm run start:dev
```

You’ll need a local Postgres matching your `.env`.  
*(For the test we use `synchronize: true`; use migrations for production.)*

---

## Contentful Sync

- **Cron**: runs hourly.
- **Manual**: `POST /sync/refresh`

```bash
curl -X POST http://localhost:3000/sync/refresh
# → { "total": <total>, "imported": <imported> }
```

Integration notes:

- Uses `Authorization: Bearer <token>` (not a query param).
- Smart **rate-limit backoff** on `429` (`Retry-After` / `X-Contentful-RateLimit-Reset` + exponential jitter).
- `CONTENTFUL_PAGE_SIZE` (default 100; recommended 1000).

---

## Endpoints

### Auth (private)

- `POST /auth/login` → `{ access_token }`  
  Body: `{ "username":"admin", "password":"admin" }` (configurable via `.env`).

### Products (public)

- `GET /products`
  - **Query**: `page` (1), `limit` (≤ **5**), `name`, `category`, `minPrice`, `maxPrice`, `sort` (`name|price|createdAt`)
- `DELETE /products/:id`
  - Soft-delete (`isDeleted=true`)

### Reports (private, `Authorization: Bearer <JWT>`)

- `GET /reports/deleted-percentage`
- `GET /reports/non-deleted-percentage?hasPrice=true|false&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /reports/top-categories?limit=5`

---

## Usage Examples

**1) Seed data from Contentful**
```bash
curl -X POST http://localhost:3000/sync/refresh
```

**2) Public products**
```bash
curl "http://localhost:3000/products?page=1&limit=5&name=shoe&minPrice=50&maxPrice=120&sort=price"
```

**3) Auth + private**

- **PowerShell**
  ```powershell
  $TOKEN = (curl.exe -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" `
    -d "{\"username\":\"admin\",\"password\":\"admin\"}" | ConvertFrom-Json).access_token

  curl.exe -H "Authorization: Bearer $TOKEN" http://localhost:3000/reports/deleted-percentage
  ```

- **Git Bash (without jq)**
  ```bash
  TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"username":"admin","password":"admin"}' \
  | sed -n 's/.*"access_token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

  curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/reports/deleted-percentage
  ```

---

## Tests, Lint & Coverage

```bash
npm run test        # unit tests
npm run test:cov    # coverage (text + lcov + json-summary)
npm run lint        # eslint + prettier
npm run lint:fix
```

- Coverage target: **≥ 50%** (typical with included specs: ~50–70%).
- Unit tests mock Contentful and Postgres.

---

## Conventional Commits

**commitlint + husky** enforce conventional commits.

- Valid example (≤100 chars, lower-case subject):
  ```
  feat(sync): page size config and smarter rate-limit backoff
  ```
- Common types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`.
- If the hook fails (subject-case/length), amend:
  ```bash
  git commit --amend -m "feat(...): ..." && git push --force-with-lease
  ```

---

## Troubleshooting

**Docker/WSL2 on Windows**  
Enable WSL2 and restart Docker Desktop.

**`/sync/refresh` returns 401/404/429**  
- **401**: wrong token → use **CDA** token (Delivery).  
- **404**: wrong `SPACE_ID` / `ENVIRONMENT` / `CONTENT_TYPE`.  
- **429**: rate-limit → backoff is built-in; avoid repeated manual refresh; tune `CONTENTFUL_PAGE_SIZE` (e.g., 500–1000).

**JWT 401 on private endpoints**  
Send `Authorization: Bearer <token>`. Default credentials: `admin/admin` (configurable).

**Swagger not available**  
Visit `http://localhost:3000/api/docs` and ensure the `api` container is running.

---

## License

MIT
