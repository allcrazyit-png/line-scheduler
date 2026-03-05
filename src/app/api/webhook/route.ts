import { NextResponse } from "next/server";
import { Client } from "@line/bot-sdk";

const client = new Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const events = body.events;

        for (const event of events) {
            // 當 Bot 被加入群組，或是有人在群組傳訊息給 Bot
            if (event.type === "message" || event.type === "join") {
                const groupId = event.source.groupId;

                if (groupId) {
                    // 自動回覆群組 ID
                    await client.replyMessage(event.replyToken, {
                        type: "text",
                        text: `您好！本群組的 ID 為：\n${groupId}\n\n請複製上方 ID 並貼回排程網頁的「管理群組」區塊。`,
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}
