import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt";
import { hasRole } from "../auth/requireRole";
import { getLoanRepo } from "../config/appServices";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const claims = await validateJwt(request);
  if (!claims) {
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: missing or invalid token" },
    };
  }

  const routeUserId = request.params.userId;
  if (!routeUserId) {
    return {
      status: 400,
      jsonBody: { error: "userId route parameter is required" },
    };
  }

  const tokenUserId = claims.sub;
  const isStaff = hasRole(claims, "Staff");

  // students can only view their own loans
  if (!isStaff && tokenUserId !== routeUserId) {
    return {
      status: 403,
      jsonBody: { error: "Forbidden: students may only view their own loans" },
    };
  }

  try {
    const loanRepo = getLoanRepo();

    // const listLoansForUser = listLoansForUserUseCase({ loanRepo });
    // const loans = await listLoansForUser({ userId: routeUserId });
//temp
    const loans: any[] = [];

    return {
      status: 200,
      jsonBody: loans,
    };
  } catch (err: any) {
    context.error("Error listing loans:", err);
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
