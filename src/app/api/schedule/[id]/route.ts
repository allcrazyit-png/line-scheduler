import { NextResponse } from "next/server";
import { deleteSchedule } from "@/lib/googleSheets";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        await deleteSchedule(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/schedule/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
