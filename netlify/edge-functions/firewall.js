export default async (request, context) => {
    try {
        const url = new URL(request.url);
        const userAgent = request.headers.get("user-agent") || "";
        // Safely get IP with fallback
        const ip = context.ip || request.headers.get("x-nf-client-connection-ip") || "unknown";

        // 1. AUTOMATIC BOT REJECTION
        const botPatterns = ["HeadlessChrome", "Puppeteer", "Crawl", "Bot", "Spider", "Lighthouse", "Scanning", "Audit"];
        const isBot = botPatterns.some(pattern => {
            try { return userAgent.includes(pattern); } catch (e) { return false; }
        });

        // Don't block if they are trying to reach the dashboard (unless it's a bot)
        if (isBot && !url.pathname.includes("dashboard")) {
            return new Response("Access Denied: Automated tools are not permitted on this resource.", { status: 403 });
        }

        // 2. IP BLACKLIST 
        const manualBannedIps = ["3.80.56.19", "18.212.235.213"]; // Added newest Ashburn scanner from logs
        if (manualBannedIps.includes(ip)) {
            return new Response("Access Denied: Your IP has been permanently barred.", { status: 403 });
        }

        // 3. SECURE PROXY FOR /tos/*
        if (url.pathname.startsWith("/tos/")) {
            // Safely check cookies
            let authCookie = null;
            try {
                authCookie = context.cookies.get("calite_auth");
            } catch (e) { /* ignore cookie errors */ }

            if (authCookie !== "verified") {
                // Use a string-based redirect to be safer
                return Response.redirect(url.origin + "/", 302);
            }

            const nasTarget = Deno.env.get("NAS_URL") || "http://172.222.155.52:8181";

            // Ultra-safe URL joining
            const cleanPath = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
            const baseWithSlash = nasTarget.endsWith("/") ? nasTarget : nasTarget + "/";
            const proxyUrl = new URL(cleanPath + url.search, baseWithSlash);

            return context.rewrite(proxyUrl.toString());
        }

        // Continue to normal site (index.html, dashboard.html, etc.)
        return context.next();
    } catch (err) {
        // If it still crashes, we show exactly why!
        return new Response(`Security Firewall Error: ${err.message}`, { status: 500 });
    }
};

export const config = {
    path: "/*"
};
