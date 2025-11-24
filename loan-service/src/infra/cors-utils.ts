/**
 * Add simple CORS headers to HTTP responses returned by Azure Functions.
 * Keep it minimal for dev; in production prefer restricting origins.
 */

export function withCorsHeaders(response: any): any {
    return {
        ...response,
        headers: {
            ...(response.headers || {}),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    };
}
