import { getStore } from "@netlify/blobs";

export default async (request, context) => {
    const url = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";
    const ip = context.ip || "unknown";

    // 1. AUTOMATIC BOT REJECTION (Save Bandwidth & Logs)
    // We instantly block Headless Browsers, well-known crawlers, and scripts.
    const botPatterns = ["HeadlessChrome", "Puppeteer", "Crawl", "Bot", "Spider", "Lighthouse", "Scanning", "Audit"];
    const isBot = botPatterns.some(pattern => userAgent.includes(pattern));

    if (isBot) {
        console.log(`[FIREWALL] Blocked Bot: ${userAgent} from IP: ${ip}`);
        return new Response("Access Denied: Automated tools are not permitted on this resource.", { status: 403 });
    }

    // 2. IP BLACKLIST CHECK (Manual Banning)
    // Check if the current IP has been manually banned via the dashboard.
    try {
        const store = getStore("ip_blacklist");
        const isBanned = await store.get(ip);
        if (isBanned === "blocked") {
            console.log(`[FIREWALL] Blocked Blacklisted IP: ${ip}`);
            return new Response("Access Denied: Your IP has been permanently barred from this gateway.", { status: 403 });
        }
    } catch (e) {
        // Fallback: If Blobs fails at edge, continue but log error
        console.error("Blacklist check failed:", e);
    }

    // 3. SPECIAL REWRITE FOR /tos/* (Intranet Protection)
    if (url.pathname.startsWith("/tos/")) {
        const authCookie = context.cookies.get("calite_auth");
        if (authCookie !== "verified") {
            return Response.redirect(new URL("/", request.url), 302);
        }

        const nasTarget = Deno.env.get("NAS_URL") || "http://172.222.155.52:8181";
        const proxyUrl = new URL(url.pathname + url.search, nasTarget);
        return context.rewrite(proxyUrl);
    }

    // Continue to normal site (index.html, dashboard.html, etc.)
    return context.next();
};

export const config = {
    path: "/*" // This firewall protects the ENTIRE domain
};
