import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// GET - Get order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
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

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json(order, { status: 200 });
  } catch (error) {
    console.error("Get order error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update order
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, total } = await req.json();

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(total !== undefined && { total }),
      },
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

    return Response.json(
      { message: "Order updated successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update order error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.order.delete({
      where: { id },
    });

    return Response.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete order error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
