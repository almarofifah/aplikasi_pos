import { PrismaClient } from "@prisma/client";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyJwt<{ userId: string; role: string }>(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return Response.json({ error: "currentPassword and newPassword are required" }, { status: 400 });
    }

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return Response.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashed } });

    return Response.json({ message: "Password updated" }, { status: 200 });
  } catch (err) {
    console.error("/api/auth/change-password error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}