"use client";

import React, { useState } from "react";
import {
  Plus,
  Upload,
  Save,
  ArrowLeft,
  Trash2,
  Loader2,
  CheckCircle,
  ChefHat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

interface RecipeCreatePageProps {
  onSuccess?: (recipeId: string) => void;
  onCancel?: () => void;
}

const RecipeCreatePage: React.FC<RecipeCreatePageProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { data: session, status } = useSession();

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
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const router = useRouter();
  const handleCreateRecipe = () => {
    router.push("/");
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

  const createRecipe = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for database
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        makeTime: formData.makeTime ? parseInt(formData.makeTime) : null,
        ingredients: formData.ingredients.filter((i) => i.trim()),
        steps: formData.steps.filter((s) => s.trim()),
        tips: formData.tips.trim() || null,
        category: formData.category,
        imageUrl: formData.imageUrl.trim() || null,
        authorId: session?.user?.id,
      };

      // API call to create recipe
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create recipe");
      }

      const result = await response.json();

      // Show success state
      setSubmitSuccess(true);

      // Wait a moment to show success animation
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result.id);
        }
      }, 1500);
    } catch (error) {
      console.error("Error creating recipe:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to create recipe. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 border-amber-300",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 border-emerald-300",
      [Category.DINNER]: "bg-blue-100 text-blue-800 border-blue-300",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 border-pink-300",
      [Category.SNACK]: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[category];
  };

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="w-full max-w-md border-0 text-center shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">
              Recipe Created!
            </h2>
            <p className="mb-6 text-slate-600">
              Your recipe has been successfully saved to the database.
            </p>
            <button
              onClick={handleCreateRecipe}
              className="bg-primary mx-auto flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">
              Create New Recipe
            </h1>
            <p className="text-slate-600">
              Share your culinary masterpiece with the world
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-full p-3 transition-colors hover:bg-white"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-6 w-6 text-slate-600" />
            </button>
          )}
        </div>

        {errors.submit && (
          <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">{errors.submit}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g., Homemade Margherita Pizza"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border-2 px-4 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 ${
                    errors.title ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe your recipe in a few sentences..."
                  rows={3}
                  disabled={isSubmitting}
                  className={`w-full resize-none rounded-lg border-2 px-4 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 ${
                    errors.description ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                            : "border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300"
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.makeTime}
                    onChange={(e) => updateField("makeTime", e.target.value)}
                    placeholder="30"
                    min="0"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border-2 px-4 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 ${
                      errors.makeTime ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {errors.makeTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.makeTime}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                      className="w-full rounded-lg border-2 border-slate-200 py-3 pr-4 pl-11 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
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
                    className="flex-1 rounded-lg border-2 border-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
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
                    className="flex-1 resize-none rounded-lg border-2 border-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
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
                className="w-full resize-none rounded-lg border-2 border-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-700 shadow-md transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={createRecipe}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Create Recipe
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCreatePage;
