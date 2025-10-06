import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User.js";

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email in use" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });
    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    res.status(201).json({ token });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    res.json({ token });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}