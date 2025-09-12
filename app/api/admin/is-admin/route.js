import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "@/middleware/authAdmin";
export async function GET(request) {
    try{
        const {userId}=getAuth(request);
        const isAdmin=await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }


        return NextResponse.json({isAdmin});

    }catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}