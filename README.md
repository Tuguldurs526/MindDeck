# Minddeck
Monorepo for Minddeck — an AI‑powered spaced‑repetition flashcard system for Web and Mobile.
👉 Looking for the product overview?
Check the MindDeck MVP one‑pager.
**Apps**
- **Server** — Express + TypeScript + Mongoose + JWT (apps/server)
- **Web** — Next.js + Tailwind + AI card generation (apps/web)
- **Mobile** — Expo / React Native (apps/mobile)
- **Shared** — Types + tiny HTTP client (packages/shared-*)

## 1) Prerequisites

- Node.js 18+ (node -v)
- npm 9+ (npm -v)
- MongoDB
  - Local: MongoDB Community at mongodb://127.0.0.1:27017, or
  - Cloud: Atlas free-tier (with DB user + allowed IP)

- Windows users: use PowerShell (all commands below have Windows-safe versions)

## 2) Clone & Install
  ```text
  git clone <your_repo_url> Minddeck
  cd Minddeck
  npm install

## 3) Environments
**Server** (apps/server/.env
Copy the template:
```powershell
copy apps\server\.env.example apps\server\.env
```

Then edit:
``` ini
PORT=5000


# Local Mongo (recommended for dev)
MONGO_URI=mongodb://127.0.0.1:27017/minddeck

# Replace with random 32+ byte hex
JWT_SECRET=<your-secret>

# Web + mobile allowed origins during dev
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Optional: skip rate-limit during dev
SKIP_AUTH_RATE_LIMIT=true
AUTH_RATE_WINDOW_MS=600000
AUTH_RATE_MAX=100

# OpenAI model + API key
OPENAI_API_KEY=<your-key>
OPENAI_MODEL=gpt-4.1-mini
``` 
Generate a secure JWT secret:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Web (apps/web/.env.local)
textcopy apps\web\.env.local.example apps\web\.env.local
```
Ensure:
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
```
**Mobile**
```ini
apps/mobile/app.json uses:
expo.extra.API_URL = "http://localhost:5000"
If running on a physical phone, update this to your machine's LAN IP.
## 4) Run (development)
From repo root:
```powershell
npm run dev
This starts:
| APP       | URL                     |
|-----------|-------------------------------|
| App URL   | [http://localhost:5000](http://localhost:5000) |
| Web       | [http://localhost:3000](http://localhost:3000) |
| Mobile    | Expo Dev Tools + QR Code       |

## 5) Quick Smoke Test (No Postman Required)
```powershell
$API = "http://localhost:5000"

# 1) Health
Invoke-RestMethod -Method Get -Uri "$API/api/health"

# 2) Register/login
try {
  $reg = Invoke-RestMethod -Method Post -Uri "$API/auth/register" -ContentType "application/json" -Body '{"username":"tugo","email":"tugo@test.com","password":"Passw0rd!"}'
  $token = $reg.token
} catch {
  $login = Invoke-RestMethod -Method Post -Uri "$API/auth/login" -ContentType "application/json" -Body '{"email":"tugo@test.com","password":"Passw0rd!"}'
  $token = $login.token
}
$headers = @{ Authorization = "Bearer " + $token }

# 3) Create deck
$deck = Invoke-RestMethod -Method Post -Uri "$API/decks" -Headers $headers -ContentType "application/json" -Body '{"title":"Algorithms"}'
$deckId = $deck._id

# 4) Create card
$body = @{ front = "What is Big-O?"; back = "Upper bound"; deckId = $deckId } | ConvertTo-Json
$card = Invoke-RestMethod -Method Post -Uri "$API/cards" -Headers $headers -ContentType "application/json" -Body $body
$cardId = $card._id

