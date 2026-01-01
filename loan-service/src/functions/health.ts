import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * Health check endpoint for monitoring and load balancer probes.
 * Returns service status and metadata.
 */
async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("health: health check requested");

    return {
        status: 200,
        jsonBody: {
            status: "healthy",
            service: "loan-service",
            timestamp: new Date().toISOString(),
            version: "1.0.1",
        },
    };
}

app.http("health", {
    methods: ["GET"],
    route: "health",
    authLevel: "anonymous",
    handler,
});
