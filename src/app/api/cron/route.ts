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
            // 智慧偵測：哪一格長得像時間，就用哪一格
            const isDate = (str: string) => str && (str.includes("-") || str.includes("/"));

            let dateStrCandidate = "";
            let statusCandidate = "";

            if (isDate(s.scheduledAt)) {
                dateStrCandidate = s.scheduledAt;
                statusCandidate = s.status;
            } else if (isDate(s.status)) {
                dateStrCandidate = s.status;
                statusCandidate = s.scheduledAt;
            } else {
                return false;
            }

            if (!statusCandidate || !dateStrCandidate) return false;

            const normalizedStatus = statusCandidate.trim().toLowerCase();
            if (normalizedStatus !== "pending") return false;

            // 處理時間格式，加入容錯
            try {
                const datePart = dateStrCandidate.replace(" ", "T").replace(/\//g, "-");
                const finalDateStr = datePart.includes("+") || datePart.includes("Z")
                    ? datePart
                    : (datePart.split(":").length === 2 ? datePart + ":00" : datePart) + "+08:00";

                const scheduledDate = new Date(finalDateStr);
                if (isNaN(scheduledDate.getTime())) return false;

                return scheduledDate <= now;
            } catch (e) {
                return false;
            }
        });

        for (const schedule of dueSchedules) {
            try {
                const lineId = groupMap[schedule.group] || schedule.group;

                // 記錄發送嘗試
                console.log(`Sending to lineId: [${lineId}], group: [${schedule.group}]`);

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

                results.push({ id: schedule.id, status: "success", lineId });
            } catch (err: any) {
                const errDetail = {
                    message: err.message,
                    statusCode: err.statusCode || err.code,
                    details: err.details || err.originalError?.details,
                };
                console.error(`Failed to send schedule ${schedule.id}:`, errDetail);

                // 關鍵修復：發送失敗也要更新狀態，防止下次再次重試造成 429 率限
                await updateScheduleStatus(schedule.id, "failed");

                await addHistory({
                    id: schedule.id,
                    group: schedule.group,
                    message: schedule.message,
                    status: "failed",
                    scheduledAt: schedule.scheduledAt,
                    sentAt: new Date().toISOString(),
                });

                results.push({ id: schedule.id, status: "failed", error: errDetail });
            }

        }

        return new NextResponse(JSON.stringify({
            serverTime: now.toISOString(),
            serverTimeLocal: now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            totalFound: schedules.length,
            processedCount: dueSchedules.length,
            debugSchedules: schedules.slice(0, 10).map((s: any) => ({
                id: s.id,
                group: s.group,
                time: s.scheduledAt,
                status: s.status,
                isDue: dueSchedules.some(d => d.id === s.id)
            })),
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
