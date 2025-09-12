import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "@/middleware/authAdmin";
export async function POST(request) {
    try{
        const {userId}=getAuth(request);
        const isAdmin=await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
       const {storeId}=await request.json();
       if(!storeId){
        return NextResponse.json({error:"Store ID is required"},{status:400});
       }
       const store=await prisma.store.findUnique({where:{id:storeId}});
       if(!store){
        return NextResponse.json({error:"Store not found"},{status:404});
       }
       await prisma.store.update({
        where:{id:storeId},
        data:{isActive:!store.isActive}
       });
       return NextResponse.json({message:"Store status updated successfully"},{status:200});
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}