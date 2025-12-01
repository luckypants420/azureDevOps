import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt";
import { hasRole } from "../auth/requireRole";
import { getLoanRepo } from "../config/appServices";
// import { collectLoanUseCase } from "../app/collect-loan-usecase";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const claims = await validateJwt(request);
  if (!claims) {
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: missing or invalid token" },
    };
  }

  if (!hasRole(claims, "staff")) {
    return {
      status: 403,
      jsonBody: { error: "Forbidden: only staff can collect loans" },
    };
  }

  const loanId = request.params.loanId;
  if (!loanId) {
    return {
      status: 400,
      jsonBody: { error: "loanId route parameter is required" },
    };
  }

  try {
    const loanRepo = getLoanRepo();
    // const collectLoan = collectLoanUseCase({ loanRepo });
    // const updated = await collectLoan({ loanId });

    const updated = { loanId, status: "collected" }; // TEMP stub

    return {
      status: 200,
      jsonBody: updated,
    };
  } catch (err: any) {
    context.error("Error collecting loan:", err);
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
