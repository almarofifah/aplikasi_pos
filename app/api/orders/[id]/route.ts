// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // GET - Dapatkan order berdasarkan ID
// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     const order = await prisma.order.findUnique({
//       where: { id },
//       include: {
//         user: {
//           select: {
//             id: true,
//             email: true,
//             name: true,
//           },
//         },
//         orderItems: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     if (!order) {
//       return Response.json(
//         { error: "Order not found" },
//         { status: 404 }
//       );
//     }

//     return Response.json(order, { status: 200 });
//   } catch (error) {
//     console.error("Get order error:", error);
//     return Response.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update order
// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const { status, total } = await req.json();

//     const order = await prisma.order.update({
//       where: { id },
//       data: {
//         ...(status && { status }),
//         ...(total !== undefined && { total }),
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             email: true,
//             name: true,
//           },
//         },
//         orderItems: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     return Response.json(
//       {
//         message: "Order updated successfully",
//         order,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Update order error:", error);
//     return Response.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Hapus order
// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     await prisma.order.delete({
//       where: { id },
//     });

//     return Response.json(
//       { message: "Order deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Delete order error:", error);
//     return Response.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
