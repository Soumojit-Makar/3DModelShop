import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/middleware/authSeller";


export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orders = await prisma.order.findMany({ where: { storeId: storeId } });
    const products = await prisma.product.findMany({
      where: { storeId: storeId },
    });
    const ratings = await prisma.rating.findMany({
      where: {
        productId: {
          in: products.map((product) => product.id),
        },
      },
      include: { user: true, product: true },
    });
    const dashbordData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(
        orders.reduce((acc, order) => acc + order.totalPrice, 0)
      ),
      totalProducts: products.length,
    };
    return NextResponse.json(dashbordData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
