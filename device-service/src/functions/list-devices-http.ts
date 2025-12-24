import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listDevices } from "../app/list-devices.js";

export async function listDevicesHttpHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("list-devices: request received");

  try {
    const devices = await listDevices();
    context.log(`list-devices: success count=${devices.length}`);
    return {
      status: 200,
      jsonBody: devices
    };
  } catch (err: any) {
    context.error("list-devices: failed", err);
    return {
      status: 500,
      jsonBody: { error: "Failed to list devices" }
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

