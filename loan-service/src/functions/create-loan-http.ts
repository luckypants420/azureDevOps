import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt.js";
import { hasRole } from "../auth/requireRole.js";
import { createLoan } from "../app/create-loan.js";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  // 1. Validate JWT
  const claims = await validateJwt(request);
  if (!claims) {
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: missing or invalid token" },
    };
  }

  context.log(`create-loan-http: user ${claims.sub} attempting to reserve device`);

  // 2. Check role = Student
  if (!hasRole(claims, "Student")) {
    return {
      status: 403,
      jsonBody: { error: "Forbidden: only students can create loans" },
    };
  }

  // 3. Use subject from token as userId
  const userId = claims.sub;
  if (!userId) {
    return {
      status: 400,
      jsonBody: { error: "Token does not contain subject (user id)" },
    };
  }

  // 4. Validate body
  const body = await request.json().catch(() => null) as any;
  const deviceModelId = body?.deviceModelId;
  if (!deviceModelId || typeof deviceModelId !== "string") {
    return {
      status: 400,
      jsonBody: { error: "deviceModelId is required" },
    };
  }

  try {
    context.log(`create-loan-http: creating loan for user ${userId} and device ${deviceModelId}`);

    const loan = await createLoan({ userId, deviceModelId });

    context.log(`create-loan-http: success, loanId=${loan.id}`);

    return {
      status: 201,
      jsonBody: loan,
    };
  } catch (err: any) {
    context.error("create-loan-http: failed", err);
    return {
      status: 500,
      jsonBody: { error: "Failed to create loan" },
    };
  }
}

app.http("create-loan-http", {
  methods: ["POST"],
  route: "loans",
  authLevel: "anonymous", // we handle JWT ourselves
  handler,
});
