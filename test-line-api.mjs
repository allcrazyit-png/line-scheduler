import { Client } from "@line/bot-sdk";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
if (!token) {
    console.error("No LINE_CHANNEL_ACCESS_TOKEN found in .env.local");
    process.exit(1);
}

const client = new Client({
    channelAccessToken: token,
});

async function run() {
    try {
        console.log("Checking Bot Info...");
        const botInfo = await client.getBotInfo();
        console.log("Bot Info:", botInfo);

        // We use a dummy user ID or group ID to test
        // Since we don't know a valid ID, we might get a 400 Bad Request, but NOT a 429 if rate limit is the issue.
        // Wait, let's look up the group ID from google_sheets directly or just try a dummy and see if it returns 429 or 400.
        console.log("Attempting to send a dummy message...");
        await client.pushMessage("dummy_id_to_trigger_error", {
            type: "text",
            text: "Testing 429",
        });

    } catch (err) {
        if (err.statusCode) {
            console.error(`Received API Error ${err.statusCode}:`, err.statusMessage);
            console.error(err.originalError?.response?.data || err.message);
        } else {
            console.error("Unknown error:", err);
        }
    }
}

run();
