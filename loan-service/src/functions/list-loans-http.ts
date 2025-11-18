// src/functions/list-loans-http.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { listLoansForUser } from "../app/list-loan";

export async function listLoansHttpHandler(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    const userId = request.params.userId;

    try {
        const loans = await listLoansForUser(userId);
        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            jsonBody: loans
        };
    } catch (err: any) {
        context.error("Error in listLoansHttpHandler", err);
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

app.http("list-loans-for-user", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "loans/user/{userId}",
    handler: listLoansHttpHandler
});
