# Minddeck

Monorepo for Minddeck: spaced-repetition flashcards for web and mobile.

👉 Looking for the product overview? Check the [MindDeck MVP one-pager](docs/mvp-one-pager.md).

Apps:

- **Server** — Express + TypeScript + Mongoose + JWT (`apps/server`)
- **Web** — Next.js (`apps/web`)
- **Mobile** — Expo / React Native (`apps/mobile`)
- **Shared** — Types + tiny HTTP client (`packages/shared-*`)

---

## 1) Prerequisites

- **Node.js 18+** (`node -v`)
- **npm 9+** (`npm -v`)
- **MongoDB**
  - Local: MongoDB Community at `mongodb://127.0.0.1:27017`, or
  - Cloud: Atlas free-tier (plus DB user + allowed IP)
- **Windows users**: use **PowerShell** (commands below include Windows-friendly copies).

---

## 2) Clone & install

```powershell
git clone <your_repo_url> Minddeck
cd Minddeck
npm install
```

---

## 3) Environments

### Server (`apps/server/.env`)

Copy the example and fill values:

```powershell
copy apps\server\.env.example apps\server\.env
```

Then open `apps/server/.env` and set:

```
PORT=5000
# Local Mongo (recommended for dev) OR your Atlas URI
MONGO_URI=mongodb://127.0.0.1:27017/minddeck
# Any long random string
JWT_SECRET=<paste-a-long-random-string>
# Allowed web/mobile origins during dev
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Dev-friendly rate limit config (skip limiter outside production)
SKIP_AUTH_RATE_LIMIT=true
AUTH_RATE_WINDOW_MS=600000
AUTH_RATE_MAX=100
```

> To generate a secret quickly:
>
> ```powershell
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Web (`apps/web/.env.local`)

```powershell
copy apps\web\.env.local.example apps\web\.env.local
```

Ensure:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Mobile

Uses `http://localhost:5000` by default via `apps/mobile/app.json` → `expo.extra.API_URL`.
If your server runs on a different machine/IP, update that value.

---

## 4) Run (development)

From **repo root**:

```powershell
npm run dev
```

What starts:

- **Server**: http://localhost:5000 (health: `/api/health`)
- **Web**: http://localhost:3000
- **Mobile**: Expo Dev Tools (scan QR or run a simulator)

> Keep this terminal open while developing. Open a second terminal for tests.

---

## 5) Quick smoke test (no Postman)

Open **new PowerShell** and run:

```powershell
$API = "http://localhost:5000"

# 1) Health
Invoke-RestMethod -Method Get -Uri "$API/api/health" | ConvertTo-Json

# 2) Register or login
try {
  $reg = Invoke-RestMethod -Method Post -Uri "$API/auth/register" -ContentType "application/json" -Body '{"username":"tugo","email":"tugo@test.com","password":"Passw0rd!"}'
  $token = $reg.token
} catch {
  $login = Invoke-RestMethod -Method Post -Uri "$API/auth/login" -ContentType "application/json" -Body '{"email":"tugo@test.com","password":"Passw0rd!"}'
  $token = $login.token
}
$headers = @{ Authorization = "Bearer " + $token }

# 3) Create a deck
$deck = Invoke-RestMethod -Method Post -Uri "$API/decks" -Headers $headers -ContentType "application/json" -Body '{"title":"Algorithms"}'
$deckId = $deck._id

# 4) Create a card
$body = @{ front = "What is Big-O?"; back = "Upper bound"; deckId = $deckId } | ConvertTo-Json
$card = Invoke-RestMethod -Method Post -Uri "$API/cards" -Headers $headers -ContentType "application/json" -Body $body
$cardId = $card._id

# 5) List + Update + Delete
Invoke-RestMethod -Method Get -Uri "$API/cards/$deckId" -Headers $headers | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Put -Uri "$API/cards/$cardId" -Headers $headers -ContentType "application/json" -Body '{"back":"Asymptotic upper bound"}' | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Delete -Uri "$API/cards/$cardId" -Headers $headers | ConvertTo-Json
Invoke-RestMethod -Method Delete -Uri "$API/decks/$deckId" -Headers $headers | ConvertTo-Json
```

Expected: JSON at each step; `updatedAt` changes after PUT; deleting a deck removes its cards.

