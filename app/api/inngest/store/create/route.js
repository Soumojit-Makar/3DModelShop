import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const username = formData.get("username");
    const description = formData.get("username");
    const contact = formData.get("username");
    const address = formData.get("username");
    if(!name || !email || !username || !description || !contact || !address){
        return  NextResponse.json({message: "missing store info"}, {status: 400});
    }
    const store=await prisma.store.findFirst({
        where: { userId: userId }
    })
    if(store){
        return  NextResponse.json( {status: store.status});
    }
    const isUsernameTaken=await prisma.store.findFirst({
        where: { username: username.toLowerCase() }
    })
    if(isUsernameTaken){
        return  NextResponse.json({error: "username already taken"}, {status: 400});
    }
    
  } catch (error) {
    console.log(error);
  }
}
