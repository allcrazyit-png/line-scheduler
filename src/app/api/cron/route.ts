import { NextResponse } from "next/server";
import { getSchedules, updateScheduleStatus, addHistory } from "@/lib/googleSheets";
import { sendLineMessage } from "@/lib/line";

// 假設群組名稱對應到實際的 LINE Group ID/User ID
// 在實際應用中，管理群組功能應儲存此對應關係
const GROUP_ID_MAP: Record<string, string> = {
    "行銷團隊": "C00000000000000000000000000000001", // 範例 ID
    "Sales Department": "C00000000000000000000000000000002",
    "全體員工": "C00000000000000000000000000000003",
    "管理層": "C00000000000000000000000000000004",
    "技術部門": "C00000000000000000000000000000005",
};

export async function GET() {
    try {
        const schedules = await getSchedules();
        const now = new Date();
        const results = [];

        // 找出所有狀態為 pending 且時間已到的預約
        const dueSchedules = schedules.filter((s) => {
            if (s.status !== "pending") return false;
            const scheduledDate = new Date(s.scheduledAt.replace(" ", "T")); // 轉換格式以利解析
            return scheduledDate <= now;
        });

        for (const schedule of dueSchedules) {
            try {
                const lineId = GROUP_ID_MAP[schedule.group] || schedule.group; // 如果找不到對應則直接用 ID

                // 1. 發送 LINE
                await sendLineMessage(lineId, schedule.message);

                // 2. 更新狀態為 sent
                await updateScheduleStatus(schedule.id, "sent");

                // 3. 寫入歷史紀錄
                await addHistory({
                    id: schedule.id,
                    group: schedule.group,
                    message: schedule.message,
                    status: "success",
                    scheduledAt: schedule.scheduledAt,
                    sentAt: new Date().toISOString(),
                });

                results.push({ id: schedule.id, status: "success" });
            } catch (err: any) {
                console.error(`Failed to send schedule ${schedule.id}:`, err);

                // 失敗仍記錄，但可考慮重試邏輯
                await addHistory({
                    id: schedule.id,
                    group: schedule.group,
                    message: schedule.message,
                    status: "failed",
                    scheduledAt: schedule.scheduledAt,
                    sentAt: new Date().toISOString(),
                });

                results.push({ id: schedule.id, status: "failed", error: err.message });
            }
        }

        return NextResponse.json({
            processedCount: dueSchedules.length,
            results,
        });
    } catch (error: any) {
        console.error("Cron API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
