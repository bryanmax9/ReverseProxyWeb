import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { ip } = await req.json();
        if (!ip) return new Response("Missing IP", { status: 400 });

        // Add this IP to the blacklist store
        const store = getStore("ip_blacklist");
        await store.set(ip, "blocked"); // Simply set it as blocked

        return new Response(JSON.stringify({ success: true, message: `IP ${ip} blacklisted successfully` }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Operation Failed", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/.netlify/functions/add-to-blacklist"
};
