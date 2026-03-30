const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
    try {
        // Security Check
        const authHeader = event.headers['authorization'];
        if (!authHeader || authHeader !== 'Bearer calite-admin-2026') {
            return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized access" }) };
        }

        const store = getStore("access_logs");

        // Ensure the store is queried safely
        const { blobs } = await store.list();

        const logs = [];
        if (blobs && blobs.length > 0) {
            for (const blob of blobs) {
                const data = await store.getJSON(blob.key);
                logs.push(data);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(logs)
        };
    } catch (error) {
        console.error("Failed to retrieve logs:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Internal Server Error",
                details: error.message,
                stack: error.stack
            })
        };
    }
};
