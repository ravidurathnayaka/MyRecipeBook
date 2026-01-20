import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { formatErrorResponse, AuthenticationError } from "@/lib/errors";

// GET user's favorite recipes
export async function GET() {
  try {
    const user = await requireUser();

    const favorites = await prisma.favoriteRecipe.findMany({
      where: { userId: user.id },
      include: {
        recipe: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map favorites to recipes, filter out any null recipes
    const recipes = favorites
      .map((fav) => fav.recipe)
      .filter((recipe) => recipe !== null);

    logger.info("Favorites fetched successfully", { userId: user.id, count: recipes.length });
    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    logger.error("Error fetching favorites", error instanceof Error ? error : new Error(String(error)));
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      { message: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

// ADD recipe to favorites
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { message: "RecipeId is required" },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json(
        { message: "Recipe not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipeId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { message: "Recipe already in favorites" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favoriteRecipe.create({
      data: {
        userId: user.id,
        recipeId: recipeId,
      },
      include: {
        recipe: {
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
        },
      },
    });

    logger.info("Favorite added successfully", { userId: user.id, recipeId });
    return NextResponse.json(favorite.recipe, { status: 201 });
  } catch (error) {
    logger.error("Error adding favorite", error instanceof Error ? error : new Error(String(error)));
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      { message: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

// REMOVE recipe from favorites
export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json(
        { message: "RecipeId is required" },
        { status: 400 }
      );
    }

    await prisma.favoriteRecipe.delete({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipeId,
        },
      },
    });

    logger.info("Favorite removed successfully", { userId: user.id, recipeId });
    return NextResponse.json(
      { message: "Favorite removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error removing favorite", error instanceof Error ? error : new Error(String(error)));
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      { message: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
