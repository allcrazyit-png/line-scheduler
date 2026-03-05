import { NextResponse } from "next/server";
import { deleteGroup } from "@/lib/googleSheets";

export async function DELETE(
    req: Request,
    { params }: { params: { name: string } }
) {
    try {
        const name = decodeURIComponent(params.name);
        await deleteGroup(name);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/groups/[name] error:", error);
        return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }
}
