import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const payload = await req.json();
        const ip = context.ip || req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'unknown';

        let geoData = {
            city: context.geo?.city || req.headers.get('x-nf-geo-city') || null,
            country: context.geo?.country?.name || req.headers.get('x-nf-geo-country') || null,
            latitude: context.geo?.latitude || req.headers.get('x-nf-geo-latitude') || null,
            longitude: context.geo?.longitude || req.headers.get('x-nf-geo-longitude') || null,
            timezone: context.geo?.timezone || null
        };

        let backendIpGeo = null;
        if (ip !== 'unknown') {
            try {
                const res = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
                if (res.ok) backendIpGeo = await res.json();
            } catch (e) { }
        }

        const logEntry = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            ...payload,
            ip,
            geo: geoData,
            backendIpGeo: backendIpGeo,
            receivedAt: new Date().toISOString()
        };

        // Access logs automatically get injected Blobs context since this is a Netlify V2 function
        const store = getStore("access_logs");
        await store.setJSON(logEntry.id, logEntry);

        return new Response(JSON.stringify({ success: true, message: "Logged effectively" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Failed to log access:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/.netlify/functions/log-access"
};
