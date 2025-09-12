import { auth, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middleware/authSeller";
export async function GET(request){
    try{
        const {userId}=getAuth(request);
        const isSeller= await authSeller(userId);
        if(!isSeller){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const storeInfo= await prisma.store.findUnique({
            where:{userId: userId},
        });
        return NextResponse.json(isSeller,storeInfo);
    }catch(error){
        console.error(error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}