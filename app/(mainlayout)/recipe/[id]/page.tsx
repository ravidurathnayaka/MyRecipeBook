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

interface RecipeDetailPageProps {
  recipeId: string;
}

const RecipeDetailPage: React.FC<RecipeDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();

  console.log(id);
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
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      [Category.DINNER]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      [Category.SNACK]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-xl border text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {error === "Recipe not found"
                ? "Recipe Not Found"
                : "Error Loading Recipe"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "Something went wrong while loading the recipe."}
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <img
          src={
            recipe.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80"
          }
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Action Buttons */}
        <div className="no-print absolute top-6 left-6 right-6 flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="secondary"
            size="icon"
            className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
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
              size="default"
              onClick={() => window.print()}
              className="bg-background/90 backdrop-blur-sm"
              aria-label="Print recipe"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-5xl mx-auto">
            <Badge
              className={`${getCategoryColor(
                recipe.category
              )} border-0 shadow-md mb-4`}
            >
              {recipe.category}
            </Badge>
            <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">
              {recipe.title}
            </h1>
            <p className="text-lg text-white/90 drop-shadow-md max-w-3xl">
              {recipe.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Meta Information */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recipe.makeTime && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Prep Time
                    </p>
                    <p className="text-lg font-bold text-foreground">
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
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                      <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Recipe By
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {recipe.author.name || "Anonymous"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Published
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {formatDate(recipe.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-6">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-primary" />
                    Ingredients
                  </h2>
                  <ShoppingListButton
                    ingredients={recipe.ingredients}
                    recipeTitle={recipe.title}
                  />
                </div>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-foreground"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Steps and Tips */}
          <div className="lg:col-span-2 space-y-8">
            {/* Steps */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Instructions
                </h2>
                <div className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                        checkedSteps.has(index)
                          ? "bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800"
                          : "bg-muted border-2 border-transparent hover:border-border"
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
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <p
                        className={`leading-relaxed ${
                          checkedSteps.has(index)
                            ? "text-green-900 dark:text-green-100 line-through"
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
              <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    Pro Tips
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    {recipe.tips}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
