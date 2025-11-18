// src/functions/return-loan-http.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { returnLoan } from "../app/return-loan";

export async function returnLoanHttpHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const id = request.params.id;

  try {
    const loan = await returnLoan(id);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      jsonBody: loan
    };
  } catch (err: any) {
    context.error("Error in returnLoanHttpHandler", err);
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

app.http("return-loan", {
  methods: ["POST"],
  authLevel: "anonymous", // later: staff only
  route: "loans/{id}/return",
  handler: returnLoanHttpHandler
});
