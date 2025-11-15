// test/ai.cache.test.ts
// 1) Hoisted module mock: must come BEFORE importing app/controllers
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("../src/services/aiService.js", () => {
  return {
    // stable async fns returning deterministic text; no network, no API key
    aiExplain: vi.fn(async () => "X"),
    aiHint: vi.fn(async () => "H"),
    // if something calls this by mistake, keep it stubbed too
    callLLM: vi.fn(async () => "X"),
  };
});

import request from "supertest";
import { createApp } from "../src/app.js";
import * as aiSvc from "../src/services/aiService.js"; // the mocked module
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
  // ensure tests never try to use a real key
  process.env.OPENAI_API_KEY = "ignored-in-tests";
  await setupTestDB();
  app = createApp();
  await auth();
});

afterAll(async () => {
  await teardownTestDB();
  vi.restoreAllMocks();
});

describe("AI cache", () => {
  it("hits model once, then uses cache", async () => {
    // we assert on the hoisted mock exported symbol
    const spy = aiSvc.aiExplain as unknown as ReturnType<typeof vi.fn>;

    // Use the TEXT branch so no ObjectId cast occurs
    const payload = { text: "Explain spaced repetition like I'm 20." };

    const r1 = await request(app)
      .post("/ai/explain")
      .set(headers)
      .send(payload);
    expect(r1.status).toBe(200);
    expect(r1.body).toMatchObject({ cached: false, text: "X" });

    const r2 = await request(app)
      .post("/ai/explain")
      .set(headers)
      .send(payload);
    expect(r2.status).toBe(200);
    expect(r2.body).toMatchObject({ cached: true, text: "X" });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