# 5) List/update/delete
Invoke-RestMethod -Method Get -Uri "$API/cards/$deckId" -Headers $headers | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Put -Uri "$API/cards/$cardId" -Headers $headers -ContentType "application/json" -Body '{"back":"Asymptotic upper bound"}'
Invoke-RestMethod -Method Delete -Uri "$API/cards/$cardId" -Headers $headers
Invoke-RestMethod -Method Delete -Uri "$API/decks/$deckId" -Headers $headers```

## 6) API Overview
**Auth**
``` pgsql
POST /auth/register        { username, email, password }
POST /auth/login           { email, password }
Auth header for all protected routes:
```makefile
Authorization: Bearer <token>
**Decks**

```bash
POST   /decks              { title }                    -> deck
GET    /decks              ?page&limit                  -> [deck]
GET    /decks/:id                                       -> deck
DELETE /decks/:id                                       -> OK
**Cards**
```bash
POST   /cards              { front, back, deckId }      -> card
GET    /cards/:deckId                                   -> [card]
PUT    /cards/:id         { front?, back? }             -> card
DELETE /cards/:id                                       -> OK```
**Reviews (SM‑2 scheduling system)**
```bash
GET    /reviews/queue?deckId=abc&limit=10   -> next due cards
POST   /reviews/answer { cardId, quality }   -> updates intervals```
AI-powered extraction:
```bash
POST /ai/generate        { text }
POST /ai/upload          multipart/form-data (PDF / DOCX)```
## 7) Repo Scripts
From root:
```bash
npm run dev
npm run dev:server
npm run dev:web
npm run dev:mobile```
Server-specific:
```bash
npm run dev
npm run build
npm start```
## 8) Project Structure
```csharp
Minddeck/
├─ apps/
│  ├─ server/            # Express API (TS, ESM)
│  ├─ web/               # Next.js + Tailwind
│  └─ mobile/            # Expo (RN)
├─ packages/
│  ├─ shared-types/      # zod shared types
│  └─ shared-api/        # tiny fetch client + token store
├─ docs/
│  └─ mvp-one-pager.md
├─ .vscode/
├─ tsconfig.base.json
└─ .editorconfig```
## 9) Common Issues

- Server not responding → start via npm run dev
- Mongo connect fail → ensure MongoDB is running
- 401 → missing JWT header
- 403 → accessing another user’s deck
- 429 (auth) → restart server if rate-limited
- CORS issues → ensure CORS_ORIGINS is correct
- AI upload errors → ensure pdf-parse and mammoth are installed

## 10) Team Responsibilities (Milestone 1)

- Rony — server infra
- Aisha — auth models & routes
- Davor — auth controller
- Sandra — deck/card models
- Tugo — deck & card feature implementation
### Status: Milestone 1 completed.
## 11) Contributing
```gpsql
git checkout -b feature/<name>
git commit -m "feat: description"
git push -u origin feature/<name>```
## 12) Current Milestone (Completed)

- Login / register
- Deck CRUD
- Card CRUD
- Review system (SM‑2)
- AI text → flashcards
- AI PDF/DOCX → flashcards
- Next-due scheduling
- Modern UI + Tailwind
- Deck due-badge + progress indicators

## 13) Next (Optional) Milestone

- Mobile polish + offline mode
- Voice input / TTS card reading
- Export/import decks
- Social/public decks
- Analytics / streak system

To download this as README.md, copy the content above into a new file and save it with the .md extension.11.9sthen you just give me docx file with all of this in md formatMinddeck
Monorepo for Minddeck — an AI‑powered spaced‑repetition flashcard system for Web and Mobile.
👉 Looking for the product overview?
Check the MindDeck MVP one‑pager.
**Apps**

- Server — Express + TypeScript + Mongoose + JWT (apps/server)
- Web — Next.js + Tailwind + AI card generation (apps/web)
- Mobile — Expo / React Native (apps/mobile)
- Shared — Types + tiny HTTP client (packages/shared-*)

## 1) Prerequisites

- Node.js 18+ (node -v)
- npm 9+ (npm -v)
- MongoDB
  - Local: MongoDB Community at mongodb://127.0.0.1:27017, or
  - Cloud: Atlas free-tier (with DB user + allowed IP)

Windows users: use PowerShell (all commands below have Windows-safe versions)

2) Clone & Install
```powershell
git clone <your_repo_url> Minddeck
cd Minddeck
npm install```
3) Environments
**Server** (apps/server/.env)
Copy the template:
```powershell
copy apps\server\.env.example apps\server\.env```
Then edit:
```ini
PORT=5000

# Local Mongo (recommended for dev)
MONGO_URI=mongodb://127.0.0.1:27017/minddeck

# Replace with random 32+ byte hex
JWT_SECRET=<your-secret>

# Web + mobile allowed origins during dev
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Optional: skip rate-limit during dev
SKIP_AUTH_RATE_LIMIT=true
AUTH_RATE_WINDOW_MS=600000
AUTH_RATE_MAX=100

# OpenAI model + API key
OPENAI_API_KEY=<your-key>
OPENAI_MODEL=gpt-4.1-mini```
Generate a secure JWT secret:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"```
**Web** (apps/web/.env.local)
```powershell
copy apps\web\.env.local.example apps\web\.env.local```
Ensure:
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000```
**Mobile**
apps/mobile/app.json uses:
```ini
expo.extra.API_URL = "http://localhost:5000"```
If running on a physical phone, update this to your machine's LAN IP.
4) Run (development)
From repo root:
```powershell
npm run dev```
This starts:
| APP       | URL                     |
|-----------|-------------------------------|
| App URL   | [http://localhost:5000](http://localhost:5000) |
| Web       | [http://localhost:3000](http://localhost:3000) |
| Mobile    | (Expo)Dev Tools + QR Code       |







5) Quick Smoke Test (No Postman Required)
```powershell
$API = "http://localhost:5000"

