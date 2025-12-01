import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt";
import { hasRole } from "../auth/requireRole";
import { getLoanRepo } from "../config/appServices";
// import { returnLoanUseCase } from "../app/return-loan-usecase";

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
      jsonBody: { error: "Forbidden: only staff can return loans" },
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
    // const returnLoan = returnLoanUseCase({ loanRepo });
    // const updated = await returnLoan({ loanId });

    const updated = { loanId, status: "returned" }; // TEMP stub

    return {
      status: 200,
      jsonBody: updated,
    };
  } catch (err: any) {
    context.error("Error returning loan:", err);
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
