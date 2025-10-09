# MindDeck MVP One-Pager

## 0. Problem
Students struggle to retain information because they cram and rarely review material at the right time. Spaced repetition and retrieval practice repeatedly demonstrate significant improvements to long-term memory (Ebbinghaus; Roediger & Karpicke, 2006; meta-analysis by Cepeda et al., 2008). Existing apps that leverage these techniques tend to be bloated, opinionated, or insufficiently cross-platform for our target workflow.

## 1. Purpose
Deliver a simple, fast, cross-platform flashcard experience that automatically schedules reviews and offers quick AI-powered hints or explanations when learners are stuck. The platform shares a single backend that serves both the web and mobile clients.

## 2. Users & Core Value
- **Primary user:** University students who want to reliably remember material without manually curating review schedules.
- **MVP value:** Create decks, manage cards, study with spaced repetition, request optional AI hints/explanations, and track lightweight progress indicators.

## 3. Scope
### In MVP
- Authentication (register/login with JWT).
- Deck and card CRUD with ownership and validation.
- Review engine (SM-2 style) with a queue of due cards and Again/Hard/Good/Easy ratings.
- Basic stats (due today, studied today, simple streak).
- Web app (Next.js) and mobile app (Expo) backed by the shared API.
- AI endpoints: `/ai/hint` and `/ai/explain` with a 7-day cache.
- API documentation at `/docs` (Swagger or zod-derived).
- Deployed backend and web app; mobile via Expo.

### Out of MVP (future work)
- Shared/public decks and collaborative editing.
- Import/export beyond CSV/JSON.
- Advanced analytics and leaderboards.
- Offline sync with conflict resolution.

## 4. System at a Glance
```
monorepo
├── apps/
│   ├── server/   (Express + Mongoose + TypeScript)
│   ├── web/      (Next.js + Tailwind/shadcn + React Query)
│   └── mobile/   (Expo React Native + React Query + SecureStore)
├── packages/
│   ├── shared-types/
│   └── shared-api/
└── docs/
    └── mvp-one-pager.md
```
- **Server status:** User, Deck, and Card models plus `/auth`, `/decks`, and `/cards` routes with JWT middleware, Zod validation, E2E tests, and CI are already complete.
- **Server backlog:** Add the `ReviewState` model and review routes, stats endpoint, AI cache endpoints, and Swagger docs.
- **Clients:** Build web and mobile flows for authentication, deck/card management, study sessions, and AI assist features.

## 5. Key User Stories & Acceptance Criteria
1. **Authentication:** Users can register, log in, and maintain sessions across refreshes. Protected endpoints return `401` when unauthorized and `200` when a valid JWT is present.
2. **Create & Manage Content:** Users can create decks, add/edit/delete cards, and see updates immediately. Invalid input yields `400` responses and ownership is enforced.
3. **Study Loop:** Users start studying to view due cards, rate them (Again/Hard/Good/Easy), and watch due counts drop as SM-2 scheduling updates review intervals.
4. **AI Assist:** Users tap Hint for gentle nudges and Explain for short explanations. First calls hit the AI model; repeated identical requests within 7 days return cached responses.
5. **Stats:** Users see counts of due cards, studied cards, and a simple streak that update after studying.

## 6. Endpoints
### Authentication
- `POST /auth/register`
- `POST /auth/login` → `{ token }`
- `GET /auth/me` (optional)

### Decks & Cards (existing)
- `POST /decks`
- `GET /decks`
- `GET /decks/:id`
- `DELETE /decks/:id`
- `POST /cards`
- `GET /cards/:deckId`
- `PUT /cards/:id`
- `DELETE /cards/:id`

### Reviews (to add)
- `GET /reviews/next?deckId&limit=20`
- `POST /reviews/answer` → body `{ cardId, rating: "again" | "hard" | "good" | "easy" }`
- `GET /stats/overview`

### AI (to add)
- `POST /ai/hint` → `{ cardId }`
- `POST /ai/explain` → `{ cardId? text? }`

## 7. Data Models
- **User:** `{ username, email (unique), passwordHash }`
- **Deck:** `{ title, user }` with unique `(user, title)` constraint.
- **Card:** `{ front, back, deck, createdAt, updatedAt }`
- **ReviewState:** `{ user, card, repetition, interval, efactor, due, lapses, lastReviewedAt }`
- **AICache:** `{ user, type: "hint" | "explain", card?, textHash?, output, createdAt }` with a 7-day TTL.

## 8. Scheduling Logic (SM-2 Overview)
- Rating buttons map to qualities: Again = 0, Hard ≈ 3, Good = 4, Easy = 5.
- Ease factor adjusts after each review; intervals progress 1 day → 6 days → `round(previous * EF)`.
- Lapses reset repetition counts.
- Provides predictable, research-backed scheduling aligned with the spacing effect.

## 9. Non-Functional MVP Requirements
- All tests (including E2E) must pass locally and in CI before merging.
- JSON error responses without exposing stack traces.
- Rate limit AI endpoints (e.g., 10/min per user).
- CORS restricted to development and production origins.
- Secrets reside only on the server environment, never in clients.

## 10. Roles
- **Tugo:** AI endpoints and cache; web Hint/Explain integration; maintain clean server integrations.
- **Sandra:** `ReviewState` model, scheduler logic, `/reviews/next`, `/reviews/answer`.
- **Davor:** Swagger docs at `/docs`, `/stats/overview`, additional review tests.
- **Aisha:** Web app screens, auth flow, deck/card management, study UI.
- **Rony:** Mobile app screens, secure token storage, study flow with swipe/buttons.

## 11. Milestones (1-week Push)
1. Days 1–2: Implement `ReviewState`, review endpoints, SM-2 helper unit tests.
2. Day 3: Wire web study screen to review endpoints; display upcoming intervals.
3. Day 4: Build mobile study screen with auth and deck list.
4. Day 5: Finish AI hint/explain endpoints and cache; connect buttons in study UI.
5. Day 6: Add Swagger docs, seed script, deploy server and web.
6. Day 7: Polish UX, add stats widget, record README demo video.

## 12. Demo Script (3 Minutes)
1. Register and log in.
2. Create an "Algorithms" deck and add three cards.
3. Start studying, rate a few cards, and highlight the decreasing due count.
4. Request Hint and Explain on a difficult card and show caching on the second attempt.
5. Display the stats widget and `/docs` endpoint.
6. Open the mobile app, log in, and continue studying the same deck.
