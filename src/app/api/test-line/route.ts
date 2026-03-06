import { NextResponse } from "next/server";
import { getLineClient } from "@/lib/line";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const client = getLineClient();

        // 嘗試呼叫 LINE API 取得機器人資訊，測試 Token 是否有效
        const botInfo = await client.getBotInfo();

        // 嘗試用群組 ID 推播測試，確保 pushMessage 有效
        const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

        return NextResponse.json({
            success: true,
            botInfo,
            tokenLength: token?.length,
            tokenPrefix: token?.substring(0, 20) + "...",
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message,
            statusCode: err.statusCode || err.code,
            details: err.details || err.originalError?.details,
        }, { status: 200 });
    }
}
