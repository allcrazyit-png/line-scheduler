import { NextResponse } from "next/server";
import { addSchedule } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const testId = "TEST_" + Date.now();
        const testItem = {
            id: testId,
            group: "測試連線",
            message: "如果您在試算表中看到這一列，代表連線正確！",
            scheduledAt: new Date().toISOString(),
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        await addSchedule(testItem);

        return NextResponse.json({
            success: true,
            message: "已嘗試寫入測試資料",
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            testId
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message,
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        }, { status: 500 });
    }
}
