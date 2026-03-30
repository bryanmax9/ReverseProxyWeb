export default async (request, context) => {
    // Check if the user has the 'calite_auth' cookie
    const authCookie = context.cookies.get("calite_auth");
    const url = new URL(request.url);

    // 1. Redirect to Welcome Page if NOT verified
    if (authCookie !== "verified") {
        const welcomeUrl = new URL("/", request.url);
        return Response.redirect(welcomeUrl, 302);
    }

    // 2. SECRET PROXY LOGIC (Phase 2 Ready)
    // We get the target from an Environment Variable to keep it hidden from the code
    const nasTarget = Deno.env.get("NAS_URL") || "http://172.222.155.52:8181";

    // Construct the private destination URL securely
    const proxyUrl = new URL(url.pathname + url.search, nasTarget);

    // This REWRITES the request on the server. 
    // The user's browser still sees 'caliteservicios.com/tos/...' 
    // but the content is fetched from the secret IP/Port.
    return context.rewrite(proxyUrl);
};

export const config = {
    path: "/tos/*"
};
