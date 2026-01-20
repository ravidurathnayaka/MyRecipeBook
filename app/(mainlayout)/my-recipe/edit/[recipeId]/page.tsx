"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  Save,
  ArrowLeft,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

// Prisma enums and types
enum Category {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  DESSERT = "DESSERT",
  SNACK = "SNACK",
}

interface RecipeFormData {
  title: string;
  description: string;
  makeTime: string;
  ingredients: string[];
  steps: string[];
  tips: string;
  category: Category;
  imageUrl: string;
}

const RecipeEditPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.recipeId as string;

  console.log(recipeId);

  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    description: "",
    makeTime: "",
    ingredients: [""],
    steps: [""],
    tips: "",
    category: Category.DINNER,
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        if (response.status === 404) {
          throw new Error("Recipe not found");
        }
        throw new Error("Failed to fetch recipe");
      }

      const recipe = await response.json();

      // Check if user is the author
      const userId = (session?.user as any)?.id;
      if (recipe.authorId !== userId) {
        throw new Error("You do not have permission to edit this recipe");
      }

      // Populate form with recipe data
      setFormData({
        title: recipe.title,
        description: recipe.description,
        makeTime: recipe.makeTime?.toString() || "",
        ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [""],
        steps: recipe.steps.length > 0 ? recipe.steps : [""],
        tips: recipe.tips || "",
        category: recipe.category,
        imageUrl: recipe.imageUrl || "",
      });

      if (recipe.imageUrl) {
        setImagePreview(recipe.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load recipe",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof RecipeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, steps: newSteps }));
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.makeTime && isNaN(Number(formData.makeTime))) {
      newErrors.makeTime = "Must be a valid number";
    }

    const validIngredients = formData.ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    const validSteps = formData.steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      newErrors.steps = "At least one step is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateRecipe = async () => {
    if (!validateForm()) {
      return;
    }

    if (status !== "authenticated") {
      setErrors({ submit: "You must be logged in to update a recipe." });
      return;
    }

    setIsSubmitting(true);

    try {
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        makeTime: formData.makeTime ? parseInt(formData.makeTime) : null,
        ingredients: formData.ingredients.filter((i) => i.trim()),
        steps: formData.steps.filter((s) => s.trim()),
        tips: formData.tips.trim() || null,
        category: formData.category,
        imageUrl: formData.imageUrl.trim() || null,
      };

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update recipe");
      }

      setSubmitSuccess(true);

      setTimeout(() => {
        router.push("/my-recipe");
      }, 1500);
    } catch (error) {
      console.error("Error updating recipe:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to update recipe. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      [Category.DINNER]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800",
      [Category.SNACK]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    };
    return colors[category];
  };

  // Loading state
  if (isLoading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Success state
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

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">
              Edit Recipe
            </h1>
            <p className="text-muted-foreground">Update your recipe details</p>
          </div>
          <button
            onClick={() => router.push("/my-recipe")}
            className="rounded-full p-3 transition-colors hover:bg-white"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-6 rounded-lg border-2 border-destructive/20 bg-destructive/10 dark:bg-destructive/20 p-4">
            <p className="font-medium text-destructive">{errors.submit}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g., Homemade Margherita Pizza"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border-2 px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.title ? "border-red-300 dark:border-red-600" : "border-input"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe your recipe in a few sentences..."
                  rows={3}
                  disabled={isSubmitting}
                  className={`w-full resize-none rounded-lg border-2 px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.description ? "border-red-300 dark:border-red-600" : "border-input"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(Category).map((cat) => (
                      <Badge
                        key={cat}
                        className={`cursor-pointer border-2 transition-all ${
                          isSubmitting ? "cursor-not-allowed opacity-50" : ""
                        } ${
                          formData.category === cat
                            ? getCategoryColor(cat)
                            : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                        onClick={() =>
                          !isSubmitting && updateField("category", cat)
                        }
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.makeTime}
                    onChange={(e) => updateField("makeTime", e.target.value)}
                    placeholder="30"
                    min="0"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.makeTime ? "border-red-300 dark:border-red-600" : "border-input"
                    }`}
                  />
                  {errors.makeTime && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.makeTime}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Upload className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 border-input py-3 pr-4 pl-11 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full rounded-lg object-cover"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border-2 border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={formData.ingredients.length === 1 || isSubmitting}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {errors.ingredients && (
                <p className="text-sm text-red-600">{errors.ingredients}</p>
              )}
              <button
                type="button"
                onClick={addIngredient}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                Add Ingredient
              </button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="mt-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                    {index + 1}
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1} instructions...`}
                    rows={2}
                    disabled={isSubmitting}
                    className="flex-1 resize-none rounded-lg border-2 border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="self-start rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={formData.steps.length === 1 || isSubmitting}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {errors.steps && (
                <p className="text-sm text-red-600">{errors.steps}</p>
              )}
              <button
                type="button"
                onClick={addStep}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                Add Step
              </button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Pro Tips (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.tips}
                onChange={(e) => updateField("tips", e.target.value)}
                placeholder="Share your expert tips and tricks for making this recipe perfect..."
                rows={4}
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border-2 border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/my-recipe")}
              disabled={isSubmitting}
              className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-700 shadow-md transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updateRecipe}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Update Recipe
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeEditPage;
