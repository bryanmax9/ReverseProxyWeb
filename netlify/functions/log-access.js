const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
    // Only accept POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const payload = JSON.parse(event.body);

        // Grab IP from Netlify's headers (fallback to x-forwarded-for if testing elsewhere)
        const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown';

        // Grab built-in Netlify Geolocation headers
        let geo = {
            city: event.headers['x-nf-geo-city'] || null,
            country: event.headers['x-nf-geo-country'] || null,
            latitude: event.headers['x-nf-geo-latitude'] || null,
            longitude: event.headers['x-nf-geo-longitude'] || null
        };

        // Construct the final log entry document
        const logEntry = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            ...payload,  // Browser GPS, UserAgent, Screen Size
            ip,          // Network IP
            geo,         // Edge Network inferred location
            receivedAt: new Date().toISOString()
        };

        // Get the Netlify Blob store named 'access_logs' and save the JSON
        const store = getStore("access_logs");
        await store.setJSON(logEntry.id, logEntry);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Logged effectively" })
        };
    } catch (error) {
        console.error("Failed to log access:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Internal Server Error",
                details: error.message
            })
        };
    }
};
