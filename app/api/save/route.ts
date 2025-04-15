import { NextRequest, NextResponse } from "next/server";
import { db } from '@/utils/db'
import { UserData } from "@/utils/schema";
import { eq } from "drizzle-orm";


export async function POST(req: NextRequest) {
    const formdata = await req.json();
    try {
        const res = await db.insert(UserData).values({ 
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
        const res = await db.update(UserData).set({ 
            code: formdata.code,
         }).where(eq(UserData.id, formdata.id));
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
        const res = await db.select().from(UserData).where(eq(UserData.id, query)); //retuns an array------>length=0-->false 

        if (res.length > 0) {
            return NextResponse.json({"message": "match found" , res});
        } else {
            return NextResponse.json({"message": "match not found"});
        }
    } else {
        return NextResponse.json({"message": "invalid query"});
    }
}