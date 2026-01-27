import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Dapatkan semua order
export async function GET(req: Request) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return Response.json(orders, { status: 200 });
  } catch (error) {
    console.error("Get orders error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Buat order baru
export async function POST(req: Request) {
  try {
    const { userId, items, total } = await req.json();

    if (!userId || !items || items.length === 0) {
      return Response.json(
        { error: "userId and items are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        total: total || 0,
        status: "PENDING",
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return Response.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
