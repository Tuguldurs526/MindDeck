import jwt from "jsonwebtoken";

const ALG: jwt.Algorithm = "HS256";
const ISS = process.env.JWT_ISSUER || "minddeck";
const AUD = process.env.JWT_AUDIENCE || "minddeck-clients";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

export function assertJwtEnv() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing. Set it in apps/server/.env");
  }
}

export function signJwt(payload: Record<string, unknown>) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    algorithm: ALG,
    expiresIn: EXPIRES_IN,
    issuer: ISS,
    audience: AUD,
  });
}
