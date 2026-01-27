import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Dapatkan semua produk
export async function GET(req: Request) {
  try {
    const products = await prisma.product.findMany();
    return Response.json(products, { status: 200 });
  } catch (error) {
    console.error("Get products error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tambah produk baru
export async function POST(req: Request) {
  try {
    const { name, description, price, stock, category, imageUrl } =
      await req.json();

    if (!name || !price) {
      return Response.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        stock: stock || 0,
        category: category || "FOOD",
        imageUrl: imageUrl || null,
      },
    });

    return Response.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
