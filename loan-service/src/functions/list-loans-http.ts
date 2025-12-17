import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt";
import { hasRole } from "../auth/requireRole";
import { listLoansForUser } from "../app/list-loan";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log("list-loans: request received");

  const routeUserId = request.params.userId;
  context.log(`list-loans: target userId=${routeUserId}`);

  if (!routeUserId) {
    context.log("list-loans: 400 missing userId parameter");
    return {
      status: 400,
      jsonBody: { error: "userId route parameter is required" },
    };
  }

  const claims = await validateJwt(request);
  if (!claims) {
    context.log("list-loans: 401 missing/invalid token");
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: missing or invalid token" },
    };
  }

  context.log(`list-loans: caller sub=${claims.sub}`);

  const tokenUserId = claims.sub;
  const isStaff = hasRole(claims, "Staff");

  // students can only view their own loans
  if (!isStaff && tokenUserId !== routeUserId) {
    context.log("list-loans: 403 student tried to access other user's loans");
    return {
      status: 403,
      jsonBody: { error: "Forbidden: students may only view their own loans" },
    };
  }

  try {
    const loans = await listLoansForUser(routeUserId);
    context.log(`list-loans: success, count=${loans.length}`);
    return {
      status: 200,
      jsonBody: loans,
    };
  } catch (err: any) {
    context.error("list-loans: failed", err);
    return {
      status: 500,
      jsonBody: { error: "Failed to list loans" },
    };
  }
}

app.http("list-loans-http", {
  methods: ["GET"],
  route: "loans/user/{userId}",
  authLevel: "anonymous",
  handler,
});
