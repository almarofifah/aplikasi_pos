import { PrismaClient } from "@prisma/client";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyJwt<{ userId: string; role: string }>(token);
    if (payload.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true, profileImage: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ users }, { status: 200 });
  } catch (err) {
    console.error("/api/admin/users GET error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}