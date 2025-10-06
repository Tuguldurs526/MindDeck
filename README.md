# Minddeck Monorepo

Apps:
- `apps/server` — Express + Mongoose (TypeScript)
- `apps/web` — Next.js minimal (TypeScript)
- `apps/mobile` — Expo minimal (React Native)
- `packages/shared-types`, `packages/shared-api` — shared code

## Quick start
```bash
# From repo root after extracting
npm install
cp apps/server/.env.example apps/server/.env   # or copy on Windows
# Fill MONGO_URI and JWT_SECRET
npm run dev
```

URLs:
- Server: http://localhost:5000/api/health
- Web: http://localhost:3000
- Mobile: Expo Dev Tools (QR or simulator)