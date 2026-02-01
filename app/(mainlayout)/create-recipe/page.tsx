"use client";

import React, { useState } from "react";
import { ChefHat, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RecipeForm, RecipeFormData } from "@/components/form/RecipeForm";

export default function RecipeCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createRecipe = async (formData: RecipeFormData) => {
    try {
      const parsedMakeTime = formData.makeTime
        ? parseInt(formData.makeTime, 10)
        : null;
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        makeTime:
          parsedMakeTime !== null && !Number.isNaN(parsedMakeTime)
            ? parsedMakeTime
            : null,
        ingredients: formData.ingredients.filter((i) => i.trim()),
        steps: formData.steps.filter((s) => s.trim()),
        tips: formData.tips.trim() || null,
        category: formData.category,
        imageUrl: formData.imageUrl.trim() || null,
        authorId: session?.user?.id,
      };

      if (!recipeData.authorId) {
        throw new Error("You must be logged in to create a recipe");
      }

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const error = await response.json();
        const message =
          error.errors?.length > 0
            ? error.errors
                .map((e: { path: string; message: string }) => `${e.path}: ${e.message}`)
                .join(". ")
            : error.message || "Failed to create recipe";
        throw new Error(message);
      }

      const result = await response.json();
      toast.success("Recipe created successfully!");
      setSubmitSuccess(true);
      setTimeout(() => router.push(`/recipe/${result.id}`), 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create recipe"
      );
      throw error;
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border text-center shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Recipe Created!
            </h2>
            <p className="mb-6 text-muted-foreground">
              Your recipe has been successfully saved to the database.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-primary text-primary-foreground mx-auto flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold shadow-md transition-colors hover:bg-primary/90"
            >
              <ChefHat className="h-5 w-5" />
              Go Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RecipeForm
      mode="create"
      initialData={undefined}
      onSubmit={createRecipe}
      onCancel={() => router.back()}
      headerTitle="Create New Recipe"
      headerDescription="Share your culinary masterpiece with the world"
      submitLabel="Create Recipe"
      submittingLabel="Creating..."
    />
  );
}
