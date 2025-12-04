// apps/server/src/controllers/authController.ts
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/User.js";
import { assertJwtEnv, signJwt } from "../utils/jwt.js";

function normEmail(raw: unknown) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}
function normName(raw: unknown) {
  return String(raw ?? "").trim();
}

export async function register(req: Request, res: Response) {
  try {
    // ensure JWT secret exists when the endpoint is actually used
    assertJwtEnv();

    const username = normName((req.body as any).username);
    const email = normEmail((req.body as any).email);
    const password = String((req.body as any).password ?? "");

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password too short (min 8)" });
    }

    const exists = await User.findOne({ email }).select("_id");
    if (exists) return res.status(409).json({ error: "Email in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });

    const token = signJwt({ sub: String(user._id), email: user.email });
    return res.status(201).json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
      },
    });
  } catch (e: any) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: "Email in use" });
    }
    return res.status(500).json({ error: e.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    // ensure JWT secret exists when the endpoint is actually used
    assertJwtEnv();

    const email = normEmail((req.body as any).email);
    const password = String((req.body as any).password ?? "");

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signJwt({ sub: String(user._id), email: user.email });
    return res.json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
