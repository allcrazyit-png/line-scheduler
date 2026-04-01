import { Client } from "@line/bot-sdk";
import dotenv from "dotenv";

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

        const realGroupId = "C4efdc841c0dd59e08685c02d3917c631";
        console.log(`Attempting to send a dummy message to group ID [${realGroupId}]...`);

        await client.pushMessage(realGroupId, {
            type: "text",
            text: "Testing 429 from local machine",
        });
        console.log("SUCCESS! Message sent.");

    } catch (err: any) {
        if (err.statusCode) {
            console.error(`Received API Error ${err.statusCode}:`, err.statusMessage);
            console.error(err.originalError?.response?.data || err.message);
        } else {
            console.error("Unknown error:", err);
        }
    }
}

run();
