import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "@/middleware/authAdmin";
import prisma from "@/lib/prisma";
export async function POST(request) {
    try{
        const {userId}=getAuth(request);
        const isAdmin=await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const {coupon}=await request.json();
        coupon.code=coupon.code.trim().toUpperCase();
       
        const existingCoupon=await prisma.coupon.findUnique({where:{code:coupon.code}});
        if(existingCoupon){
            return NextResponse.json({error:"Coupon code already exists"},{status:400});
        }
        const couponResult=await prisma.coupon.create({
            data: coupon
        });
        return NextResponse.json({couponResult,message:"Coupon created successfully"},{status:201});
    }catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}
export async function DELETE(request) {
    try{
        const {userId}=getAuth(request);
        const isAdmin=await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const {searchParams}=request.nextUrl;
        const code=searchParams.get("code");
        if(!code){
            return NextResponse.json({error:"Coupon ID is required"},{status:400});
        }
        const existingCoupon=await prisma.coupon.findUnique({where:{code}});
        if(!existingCoupon){
            return NextResponse.json({error:"Coupon not found"},{status:404});
        }
        await prisma.coupon.delete({where:{code}});
        return NextResponse.json({message:"Coupon deleted successfully"},{status:200});
    }catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }   
}
export async function GET(request) {
    try{
        const {userId}=getAuth(request);
        const isAdmin=await authAdmin(userId);
        if(!isAdmin){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const coupons=await prisma.coupon.findMany({
            orderBy:{createdAt:'desc'}
        });
        return NextResponse.json({coupons},{status:200});
    }catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}