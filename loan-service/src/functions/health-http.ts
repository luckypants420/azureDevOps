import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function healthHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("health-http: ok", { invocationId: context.invocationId });

  return {
    status: 200,
    jsonBody: {
      status: "ok",
      service: "loan-service",
      time: new Date().toISOString(),
      invocationId: context.invocationId
    }
  };
}

app.http("health-http", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: healthHttp
});
