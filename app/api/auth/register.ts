import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return Response.json(
        { error: "Email, username and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists (by email)
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
