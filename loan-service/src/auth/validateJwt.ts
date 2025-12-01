import { createRemoteJWKSet, jwtVerify } from "jose";
import type { HttpRequest } from "@azure/functions";

const ISSUER = process.env.AUTH0_ISSUER;
const AUDIENCE = process.env.AUTH0_AUDIENCE;

if (!ISSUER || !AUDIENCE) {
  console.warn("⚠ AUTH0_ISSUER or AUTH0_AUDIENCE not set; JWT validation will fail.");
}

const JWKS = ISSUER
  ? createRemoteJWKSet(new URL(`${ISSUER}.well-known/jwks.json`))
  : null;

export interface AuthClaims {
  sub?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Validate JWT from Authorization header.
 * Returns claims payload if valid, or null if missing/invalid.
 */
export async function validateJwt(req: HttpRequest): Promise<AuthClaims | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring("Bearer ".length);

    const { payload } = await jwtVerify(token, JWKS!, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload as AuthClaims;
  } catch (err) {
    console.warn("JWT validation failed:", err);
    return null;
  }
}
