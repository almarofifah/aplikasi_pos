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
            username: true,
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
    const body = await req.json();
    const { userId, items, total, customerName, paymentMethod, orderNotes, diningMode, tableNo } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "items are required" }, { status: 400 });
    }

    // Find or create a user to attach the order to
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = await prisma.user.findFirst();
      if (!user) {
        // create a system user
        user = await prisma.user.create({
          data: {
            email: 'system@local',
            username: 'system',
            passwordHash: 'system',
            role: 'CASHIER',
          },
        });
      }
    }

    // Compute server-side total from items
    const itemsTotal = items.reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || 0), 0);
    const finalTotal = typeof total === 'number' && total === itemsTotal ? total : itemsTotal;

    // Create order with status COMPLETED
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: finalTotal,
        status: 'COMPLETED',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: { select: { id: true, email: true, username: true } },
        orderItems: { include: { product: true } },
      },
    });

    console.log('Order created:', order.id, 'total:', order.total);

    return Response.json({ message: 'Order created successfully', order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
