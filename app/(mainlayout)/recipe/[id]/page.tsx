"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  ChefHat,
  ArrowLeft,
  Calendar,
  Lightbulb,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Printer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { FavoriteButton } from "@/components/general/FavoriteButton";
import { ShareButton } from "@/components/general/ShareButton";
import { ShoppingListButton } from "@/components/general/ShoppingListButton";

// Prisma enums and types
enum Category {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  DESSERT = "DESSERT",
  SNACK = "SNACK",
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  makeTime?: number | null;
  ingredients: string[];
  steps: string[];
  tips?: string | null;
  category: Category;
  imageUrl?: string | null;
  author?: User | null;
  authorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/recipes/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Recipe not found");
        }
        throw new Error("Failed to fetch recipe");
      }

      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      console.error("Error fetching recipe:", err);
      setError(err instanceof Error ? err.message : "Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      [Category.LUNCH]:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      [Category.DINNER]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      [Category.DESSERT]:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      [Category.SNACK]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    };
    return colors[category];
  };

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSteps(newChecked);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleBack = () => {
    router.back();
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-10 w-10 animate-spin" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !recipe) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border text-center shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="bg-destructive/10 dark:bg-destructive/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <AlertCircle className="text-destructive h-12 w-12" />
            </div>
            <h2 className="text-foreground mb-3 text-3xl font-bold">
              {error === "Recipe not found"
                ? "Recipe Not Found"
                : "Error Loading Recipe"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "Something went wrong while loading the recipe."}
            </p>
            <button
              onClick={handleBack}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-semibold transition-colors"
            >
              Back to Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="recipe-hero relative h-96 w-full">
        <img
          src={
            recipe.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80"
          }
          alt={recipe.title}
          className="h-full w-full object-cover"
        />
        <div className="recipe-hero-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Action Buttons */}
        <div className="no-print absolute top-6 right-6 left-6 flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="secondary"
            size="icon"
            className="bg-background/90 hover:bg-background shadow-lg backdrop-blur-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FavoriteButton recipeId={id as string} variant="outline" />
            <ShareButton
              recipeId={id as string}
              recipeTitle={recipe.title}
              variant="outline"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.print()}
              className="bg-background/90 h-10 w-10 backdrop-blur-sm"
              aria-label="Print recipe"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="recipe-title-overlay absolute right-0 bottom-0 left-0 p-8 text-white">
          <div className="mx-auto max-w-5xl">
            <Badge
              className={`${getCategoryColor(
                recipe.category,
              )} mb-4 border-0 shadow-md`}
            >
              {recipe.category}
            </Badge>
            <h1 className="mb-3 text-5xl font-bold drop-shadow-lg">
              {recipe.title}
            </h1>
            <p className="max-w-3xl text-lg text-white/90 drop-shadow-md">
              {recipe.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-8 py-12">
        {/* Meta Information */}
        <Card className="print-break-inside-avoid mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {recipe.makeTime && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-3">
                    <Clock className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Prep Time
                    </p>
                    <p className="text-foreground text-lg font-bold">
                      {recipe.makeTime} minutes
                    </p>
                  </div>
                </div>
              )}

              {recipe.author && (
                <div className="flex items-center gap-3">
                  {recipe.author.image ? (
                    <img
                      src={recipe.author.image}
                      alt={recipe.author.name || "User"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                      <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Recipe By
                    </p>
                    <p className="text-foreground text-lg font-bold">
                      {recipe.author.name || "Anonymous"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Published
                  </p>
                  <p className="text-foreground text-lg font-bold">
                    {formatDate(recipe.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card className="print-break-inside-avoid relative sticky top-6 border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-foreground mb-4 flex items-center gap-2 text-2xl font-bold">
                  <ChefHat className="text-primary h-6 w-6 shrink-0" />
                  Ingredients
                </h2>
                <ul className="recipe-ingredients-list ml-5 list-none space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="text-foreground flex items-start gap-3"
                    >
                      <span
                        className="recipe-ingredient-bullet bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"
                        aria-hidden
                      />
                      <span className="leading-relaxed">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Steps and Tips */}
          <div className="space-y-8 lg:col-span-2">
            {/* Steps */}
            <Card className="print-break-inside-avoid border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-foreground mb-6 text-2xl font-bold">
                  Instructions
                </h2>
                <div className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex cursor-pointer gap-4 rounded-lg p-4 transition-all ${
                        checkedSteps.has(index)
                          ? "border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                          : "bg-muted hover:border-border border-2 border-transparent"
                      }`}
                      onClick={() => toggleStep(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleStep(index);
                        }
                      }}
                      aria-pressed={checkedSteps.has(index)}
                    >
                      <div className="flex-shrink-0">
                        {checkedSteps.has(index) ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <p
                        className={`leading-relaxed ${
                          checkedSteps.has(index)
                            ? "text-green-900 line-through dark:text-green-100"
                            : "text-foreground"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            {recipe.tips && (
              <Card className="print-break-inside-avoid border-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 shadow-lg dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-6">
                  <h2 className="text-foreground mb-4 flex items-center gap-2 text-2xl font-bold">
                    <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    Pro Tips
                  </h2>
                  <p className="text-foreground ml-5 leading-relaxed">
                    {recipe.tips}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating Shopping List button */}
      <div className="no-print fixed right-6 bottom-6 z-30">
        <ShoppingListButton
          ingredients={recipe.ingredients}
          recipeTitle={recipe.title}
          fab
        />
      </div>
    </div>
  );
}
