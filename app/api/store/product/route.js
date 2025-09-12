import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/middleware/authSeller";
import imagekit from "@/configs/imagekit";
export async function POST(request) {
    try{
        const {userId} = getAuth(request);
        const storeId=await authSeller(userId);
        if(!storeId){
           return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const formData=await request.formData();
        const name=formData.get("name");
        const description=formData.get("description");
        const mrp=Number( formData.get("mrp"));
        const price=Number( formData.get("price"));
        const category=formData.get("category");
        const images=formData.getAll("images");
        if(!name || !description || !mrp || !price || !category || images.length===0){
            return NextResponse.json({error: "All fields are required"}, {status: 400});
        }
        if(mrp<price){
            return NextResponse.json({error: "MRP should be greater than or equal to price"}, {status: 400});
        }
        const imagesURL=await Promise.all(
            images.map(async(image)=>{
                const buffer=Buffer.from(await image.arrayBuffer());
                const response=await imagekit.upload({
                    file: buffer,
                    fileName: `${Date.now()}-${image.name}`,
                    folder: "products"
                });
                const url=imagekit.url({filePath: response.filePath, transformation:[
                    { quality: "auto" },
                    {format : "webp"},
                    { width:'1024' }
                ]});
                return url;
            })
        );

        const product=await prisma.product.create({
            data:{
                name:name,
                description:description,
                mrp:mrp,
                price:price,
                category:category,
                images:imagesURL,
                storeId:storeId,
            }
        });
        return NextResponse.json({message: "Product created successfully", product}, {status: 201});
    }catch(error){
        console.error(error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}
export async function GET(request){
    try{
        const {userId} = getAuth(request);
        const storeId=await authSeller(userId);
        if(!storeId){
           return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const products=await prisma.product.findMany({
            where:{storeId:storeId},
            orderBy:{createdAt:"desc"}
        });
        return NextResponse.json({products}, {status: 200} );
    }
    catch(error){
        console.error(error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}