import { NextRequest, NextResponse } from "next/server";
import { db } from '@/utils/db'
import { InterpData } from "@/utils/schema";
import { eq } from "drizzle-orm";


export async function POST(req: NextRequest) {
    const formdata = await req.json();
    try {
        const res = await db.insert(InterpData).values({ 
            id: formdata.id,
            code: formdata.code,
            email: formdata.email
         })
         if(res){
            return NextResponse.json({ message: "Data saved successfully" });
         }
        
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ message: err });
    }
}

export async function PUT(req: NextRequest) {
    const formdata = await req.json();
    try {
        const res = await db.update(InterpData).set({ 
            code: formdata.code,
         }).where(eq(InterpData.id, formdata.id));
         if(res){
            return NextResponse.json({ message: "Data updated successfully" });
         }
        
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ message: err });
    }
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (query) {
        const res = await db.select().from(InterpData).where(eq(InterpData.id, query));

        if (res.length > 0) {
            return NextResponse.json({"message": "match found" , res});
        } else {
            return NextResponse.json({"message": "match not found"});
        }
    } else {
        return NextResponse.json({"message": "invalid query"});
    }
}