import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "@/middleware/authAdmin";

export async function GET(request) {
    try{
        const {userId}=getAuth(request);
        const isAdmin=await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const orders=await prisma.order.count();

        const stores=await prisma.store.count();
        const allOrders=await prisma.order.findMany({
            select:{
                createdAt:true,
                total:true
            }
        });
        let totalRevenue=0;
        allOrders.forEach(order=>{
            totalRevenue+=order.total;
        });
        const revenue=totalRevenue.toFixed(2);
        const products=await prisma.product.count();
        const dashboardData={
            orders,
            stores,
            revenue,
            products,
            allOrders
        };
        return NextResponse.json({dashboardData},{status:200});
        
    }   
    catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}

