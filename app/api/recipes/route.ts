import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { validateBody, validateQuery } from "@/lib/middleware/validate";
import { createRecipeSchema, recipeQuerySchema } from "@/lib/validations";
import { formatErrorResponse, AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

// GET all recipes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Validate query parameters
    const queryValidation = validateQuery(recipeQuerySchema)(request);
    if (!queryValidation.success) {
      return queryValidation.response;
    }
    const { page = 1, limit = 10, category, authorId, search, status } = queryValidation.data;

    const skip = (page - 1) * limit;

    // Build where clause based on query parameters
    const where: Record<string, unknown> = {};

    // Author viewing their own recipes: show all statuses (PENDING, APPROVED, REJECTED)
    const isAuthorViewingOwn = authorId && session?.user?.id && authorId === session.user.id;
    if (isAuthorViewingOwn) {
      // Don't filter by status - author sees all their recipes
    } else if (session?.user?.role !== "SUPER_ADMIN") {
      where.status = "APPROVED";
    } else if (status) {
      where.status = status;
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
    logger.error("Error fetching recipes", error instanceof Error ? error : new Error(String(error)));
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      { message: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

// Create a recipe
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AppError("Authentication required", 401, "AUTHENTICATION_ERROR");
    }

    // Validate request body
    const bodyValidation = await validateBody(createRecipeSchema)(request as NextRequest);
    if (!bodyValidation.success) {
      return bodyValidation.response;
    }
    const body = bodyValidation.data;

    // Ensure authorId matches the authenticated user
    if (body.authorId !== session.user.id) {
      throw new AppError("Cannot create recipe for another user", 403, "AUTHORIZATION_ERROR");
    }

    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        description: body.description,
        makeTime: body.makeTime,
        ingredients: body.ingredients,
        steps: body.steps,
        tips: body.tips,
        category: body.category,
        imageUrl: body.imageUrl as string | null,
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

    logger.info("Recipe created", { recipeId: recipe.id, authorId: session.user.id });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    const session = await auth();
    logger.error("Error creating recipe", error instanceof Error ? error : new Error(String(error)), {
      userId: session?.user?.id,
    });
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      { message: errorResponse.message, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}
