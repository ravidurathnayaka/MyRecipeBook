import { auth } from "@/app/utils/auth";
import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";

// GET all recipes
export async function GET(request: Request) {
  try {
    const session = await auth();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");
    const search = searchParams.get("search");

    // Build where clause based on query parameters
    const where: any = {};

    // Super admins see all recipes, users only see approved
    if (session?.user?.role !== "SUPER_ADMIN") {
      where.status = "APPROVED";
    }

    if (category) {
      where.category = category;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { message: "Failed to fetch recipes" },
      { status: 500 },
    );
  }
}

// Create a recipe
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        description: body.description,
        makeTime: body.makeTime,
        ingredients: body.ingredients,
        steps: body.steps,
        tips: body.tips,
        category: body.category,
        imageUrl: body.imageUrl,
        authorId: body.authorId,
        status: "PENDING",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { message: "Failed to create recipe" },
      { status: 500 },
    );
  }
}
