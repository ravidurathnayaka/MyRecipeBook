import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";

// GET a recipe
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: params.id,
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

    if (!recipe) {
      return NextResponse.json(
        { message: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe, { status: 200 });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { message: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

// UPDATE recipe
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const recipe = await prisma.recipe.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title,
        description: body.description,
        makeTime: body.makeTime,
        ingredients: body.ingredients,
        steps: body.steps,
        tips: body.tips,
        category: body.category,
        imageUrl: body.imageUrl,
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

    return NextResponse.json(recipe, { status: 200 });
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { message: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE recipe
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.recipe.delete({
      where: {
        id: params.id,
      },
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
