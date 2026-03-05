import { NextResponse } from "next/server";
import { getSchedules, updateScheduleStatus, addHistory, getGroups } from "@/lib/googleSheets";
import { sendLineMessage } from "@/lib/line";

export async function GET() {
    try {
        const [schedules, groups] = await Promise.all([
            getSchedules(),
            getGroups()
        ]);

        const groupMap: Record<string, string> = {};
        groups.forEach(g => {
            groupMap[g.name] = g.id;
        });

        const now = new Date();
        const results = [];

        // 找出所有狀態為 pending 且時間已到的預約
        const dueSchedules = schedules.filter((s) => {
            if (s.status !== "pending") return false;

            // 處理時間格式：2026-03-05 22:15 -> 2026-03-05T22:15:00
            // 這裡強烈建議補上秒數秒與本地時區偏置或是直接用原生 Date 解析
            const dateStr = s.scheduledAt.replace(" ", "T");
            const scheduledDate = new Date(dateStr);

            // 加入 Debug 資訊
            console.log(`Checking [${s.id}] ${s.group}: Scheduled=${scheduledDate.toISOString()}, Now=${now.toISOString()}`);

            return scheduledDate <= now;
        });

        for (const schedule of dueSchedules) {
            try {
                const lineId = groupMap[schedule.group] || schedule.group; // 如果找不到對應則直接用 ID

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
            now: now.toISOString(),
            foundCount: schedules.length,
            processedCount: dueSchedules.length,
            dueSchedules: dueSchedules.map(s => ({ id: s.id, group: s.group, time: s.scheduledAt })),
            results,
        });
    } catch (error: any) {
        console.error("Cron API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