## 1) Health
Invoke-RestMethod -Method Get -Uri "$API/api/health"

## 2) Register/login
try {
  $reg = Invoke-RestMethod -Method Post -Uri "$API/auth/register" -ContentType "application/json" -Body '{"username":"tugo","email":"tugo@test.com","password":"Passw0rd!"}'
  $token = $reg.token
} catch {
  $login = Invoke-RestMethod -Method Post -Uri "$API/auth/login" -ContentType "application/json" -Body '{"email":"tugo@test.com","password":"Passw0rd!"}'
  $token = $login.token
}
$headers = @{ Authorization = "Bearer " + $token }

## 3) Create deck
$deck = Invoke-RestMethod -Method Post -Uri "$API/decks" -Headers $headers -ContentType "application/json" -Body '{"title":"Algorithms"}'
$deckId = $deck._id

## 4) Create card
$body = @{ front = "What is Big-O?"; back = "Upper bound"; deckId = $deckId } | ConvertTo-Json
$card = Invoke-RestMethod -Method Post -Uri "$API/cards" -Headers $headers -ContentType "application/json" -Body $body
$cardId = $card._id

## 5) List/update/delete
Invoke-RestMethod -Method Get -Uri "$API/cards/$deckId" -Headers $headers | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Put -Uri "$API/cards/$cardId" -Headers $headers -ContentType "application/json" -Body '{"back":"Asymptotic upper bound"}'
Invoke-RestMethod -Method Delete -Uri "$API/cards/$cardId" -Headers $headers
Invoke-RestMethod -Method Delete -Uri "$API/decks/$deckId" -Headers $headers```
## 6) API Overview
**Auth**
```pqsql
POST /auth/register        { username, email, password }
POST /auth/login           { email, password }```
Auth header for all protected routes:
```makefile
Authorization: Bearer <token>```
**Decks**
```bash
POST   /decks              { title }                    -> deck
GET    /decks              ?page&limit                  -> [deck]
GET    /decks/:id                                       -> deck
DELETE /decks/:id                                       -> OK```
**Cards**
```bash
POST   /cards              { front, back, deckId }      -> card
GET    /cards/:deckId                                   -> [card]
PUT    /cards/:id         { front?, back? }             -> card
DELETE /cards/:id                                       -> OK```
**Reviews (SM‑2 scheduling system)**
```bash
GET    /reviews/queue?deckId=abc&limit=10   -> next due cards
POST   /reviews/answer { cardId, quality }   -> updates intervals```
AI-powered extraction:
```bash
POST /ai/generate        { text }
POST /ai/upload          multipart/form-data (PDF / DOCX)```
## 7) Repo Scripts
From root:
```bash
npm run dev
npm run dev:server
npm run dev:web
npm run dev:mobile```
Server-specific:
```bash
npm run dev
npm run build
npm start```
## 8) Project Structure
```csharp
Minddeck/
├─ apps/
│  ├─ server/            # Express API (TS, ESM)
│  ├─ web/               # Next.js + Tailwind
│  └─ mobile/            # Expo (RN)
├─ packages/
│  ├─ shared-types/      # zod shared types
│  └─ shared-api/        # tiny fetch client + token store
├─ docs/
│  └─ mvp-one-pager.md
├─ .vscode/
├─ tsconfig.base.json
└─ .editorconfig```
## 9) Common Issues

- Server not responding → start via npm run dev
- Mongo connect fail → ensure MongoDB is running
- 401 → missing JWT header
- 403 → accessing another user’s deck
- 429 (auth) → restart server if rate-limited
- CORS issues → ensure CORS_ORIGINS is correct
- AI upload errors → ensure pdf-parse and mammoth are installed

## 10) Team Responsibilities (Milestone 1)

- Rony — server infra
- Aisha — auth models & routes
- Davor — auth controller
- Sandra — deck/card models
- Tugo — deck & card feature implementation

### Status: Milestone 1 completed.
## 11) Contributing
```pqsql
git checkout -b feature/<name>
git commit -m "feat: description"
git push -u origin feature/<name>```
## 12) Current Milestone (Completed)

- Login / register
- Deck CRUD
- Card CRUD
- Review system (SM‑2)
- AI text → flashcards
- AI PDF/DOCX → flashcards
- Next-due scheduling
- Modern UI + Tailwind
- Deck due-badge + progress indicators

## 13) Next (Optional) Milestone

- Mobile polish + offline mode
- Voice input / TTS card reading
- Export/import decks
- Social/public decks
- Analytics / streak system
