import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import * as aiSvc from "../src/services/aiService.js";
import { setupTestDB, teardownTestDB } from "./setup.js";

let app: ReturnType<typeof createApp>;
let headers: Record<string, string>;

async function auth() {
  const email = "tugo@test.com";
  const password = "Passw0rd!";
  await request(app)
    .post("/auth/register")
    .send({ username: "t", email, password })
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

describe("AI cache", () => {
  it("hits model once, then uses cache", async () => {
    const spy = vi.spyOn(aiSvc, "callLLM").mockResolvedValue("X");

    // text flow
    const r1 = await request(app)
      .post("/ai/explain")
      .set(headers)
      .send({ text: "What is Big-O?" });
    expect(r1.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);

    const r2 = await request(app)
      .post("/ai/explain")
      .set(headers)
      .send({ text: "What is Big-O?" });
    expect(r2.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);

    // hint flow should also cache
    const deck = await request(app)
      .post("/decks")
      .set(headers)
      .send({ title: "D" });
    const card = await request(app)
      .post("/cards")
      .set(headers)
      .send({
        deckId: deck.body.id ?? deck.body._id ?? deck.body.data?._id,
        front: "2+2?",
        back: "4",
      });

    const h1 = await request(app)
      .post("/ai/hint")
      .set(headers)
      .send({ cardId: card.body.id ?? card.body._id });
    expect(h1.status).toBe(200);
    const callsAfterHint1 = spy.mock.calls.length;

    const h2 = await request(app)
      .post("/ai/hint")
      .set(headers)
      .send({ cardId: card.body.id ?? card.body._id });
    expect(h2.status).toBe(200);
    expect(spy.mock.calls.length).toBe(callsAfterHint1); // no extra call

    spy.mockRestore();
  }, 20_000);
});
