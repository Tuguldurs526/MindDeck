# Minddeck Server Add-on (Reviews + AI + Stats)

This bundle contains **server-only** files you can drop into your repo.

## 1) Copy files
Copy the `apps/server/src/**` and `apps/server/test/**` from this zip into your repo at the same paths.

## 2) Add routes in `apps/server/src/app.ts`
```ts
// near other imports
import reviewRoutes from "./routes/reviewRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

// after auth/cards/decks
app.use("/reviews", reviewRoutes);
app.use("/ai", aiRoutes);
app.use("/stats", statsRoutes);
```

## 3) Install dependencies
From repo root or apps/server:
```bash
cd apps/server
npm i openai express-rate-limit
```

## 4) Env
Add to `apps/server/.env`:
```env
OPENAI_API_KEY=sk-xxxx
OPENAI_MODEL=gpt-4o-mini
```

## 5) Tests
Run:
```bash
cd apps/server
npm test
```
The SM-2 unit should pass immediately.

## 6) Swagger (optional)
A stub OpenAPI yaml is under `apps/server/src/docs/openapi-stub.yaml`. You can serve it with swagger-ui-express later.

## Notes
- /ai endpoints will return 401 if no JWT or 500 if OPENAI_API_KEY missing and the endpoints are hit.
- /reviews/next seeds initial ReviewState entries (due now) for the given deck if none exist yet.
- Keep rate limiting on /ai to avoid surprise bills.
```