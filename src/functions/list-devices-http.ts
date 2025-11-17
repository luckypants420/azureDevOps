// src/functions/list-devices-http.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listDevices } from "../app/list-devices";

export async function listDevicesHttpHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Handling GET /devices");

  try {
    const devices = await listDevices();

    return {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      jsonBody: devices
    };
  } catch (err: any) {
    context.error("Error in listDevicesHttpHandler", err);

    return {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
      jsonBody: {
        error: "Internal Server Error",
        message: err?.message ?? "Unknown error"
      }
    };
  }
}

// Register function with Azure Functions runtime
app.http("list-devices", {
  methods: ["GET"],
  authLevel: "anonymous",   // later you can change to "function" / add auth
  route: "devices",
  handler: listDevicesHttpHandler
});
