import { Client } from "@line/bot-sdk";

export function getLineClient() {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!token) {
        throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not defined");
    }

    return new Client({
        channelAccessToken: token,
    });
}

export async function sendLineMessage(to: string, message: string) {
    const client = getLineClient();

    try {
        await client.pushMessage(to, {
            type: "text",
            text: message,
        });
        return { success: true };
    } catch (error: any) {
        console.error("LINE sendMessage error:", error.details || error.message);
        throw error;
    }
}
