// src/functions/create-loan-http.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { createLoan } from "../app/create-loan";

export async function createLoanHttpHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as { userId: string; deviceModelId: string };
    const loan = await createLoan({
      userId: body.userId,
      deviceModelId: body.deviceModelId
    });

    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      jsonBody: loan
    };
  } catch (err: any) {
    context.error("Error in createLoanHttpHandler", err);
    return {
      status: 400,
      headers: { "Content-Type": "application/json" },
      jsonBody: {
        error: "Bad Request",
        message: err?.message ?? "Unknown error"
      }
    };
  }
}

app.http("create-loan", {
  methods: ["POST"],
  authLevel: "anonymous", // later: require auth
  route: "loans",
  handler: createLoanHttpHandler
});
