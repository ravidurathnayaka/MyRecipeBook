import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { formatErrorResponse } from "@/lib/errors";

// CHECK if recipe is favorited
export async function GET(
  request: Request,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const user = await requireUser();
    const { recipeId } = await params;

    const favorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipeId,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite }, { status: 200 });
  } catch (error) {
    logger.error("Error checking favorite", error instanceof Error ? error : new Error(String(error)));
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      { message: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
