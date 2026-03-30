import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || authHeader !== 'Bearer calite-admin-2026') {
            return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 401 });
        }

        // Access logs automatically get injected Blobs context since this is a Netlify V2 function
        const store = getStore("access_logs");
        const { blobs } = await store.list();

        const logs = [];
        if (blobs && blobs.length > 0) {
            for (const blob of blobs) {
                const data = await store.get(blob.key, { type: 'json' });
                logs.push(data);
            }
        }

        return new Response(JSON.stringify(logs), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Failed to retrieve logs:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message, stack: error.stack }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/.netlify/functions/get-logs"
};
