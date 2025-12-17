import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt";
import { hasRole } from "../auth/requireRole";
import { returnLoan } from "../app/return-loan";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log("return-loan: request received");

  const loanId = request.params.loanId;
  context.log(`return-loan: loanId=${loanId}`);

  if (!loanId) {
    context.log("return-loan: 400 missing loanId");
    return {
      status: 400,
      jsonBody: { error: "loanId route parameter is required" },
    };
  }

  const claims = await validateJwt(request);
  if (!claims) {
    context.log("return-loan: 401 missing/invalid token");
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: missing or invalid token" },
    };
  }

  if (!hasRole(claims, "Staff")) {
    context.log(`return-loan: 403 forbidden for sub=${claims.sub}`);
    return {
      status: 403,
      jsonBody: { error: "Forbidden: only staff can return loans" },
    };
  }

  try {
    const updated = await returnLoan(loanId);
    context.log(`return-loan: success loanId=${loanId} status=${updated.status}`);
    return {
      status: 200,
      jsonBody: updated,
    };
  } catch (err: any) {
    context.error(`return-loan: failed loanId=${loanId}`, err);
    return {
      status: 500,
      jsonBody: { error: "Failed to return loan" },
    };
  }
}

app.http("return-loan-http", {
  methods: ["POST"],
  route: "loans/{loanId}/return",
  authLevel: "anonymous",
  handler,
});
