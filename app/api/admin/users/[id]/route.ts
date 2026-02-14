import { PrismaClient } from "@prisma/client";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyJwt<{ userId: string; role: string }>(token);
    if (payload.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { role } = body;
    if (!role) return Response.json({ error: "role required" }, { status: 400 });

    const updated = await prisma.user.update({ where: { id }, data: { role } });

    return Response.json({ user: { id: updated.id, username: updated.username, role: updated.role } }, { status: 200 });
  } catch (err) {
    console.error("/api/admin/users/[id] PUT error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}