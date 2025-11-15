import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import Card from "../src/models/Card.js";
import Deck from "../src/models/Deck.js";
import User from "../src/models/User.js";
import * as aiSvc from "../src/services/aiService.js";
import "./setup-env";
import { setupTestDB, teardownTestDB } from "./setup.js";

describe("AI cache", () => {
  let app: any, token: string, cardId: string;

  beforeAll(async () => {
    await setupTestDB();
    // create minimal app or import { app } if exported from index.ts
    app = (await import("../src/index.js")).app;

    const u = await User.create({
      username: "t",
      email: "t@t.com",
      passwordHash: "x",
    });
    const d = await Deck.create({ title: "T", user: u._id });
    const c = await Card.create({ front: "F", back: "B", deck: d._id });
    cardId = c._id.toString();

    // mint a JWT however your tests already do it; or hit /auth/register/login
    // For brevity, skip auth trick here if your test helpers exist.
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("hits model once, then uses cache", async () => {
    const spy = vi.spyOn(aiSvc, "callLLM").mockResolvedValue("X");

    const headers = {}; // fill with Authorization if your route requires it

    await request(app).post("/ai/explain").set(headers).send({ cardId });
    await request(app).post("/ai/explain").set(headers).send({ cardId });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
