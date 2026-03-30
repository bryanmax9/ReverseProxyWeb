export default async (request, context) => {
    const url = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";

    // 1. FAST BOT REJECTION
    if (userAgent.includes("HeadlessChrome") || userAgent.includes("Bot") || userAgent.includes("Crawl") || userAgent.includes("Spider")) {
        return new Response("Access Denied: Automated tools are not permitted.", { status: 403 });
    }

    // 2. Mandatory Gateway for /tos/*
    if (url.pathname.startsWith("/tos/")) {
        const cookies = request.headers.get("cookie") || "";
        if (!cookies.includes("calite_auth=verified")) {
            return Response.redirect(new URL("/", request.url), 302);
        }

        // Return context.next() and let the netlify.toml redirect pick it up!
        return context.next();
    }

    // Default Site (index.html, dashboard.html)
    return context.next();
};

export const config = {
    path: ["/tos/*", "/"] // Watch the NAS and the Home for bots
};
