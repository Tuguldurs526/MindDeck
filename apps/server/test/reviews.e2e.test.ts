// apps/server/test/reviews.e2e.test.ts
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import Card from "../src/models/Card.js";
import { setupTestDB, teardownTestDB } from "./setup.js";

let app: ReturnType<typeof createApp>;
let headers: Record<string, string>;
let deckId: string;
let cardId: string;

async function auth() {
  const email = "reviewer@test.com";
  const password = "Passw0rd!";
  await request(app)
    .post("/auth/register")
    .send({ username: "rev", email, password })
    .catch(() => {});
  const res = await request(app).post("/auth/login").send({ email, password });
  headers = { Authorization: "Bearer " + res.body.token };
}

describe("Reviews E2E (SM-2)", () => {
  beforeAll(async () => {
    await setupTestDB();
    app = createApp();
    await auth();

    // create deck and card
    const d = await request(app)
      .post("/decks")
      .set(headers)
      .send({ title: "SRS Deck" });
    deckId = d.body.id || d.body._id;

    const c = await request(app)
      .post("/cards")
      .set(headers)
      .send({
        deckId,
        front: "What is Big-O of binary search?",
        back: "O(log n)",
      });
    cardId = c.body.id || c.body._id;

    // force card due now for queue
    await Card.updateOne(
      { _id: new mongoose.Types.ObjectId(cardId) },
      {
        $set: {
          "sm2.due": new Date(),
          "sm2.reps": 0,
          "sm2.interval": 0,
          "sm2.ef": 2.5,
        },
      }
    );
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("returns due cards in queue", async () => {
    const res = await request(app).get("/reviews/queue?limit=10").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.items[0]._id).toBeDefined();
  });

  it("advances SM-2 on correct answer", async () => {
    const res1 = await request(app)
      .post("/reviews/answer")
      .set(headers)
      .send({ cardId, quality: 4 });
    expect(res1.status).toBe(200);
    expect(res1.body.updated).toBe(true);
    expect(res1.body.sm2.reps).toBeGreaterThanOrEqual(1);
    expect(res1.body.sm2.interval).toBeGreaterThanOrEqual(1);

    const res2 = await request(app)
      .post("/reviews/answer")
      .set(headers)
      .send({ cardId, quality: 5 });
    expect(res2.status).toBe(200);
    expect(res2.body.sm2.reps).toBeGreaterThanOrEqual(2);
    expect(res2.body.sm2.interval).toBeGreaterThanOrEqual(6); // SM-2 step 2 defaults to 6 days
  });

  it("resets on failure quality", async () => {
    // make card due again first
    await Card.updateOne(
      { _id: new mongoose.Types.ObjectId(cardId) },
      { $set: { "sm2.due": new Date() } }
    );

    const res = await request(app)
      .post("/reviews/answer")
      .set(headers)
      .send({ cardId, quality: 1 });
    expect(res.status).toBe(200);
    expect(res.body.sm2.reps).toBe(0);
    expect(res.body.sm2.interval).toBe(1);
  });
});
