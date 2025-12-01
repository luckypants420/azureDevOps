import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { validateJwt } from "../auth/validateJwt";
import { hasRole } from "../auth/requireRole";
import { getLoanRepo } from "../config/appServices";
// TODO: adjust this import to your actual use-case function
// import { createLoanUseCase } from "../app/create-loan-usecase";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  // 1. Validate JWT
  const claims = await validateJwt(request);
  if (!claims) {
    return {
      status: 401,
      jsonBody: { error: "Unauthorized: missing or invalid token" },
    };
  }

  // 2. Check role = student
  if (!hasRole(claims, "student")) {
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
    const loanRepo = getLoanRepo();

    // TODO: replace with your real use case call
    // const createLoan = createLoanUseCase({ loanRepo });
    // const result = await createLoan({ userId, deviceModelId });

    // TEMP stub – remove once you wire real use case:
    const result = {
      id: "temporary-id",
      userId,
      deviceModelId,
      status: "reserved",
      reservedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return {
      status: 201,
      jsonBody: result,
    };
  } catch (err: any) {
    context.error("Error creating loan:", err);
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
