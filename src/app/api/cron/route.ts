import { NextResponse } from "next/server";
import { getSchedules, updateScheduleStatus, updateScheduleDateTime, addHistory, getGroups } from "@/lib/googleSheets";
import { sendLineMessage } from "@/lib/line";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function calculateNextDate(currentDateStr: string, repeatType: string, repeatValue: string): string {
    const current = new Date(currentDateStr);
    if (isNaN(current.getTime())) return currentDateStr;

    const next = new Date(current);

    if (repeatType === "weekly") {
        const days = repeatValue.split(",").map(Number).sort((a, b) => a - b);
        const currentDay = next.getDay(); // 0 is Sunday
        let found = false;
        for (const d of days) {
            if (d > currentDay) {
                next.setDate(next.getDate() + (d - currentDay));
                found = true;
                break;
            }
        }
        if (!found) {
            const firstDay = days[0];
            next.setDate(next.getDate() + (7 - currentDay + firstDay));
        }
    } else if (repeatType === "monthly") {
        const targetDay = parseInt(repeatValue);
        next.setMonth(next.getMonth() + 1);
        next.setDate(targetDay);
        // 處理月份天數不足的情況
        if (next.getDate() !== targetDay) {
            next.setDate(0);
        }
    }

    return next.toISOString().split(".")[0];
}

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

            const datePart = s.scheduledAt.replace(" ", "T").replace(/\//g, "-");
            const finalDateStr = datePart.includes("+") || datePart.includes("Z")
                ? datePart
                : (datePart.split(":").length === 2 ? datePart + ":00" : datePart) + "+08:00";

            const scheduledDate = new Date(finalDateStr);
            if (isNaN(scheduledDate.getTime())) return false;

            return scheduledDate <= now;
        });

        for (const schedule of dueSchedules) {
            try {
                const lineId = groupMap[schedule.group] || schedule.group;
                console.log(`Sending to lineId: [${lineId}], group: [${schedule.group}]`);

                // 1. 發送 LINE
                await sendLineMessage(lineId, schedule.message);

                // 2. 判斷是否為週期性訊息
                if (schedule.repeatType && schedule.repeatType !== "none") {
                    // 計算下一次發送日期
                    const nextDate = calculateNextDate(schedule.scheduledAt, schedule.repeatType, schedule.repeatValue);
                    await updateScheduleDateTime(schedule.id, nextDate);
                    console.log(`Recurring schedule ${schedule.id} updated to ${nextDate}`);
                } else {
                    // 單次訊息：更新狀態為 sent
                    await updateScheduleStatus(schedule.id, "sent");
                }

                // 3. 寫入歷史紀錄
                await addHistory({
                    id: schedule.id,
                    group: schedule.group,
                    message: schedule.message,
                    status: "success",
                    scheduledAt: schedule.scheduledAt,
                    sentAt: new Date().toISOString(),
                });

                results.push({ id: schedule.id, status: "success", type: schedule.repeatType });
            } catch (err: any) {
                console.error(`Failed to send schedule ${schedule.id}:`, err.message);
                await updateScheduleStatus(schedule.id, "failed");
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

        return new NextResponse(JSON.stringify({
            serverTime: now.toISOString(),
            totalFound: schedules.length,
            processedCount: dueSchedules.length,
            results,
        }), {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Content-Type': 'application/json; charset=utf-8',
            },
        });
    } catch (error: any) {
        console.error("Cron API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
