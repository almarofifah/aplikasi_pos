const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    console.log("✅ Cleared existing data");

    // Seed products
    const products = await prisma.product.createMany({
      data: [
        {
          name: "Nasi Goreng",
          description: "Nasi goreng spesial dengan telur dan sayuran",
          price: 25000,
          stock: 50,
          category: "FOOD",
          imageUrl:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Gado-gado Special",
          description: "Sayuran dengan kacang dan telur rebus",
          price: 20000,
          stock: 40,
          category: "FOOD",
          imageUrl:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Soto Ayam",
          description: "Sup ayam tradisional dengan rempah pilihan",
          price: 22000,
          stock: 35,
          category: "FOOD",
          imageUrl:
            "https://images.unsplash.com/photo-1537686081915-371a63019c94?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Es Jeruk",
          description: "Minuman segar dari jeruk asli",
          price: 12000,
          stock: 60,
          category: "BEVERAGE",
          imageUrl:
            "https://images.unsplash.com/photo-1523677350475-48a94abaf816?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Es Cendol",
          description: "Minuman tradisional dengan cendol lembut",
          price: 15000,
          stock: 45,
          category: "BEVERAGE",
          imageUrl:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Kopi Hitam",
          description: "Kopi premium tanpa gula",
          price: 18000,
          stock: 50,
          category: "BEVERAGE",
          imageUrl:
            "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Pudding Cokelat",
          description: "Pudding lembut dengan rasa cokelat premium",
          price: 16000,
          stock: 30,
          category: "DESSERT",
          imageUrl:
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Tiramisu",
          description: "Dessert Italia yang lezat",
          price: 20000,
          stock: 25,
          category: "DESSERT",
          imageUrl:
            "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop",
          isActive: true,
        },
        {
          name: "Brownies",
          description: "Brownies cokelat premium",
          price: 18000,
          stock: 35,
          category: "DESSERT",
          imageUrl:
            "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop",
          isActive: true,
        },
      ],
    });

    console.log(`✅ Created ${products.count} products`);

    // Ensure there is at least one user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          username: 'admin',
          passwordHash: 'seed',
          role: 'CASHIER',
        },
      });
      console.log('✅ Created default user', user.username);
    }

    // Create sample orders if none exist
    const existingOrders = await prisma.order.count();
    if (existingOrders === 0) {
      const allProducts = await prisma.product.findMany({ where: { isActive: true } });
      if (allProducts.length > 0) {
        const order1 = await prisma.order.create({
          data: {
            userId: user.id,
            total: allProducts[0].price * 2,
            status: 'COMPLETED',
            orderItems: {
              create: [
                { productId: allProducts[0].id, quantity: 2, price: allProducts[0].price },
              ],
            },
          },
        });

        const order2 = await prisma.order.create({
          data: {
            userId: user.id,
            total: allProducts[1].price * 1,
            status: 'COMPLETED',
            orderItems: {
              create: [
                { productId: allProducts[1].id, quantity: 1, price: allProducts[1].price },
              ],
            },
          },
        });

        console.log('✅ Seeded sample orders:', order1.id, order2.id);
      }
    }

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
