import { NextResponse } from "next/server";
import { getSchedules, updateScheduleStatus, addHistory, getGroups } from "@/lib/googleSheets";
import { sendLineMessage } from "@/lib/line";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const [schedules, groups] = await Promise.all([
            getSchedules(),
            getGroups()
        ]);

        const groupMap: Record<string, string> = {};
        groups.forEach((g: any) => {
            groupMap[g.name] = g.id;
        });

        const now = new Date();
        const results = [];

        // 找出所有狀態為 pending 且時間已到的預約
        const dueSchedules = schedules.filter((s: any) => {
            if (s.status !== "pending") return false;

            // 修正時區：強制加上台灣時區 +08:00
            const dateStr = s.scheduledAt.replace(" ", "T") + ":00+08:00";
            const scheduledDate = new Date(dateStr);

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

        const allPending = schedules.filter((s: any) => s.status === "pending");

        return new NextResponse(JSON.stringify({
            processedCount: dueSchedules.length,
            results,
        }), {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error("Cron API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
