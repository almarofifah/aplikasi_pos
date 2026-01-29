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
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    return Response.json({ user }, { status: 200 });
  } catch (err) {
    console.error("/api/users/me GET error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyJwt<{ userId: string; role: string }>(token);
    const currentUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!currentUser) return Response.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { username, profileImage, theme, fontSize, role } = body;

    // check username uniqueness
    if (username && username !== currentUser.username) {
      const exists = await prisma.user.findUnique({ where: { username } });
      if (exists) return Response.json({ error: "Username already taken" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUserAny = currentUser as any;

    // Only ADMIN can change role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      username: username ?? currentUserAny.username,
      profileImage: profileImage ?? currentUserAny.profileImage,
      theme: theme ?? currentUserAny.theme,
      fontSize: fontSize ?? currentUserAny.fontSize,
    };

    if (role && payload.role === "ADMIN") {
      updates.role = role;
    }

    const updated = await prisma.user.update({ where: { id: currentUser.id }, data: updates });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedAny = updated as any;

    return Response.json({ user: { id: updatedAny.id, email: updatedAny.email, username: updatedAny.username, role: updatedAny.role, profileImage: updatedAny.profileImage, theme: updatedAny.theme, fontSize: updatedAny.fontSize } }, { status: 200 });
  } catch (err) {
    console.error("/api/users/me PUT error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}