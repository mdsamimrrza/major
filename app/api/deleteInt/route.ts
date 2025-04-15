import { NextRequest, NextResponse } from "next/server";
import { db } from '@/utils/db'
import { InterpData } from "@/utils/schema";
import { eq } from "drizzle-orm";


export async function DELETE(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    if (!query) {
        return NextResponse.json({ "message": "Invalid query parameter" });
    }
    try {
        const res = await db.delete(InterpData).where(eq(InterpData.id, query));
        if(res.rowCount > 0){return NextResponse.json({ "message": "deleted" });}
        else {
            return NextResponse.json({ "message": "not deleted" });
        }
    } catch (error) {
        return NextResponse.json({ "message": "not deleted" });
    }
}