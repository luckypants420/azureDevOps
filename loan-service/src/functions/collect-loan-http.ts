import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { collectLoan } from "../app/collect-loan";

export async function collectLoanHttpHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const id = request.params.id;

  try {
    const loan = await collectLoan(id);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      jsonBody: loan
    };
  } catch (err: any) {
    context.error("Error in collectLoanHttpHandler", err);
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

app.http("collect-loan", {
  methods: ["POST"],
  authLevel: "anonymous", // later: staff only
  route: "loans/{id}/collect",
  handler: collectLoanHttpHandler
});
