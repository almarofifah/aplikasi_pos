import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Route /api/auth/register
  if (pathname.endsWith("/register")) {
    try {
      const { email, password, username } = await req.json();

      if (!email || !password || !username) {
        return Response.json(
          { error: "Email, username and password are required" },
          { status: 400 }
        );
      }

      // Check if user already exists by email
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return Response.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Check if username already exists
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUserByUsername) {
        return Response.json(
          { error: "Username already registered" },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
        },
      });

      return Response.json(
        {
          message: "User registered successfully",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Register error:", error);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  // Route /api/auth/login
  if (pathname.endsWith("/login")) {
    try {
      const { username, password } = await req.json();

      const user = await prisma.user.findUnique({ where: { username } });

      if (!user) {
        return Response.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const bcrypt = await import("bcryptjs");
      const valid = await bcrypt.compare(password, user.passwordHash);

      if (!valid) {
        return Response.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const { signJwt } = await import("@/lib/jwt");
      const token = signJwt({
        userId: user.id,
        role: user.role,
      });

      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();

      cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      cookieStore.set({
        name: "role",
        value: user.role,
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return Response.json(
        {
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Login error:", error);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
