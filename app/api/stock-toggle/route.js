import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middleware/authSeller";


export async function POST(request){
    try{
        const {userId} = getAuth(request);
        const {productId}=await request.json();
        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        if(!productId){
            return NextResponse.json({error: "Product ID is required"}, {status: 400});
        }
        const storeId=await authSeller(userId);
        if(!storeId){
           return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const product=await prisma.product.findFirst({
            where:{id:productId, storeId:storeId}
        });
        if(!product){
            return NextResponse.json({error: "Product not found"}, {status: 404});
        }
        await prisma.product.update({
            where:{id:productId},
            data:{inStock: !product.inStock}
        });
        return NextResponse.json({message: "Product stock status toggled successfully"}, {status: 200});

    }catch(error){
        console.error(error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}