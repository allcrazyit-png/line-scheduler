import { NextResponse } from "next/server";
import { getHistory } from "@/lib/googleSheets";

export async function GET() {
    try {
        const history = await getHistory();
        return NextResponse.json(history);
    } catch (error: any) {
        console.error("GET /api/history error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
