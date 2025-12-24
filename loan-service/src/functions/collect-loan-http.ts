import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt.js";
import { hasRole } from "../auth/requireRole.js";
import { collectLoan } from "../app/collect-loan.js";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log("collect-loan: request received");

  const loanId = request.params.loanId;
  context.log(`collect-loan: loanId=${loanId}`);

  if (!loanId) {
    context.log("collect-loan: 400 missing loanId");
    return {
      status: 400,
      jsonBody: { error: "loanId route parameter is required" },
    };
  }

  const claims = await validateJwt(request);
  if (!claims) {
    context.log("collect-loan: 401 missing/invalid token");
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: missing or invalid token" },
    };
  }

  if (!hasRole(claims, "Staff")) {
    context.log(`collect-loan: 403 forbidden for sub=${claims.sub}`);
    return {
      status: 403,
      jsonBody: { error: "Forbidden: only staff can collect loans" },
    };
  }

  try {
    const updated = await collectLoan(loanId);
    context.log(`collect-loan: success loanId=${loanId} status=${updated.status}`);
    return {
      status: 200,
      jsonBody: updated,
    };
  } catch (err: any) {
    context.error(`collect-loan: failed loanId=${loanId}`, err);
    return {
      status: 500,
      jsonBody: { error: "Failed to collect loan" },
    };
  }
}

app.http("collect-loan-http", {
  methods: ["POST"],
  route: "loans/{loanId}/collect",
  authLevel: "anonymous",
  handler,
});
//created the Ci build and i made this comment to test it out