import type { AuthClaims } from "./validateJwt";

/**
 * Claim name where roles are stored in the token.
 * Configure Auth0 to put roles in this custom claim.
 */
const CLAIM_NAME = "https://loans-app.da007/roles";

export function hasRole(claims: AuthClaims | null, requiredRole: string): boolean {
  if (!claims) return false;
  const roles = (claims[CLAIM_NAME] as string[]) || [];
  return Array.isArray(roles) && roles.includes(requiredRole);
}
