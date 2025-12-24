import { createRemoteJWKSet, jwtVerify } from "jose";
import type { HttpRequest } from "@azure/functions";

const ISSUER = process.env.AUTH0_ISSUER;
const AUDIENCE = process.env.AUTH0_AUDIENCE;

if (!ISSUER || !AUDIENCE) {
  console.warn("⚠ Auth0 environment variables not set in Function App");
}

const JWKS = ISSUER ? createRemoteJWKSet(new URL(`${ISSUER}.well-known/jwks.json`)) : null;

export async function validateJwt(req: HttpRequest): Promise<any | null> {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return null;
    }

    const token = auth.substring("Bearer ".length);

    const { payload } = await jwtVerify(token, JWKS!, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload; // contains email, sub, roles, etc.
  } catch (err) {
    console.warn("JWT validation failed:", err);
    return null;
  }
}
