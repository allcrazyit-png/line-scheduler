import { NextResponse } from "next/server";
import { getSchedules, addSchedule } from "@/lib/googleSheets";

export async function GET() {
    try {
        const schedules = await getSchedules();
        return NextResponse.json(schedules);
    } catch (error: any) {
        console.error("GET /api/schedule error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { group, message, scheduledAt } = body;

        if (!group || !message || !scheduledAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newItem = {
            id: Date.now().toString(),
            group,
            message,
            scheduledAt,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        await addSchedule(newItem);
        return NextResponse.json(newItem);
    } catch (error: any) {
        console.error("POST /api/schedule error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
