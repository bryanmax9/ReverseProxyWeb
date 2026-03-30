const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
    // Security Check: simple hardcoded bearer token to protect the dashboard endpoint
    const authHeader = event.headers['authorization'];
    if (!authHeader || authHeader !== 'Bearer calite-admin-2026') {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized access" }) };
    }

    try {
        const store = getStore("access_logs");
        const { blobs } = await store.list();

        const logs = [];
        // Fetch the data for each log blob
        for (const blob of blobs) {
            const data = await store.getJSON(blob.key);
            logs.push(data);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(logs)
        };
    } catch (error) {
        console.error("Failed to retrieve logs:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};
