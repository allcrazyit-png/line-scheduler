import { NextResponse } from "next/server";
import { getGroups, addGroup } from "@/lib/googleSheets";

export async function GET() {
    try {
        const groups = await getGroups();
        return NextResponse.json(groups);
    } catch (error) {
        console.error("GET /api/groups error:", error);
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, id } = body;

        if (!name || !id) {
            return NextResponse.json({ error: "Name and ID are required" }, { status: 400 });
        }

        await addGroup({ name, id });
        return NextResponse.json({ success: true, group: { name, id } });
    } catch (error) {
        console.error("POST /api/groups error:", error);
        return NextResponse.json({ error: "Failed to add group" }, { status: 500 });
    }
}
