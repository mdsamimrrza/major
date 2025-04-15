import { NextRequest, NextResponse } from "next/server";
import { db } from '@/utils/db'
import { UserData } from "@/utils/schema";
import { eq } from "drizzle-orm";



export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    try {
        if (query === null) {
            return NextResponse.json({ "message": "Invalid query" });
        }
        const res = await db.select().from(UserData).where(eq(UserData.email, query));
        return NextResponse.json({ "message": "match found", res });
    } catch (error) {
        return NextResponse.json({ "message": "match not found" });
    }
}