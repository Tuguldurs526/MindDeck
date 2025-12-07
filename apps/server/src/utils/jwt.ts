// src/utils/jwt.ts
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export function assertJwtEnv() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
}

export function signJwt(payload: object): string {
  const secret: Secret = process.env.JWT_SECRET as Secret;
  const opts: SignOptions = { algorithm: "HS256", expiresIn: "7d" };
  return jwt.sign(payload, secret, opts);
}
