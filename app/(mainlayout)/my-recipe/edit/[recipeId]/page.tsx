"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { RecipeForm, RecipeFormData } from "@/components/form/RecipeForm";

export default function RecipeEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.recipeId as string;

  const [initialData, setInitialData] = useState<RecipeFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (recipeId && status === "authenticated") {
      fetchRecipe();
    }
  }, [recipeId, status]);

  const fetchRecipe = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/recipes/${recipeId}`);

      if (!response.ok) {
        if (response.status === 404) throw new Error("Recipe not found");
        throw new Error("Failed to fetch recipe");
      }

      const recipe = await response.json();
      const userId = (session?.user as { id?: string })?.id;

      if (recipe.authorId !== userId) {
        throw new Error("You do not have permission to edit this recipe");
      }

      setInitialData({
        title: recipe.title,
        description: recipe.description,
        makeTime: recipe.makeTime?.toString() || "",
        ingredients: recipe.ingredients?.length > 0 ? recipe.ingredients : [""],
        steps: recipe.steps?.length > 0 ? recipe.steps : [""],
        tips: recipe.tips || "",
        category: recipe.category,
        imageUrl: recipe.imageUrl || "",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load recipe";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecipe = async (formData: RecipeFormData) => {
    try {
      if (status !== "authenticated") {
        throw new Error("You must be logged in to update a recipe");
      }

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
      };

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update recipe");
      }

      toast.success("Recipe updated successfully");
      setSubmitSuccess(true);
      setTimeout(() => router.push("/my-recipe"), 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update recipe"
      );
      throw error;
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-0 text-center shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
              <ArrowLeft className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-foreground">Error</h2>
            <p className="mb-6 text-muted-foreground">{loadError}</p>
            <button
              onClick={() => router.push("/my-recipe")}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to My Recipes
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-0 text-center shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Recipe Updated!
            </h2>
            <p className="mb-6 text-muted-foreground">
              Your recipe has been successfully updated.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <RecipeForm
      mode="edit"
      initialData={initialData}
      onSubmit={updateRecipe}
      onCancel={() => router.push("/my-recipe")}
      headerTitle="Edit Recipe"
      headerDescription="Update your recipe details"
      submitLabel="Update Recipe"
      submittingLabel="Updating..."
    />
  );
}
