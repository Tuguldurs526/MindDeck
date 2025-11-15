// test/decks_cards.e2e.test.ts
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { setupTestDB, teardownTestDB } from "./setup.js";

let app: ReturnType<typeof createApp>;
let headers: Record<string, string>;

async function auth() {
  const email = "tugo@test.com";
  const password = "Passw0rd!";
  await request(app)
    .post("/auth/register")
    .send({ username: "tugo", email, password })
    .catch(() => {});
  const res = await request(app).post("/auth/login").send({ email, password });
  headers = { Authorization: "Bearer " + res.body.token };
}

beforeAll(async () => {
  await setupTestDB();
  app = createApp();
  await auth();
});

afterAll(async () => {
  await teardownTestDB();
});

describe("Minddeck E2E", () => {
  it("health works", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "OK" });
  });

  it("Deck & Card CRUD with ownership + timestamps", async () => {
    const d = await request(app)
      .post("/decks")
      .set(headers)
      .send({ title: "Algorithms" });
    expect(d.status).toBe(201);
    const deckId = d.body._id;

    const c = await request(app)
      .post("/cards")
      .set(headers)
      .send({ front: "Q", back: "A", deckId });
    expect(c.status).toBe(201);
    const cardId = c.body._id;

    const list = await request(app).get(`/cards/${deckId}`).set(headers);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);

    const upd = await request(app)
      .put(`/cards/${cardId}`)
      .set(headers)
      .send({ back: "A+" });
    expect(upd.status).toBe(200);
    expect(upd.body.back).toBe("A+");
    expect(new Date(upd.body.updatedAt).getTime()).toBeGreaterThan(
      new Date(upd.body.createdAt).getTime()
    );

    const delCard = await request(app).delete(`/cards/${cardId}`).set(headers);
    expect(delCard.status).toBe(200);

    const delDeck = await request(app).delete(`/decks/${deckId}`).set(headers);
    expect(delDeck.status).toBe(200);

    const after = await request(app).get(`/cards/${deckId}`).set(headers);
    expect(after.status).toBe(403);
  });

  it("rejects invalid ids and duplicate deck title", async () => {
    const bad = await request(app).get("/decks/abc").set(headers);
    expect(bad.status).toBe(400);

    const r1 = await request(app)
      .post("/decks")
      .set(headers)
      .send({ title: "Dup" });
    expect(r1.status).toBe(201);
    const r2 = await request(app)
      .post("/decks")
      .set(headers)
      .send({ title: "Dup" });
    expect(r2.status).toBe(409);
  });
});
