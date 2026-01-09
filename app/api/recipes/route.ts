import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
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
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { message: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