---

## 6) API (current)

### Auth

```
POST /auth/register   { username, email, password } -> { token, user }
POST /auth/login      { email, password }           -> { token, user }

# Include on protected routes:
Authorization: Bearer <token>
```

### Decks (owned by the logged-in user)

```
POST   /decks                 { title }                 -> deck
GET    /decks                 ?page=1&limit=50          -> [deck]
GET    /decks/:id                                      -> deck
DELETE /decks/:id                                      -> { message: "Deck deleted" }
```

### Cards (belong to a deck the user owns)

```
POST   /cards                 { front, back, deckId }   -> card
GET    /cards/:deckId         ?page=1&limit=50          -> [card]
PUT    /cards/:id             { front?, back? }         -> card
DELETE /cards/:id                                       -> { message: "Card deleted" }
```

Rules:

- IDs must be valid Mongo ObjectIds.
- Ownership is enforced (403 on other users’ data or deleted decks).
- Schemas use `{ timestamps: true }`. Updates via `.save()` bump `updatedAt`.

---

## 7) Repo scripts

From **root**:

```bash
npm run dev         # start server + web + mobile
npm run dev:server  # start only server
npm run dev:web     # start only web
npm run dev:mobile  # start only mobile (Expo)
```

From **apps/server**:

```bash
npm run dev         # tsx watch src/index.ts
npm run build       # tsc -> dist
npm start           # run built server
```

---

## 8) Project structure

```
Minddeck/
├─ apps/
│  ├─ server/            # Express API (TS, ESM)
│  ├─ web/               # Next.js app
│  └─ mobile/            # Expo (React Native)
├─ packages/
│  ├─ shared-types/      # zod types
│  └─ shared-api/        # tiny HTTP client + auth storage
├─ .vscode/              # format on save (Prettier + ESLint)
├─ tsconfig.base.json
├─ .editorconfig
└─ .gitattributes
```

Notes:

- Server uses **ESM** in TS; keep import endings as `.js` in TS files (e.g. `import x from "./x.js"`).
- Indexes:
  - `Deck`: `deckSchema.index({ user: 1 })`
  - `Card`: `cardSchema.index({ deck: 1 })`
  - Optional: `deckSchema.index({ user: 1, title: 1 }, { unique: true })` to prevent duplicate deck titles per user.

---

## 9) Common issues

- **“Actively refused” / no response**: server isn’t running. Start with `npm run dev` and keep that terminal open.
- **Mongo connect fails**: start local Mongo or use a valid Atlas `MONGO_URI`.
- **401 Unauthorized**: missing `Authorization: Bearer <token>`.
- **403 Forbidden**: ownership enforcement or deck was deleted.
- **429 Too Many Requests on /auth**: rate limiter. In dev we set `SKIP_AUTH_RATE_LIMIT=true`. Restart server to reset counters.

---

## 10) Team responsibilities (Milestone 1)

- **Rony** — Server boot & infra  
  Health route, CORS, Mongo connect, tsx watcher, root `/`, 404 handler.
- **Aisha** — User model + auth routes  
  `models/User.ts`, `routes/authRoutes.ts` (rate limit), happy-path tests.
- **Davor** — Auth controller  
  `controllers/authController.ts`, `utils/jwt.ts`, input normalization, error handling.
- **Sandra** — Deck & Card models  
  `models/Deck.ts`, `models/Card.ts`, indexes, optional unique `(user,title)`, cascade delete.
- **Tugo** — Deck & Card routes + controllers  
  `routes/deckRoutes.ts`, `routes/cardRoutes.ts`, ownership checks, timestamps.

> Status: base implementation exists for all of the above. Owners should review, improve, and add tests.

---

## 11) Contributing

1. Create a branch:  
   `git checkout -b feature/<short-name>`
2. Commit small changes:  
   `git commit -m "feat(server): add review endpoints"`
3. Push & open PR:  
   `git push -u origin feature/<short-name>`

(Optional) Add CI to compile the server on PRs.

---

## 12) Next milestone

- **Reviews/SRS**: `GET /reviews/today`, `POST /reviews` (SM-2 scheduling)
- **Web**: login → deck list → review screen using shared API client
- **Mobile**: same flow; store token securely
- **OpenAPI/Swagger**: document endpoints
