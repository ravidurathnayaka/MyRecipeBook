import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import prisma from "@/lib/db";

// GET all recipes with filtering
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
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
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json(
      {
        recipes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { message: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// UPDATE recipe status (approve/reject) or bulk approve all pending
export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { recipeId, status, bulkApprove } = body;

    // Bulk approve all pending recipes
    if (bulkApprove === true) {
      const result = await prisma.recipe.updateMany({
        where: { status: "PENDING" },
        data: { status: "APPROVED" },
      });
      return NextResponse.json(
        { message: `${result.count} recipe(s) approved`, count: result.count },
        { status: 200 }
      );
    }

    if (!recipeId || !status) {
      return NextResponse.json(
        { message: "RecipeId and status are required" },
        { status: 400 }
      );
    }

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: { status },
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

    return NextResponse.json(updatedRecipe, { status: 200 });
  } catch (error) {
    console.error("Error updating recipe status:", error);
    return NextResponse.json(
      { message: "Failed to update recipe status" },
      { status: 500 }
    );
  }
}

// DELETE recipe
export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json(
        { message: "RecipeId is required" },
        { status: 400 }
      );
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json(
      { message: "Recipe deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { message: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
