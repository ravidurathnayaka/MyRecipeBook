import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import prisma from "@/lib/db";

// GET user profile
export async function GET() {
  try {
    const user = await requireUser();

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            recipes: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// UPDATE user profile
export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { name, image } = body;

    // Validate input
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { message: "Name must be a string" },
        { status: 400 }
      );
    }

    if (image !== undefined && typeof image !== "string") {
      return NextResponse.json(
        { message: "Image URL must be a string" },
        { status: 400 }
      );
    }

    // Only allow updating name and image
    const updateData: { name?: string; image?: string | null } = {};

    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }

    if (image !== undefined) {
      updateData.image = image.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
