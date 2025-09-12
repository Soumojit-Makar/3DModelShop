import imagekit from "@/configs/imagekit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { err } from "inngest/types";
import { NextResponse } from "next/server";
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const username = formData.get("username");
    const description = formData.get("description");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");
    if (!name || !email || !username || !description || !contact || !address) {
      return NextResponse.json(
        { message: "missing store info" },
        { status: 400 }
      );
    }
    const store = await prisma.store.findFirst({
      where: { userId: userId },
    });
    if (store) {
      return NextResponse.json({ status: store.status });
    }
    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase() },
    });
    if (isUsernameTaken) {
      return NextResponse.json(
        { error: "username already taken" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await image.arrayBuffer());
    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "/logos",
    });
    const optimizedImage = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });
    const newStore = await prisma.store.create({
      data: {
        userId: userId,
        name: name,
        email: email,
        description: description,
        username: username.toLowerCase(),
        contact: contact,
        address: address,
        logo: optimizedImage,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { store: { connect: { id: newStore.id } } },
    });
    return NextResponse.json({
      message: "Application submitted successfully! waiting for approval",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message|| "Something went wrong" }, { status: 500 });
  }
}
export async function GET(request) {
  try {
    const {userId} = getAuth(request);
    if(!userId) return NextResponse.json({error:"Unauthorized"},{status:401});
    const store = await prisma.store.findFirst({
      where: { userId: userId },
    });
    if (store) {
      return NextResponse.json({ status: store.status });
    }
    return NextResponse.json({ status: "No Store Found" });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message||error.code }, { status: error.code||500 });
  }
}