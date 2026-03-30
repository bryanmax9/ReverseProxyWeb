export default async (request, context) => {
    const url = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";
    const ip = context.ip || "unknown";

    // 1. STABLE BOT REJECTION
    const botPatterns = ["HeadlessChrome", "Puppeteer", "Crawl", "Bot", "Spider", "Lighthouse", "Scanning", "Audit"];
    const isBot = botPatterns.some(pattern => userAgent.includes(pattern));

    if (isBot) {
        return new Response("Access Denied: Automated tools are not permitted on this resource.", { status: 403 });
    }

    // 2. IP BLACKLIST (Hardcoded Fallback for stability)
    // We will move this to a more stable edge-compatible storage in Phase 2
    const manualBannedIps = ["3.80.56.19"]; // Add known bad IPs here for now
    if (manualBannedIps.includes(ip)) {
        return new Response("Access Denied: Your IP has been permanently barred.", { status: 403 });
    }

    // 3. SECURE PROXY FOR /tos/*
    if (url.pathname.startsWith("/tos/")) {
        const authCookie = context.cookies.get("calite_auth");
        if (authCookie !== "verified") {
            return Response.redirect(new URL("/", request.url), 302);
        }

        const nasTarget = Deno.env.get("NAS_URL") || "http://172.222.155.52:8181";
        const proxyUrl = new URL(url.pathname + url.search, nasTarget);
        return context.rewrite(proxyUrl);
    }

    return context.next();
};

export const config = {
    path: "/*"
};
