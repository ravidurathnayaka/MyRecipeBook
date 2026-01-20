"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Loader2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import RecipeCard from "@/components/general/RecipeCard";

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

const RECIPES_PER_PAGE = 6;

const RecipeHomePage: React.FC = () => {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">(
    "ALL",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
    setCurrentPage(1); // Reset to first page when filters change
  }, [recipes, searchQuery, selectedCategory]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recipes");

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      // API returns { recipes: [...], pagination: {...} }
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes([]); // Set empty array on error to prevent iteration errors
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    // Ensure recipes is always an array
    if (!Array.isArray(recipes)) {
      setFilteredRecipes([]);
      return;
    }
    let filtered = [...recipes];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(
        (recipe) => recipe.category === selectedCategory,
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleRecipeClick = (recipeId: string) => {
    // Navigate to recipe detail page
    window.location.href = `/recipes/${recipeId}`;
  };

  const handleCreateRecipe = () => {
    // Navigate to create recipe page
    window.location.href = "/create-recipe";
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
  };

  const getCategoryColor = (category: Category | "ALL"): string => {
    if (category === "ALL") {
      return "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80";
    }
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/50",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/50",
      [Category.DINNER]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/50",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800 hover:bg-pink-200 dark:hover:bg-pink-900/50",
      [Category.SNACK]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/50",
    };
    return colors[category];
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Recipes</h1>
            <p className="mt-1 text-muted-foreground">
              Discover variant recipes and enjoy
            </p>
          </div>
        </div>
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 right-2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="  Search..."
                className="focus:ring-primary w-full rounded-lg border-2 border-input bg-background px-2 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border-2 px-6 py-3 font-semibold transition-colors ${
                showFilters
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    Filter by Category
                  </h3>
                  {(searchQuery || selectedCategory !== "ALL") && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`cursor-pointer border-2 transition-all ${
                      selectedCategory === "ALL"
                        ? getCategoryColor("ALL")
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedCategory("ALL")}
                  >
                    ALL
                  </Badge>
                  {Object.values(Category).map((cat) => (
                    <Badge
                      key={cat}
                      className={`cursor-pointer border-2 transition-all ${
                        selectedCategory === cat
                          ? getCategoryColor(cat)
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-600">
            {loading ? (
              "Loading recipes..."
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {startIndex + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(endIndex, filteredRecipes.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {filteredRecipes.length}
                </span>{" "}
                recipes
              </>
            )}
          </p>
          {!loading && totalPages > 1 && (
            <p className="text-slate-600">
              Page{" "}
              <span className="font-semibold text-slate-900">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-slate-600" />
              <p className="text-slate-600">Loading recipes...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">
              No recipes found
            </h3>
            <p className="mb-6 text-slate-600">
              {searchQuery || selectedCategory !== "ALL"
                ? "Try adjusting your filters or search query"
                : "Be the first to create a recipe!"}
            </p>
            {session && (
              <button
                onClick={handleCreateRecipe}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <Plus className="h-5 w-5" />
                Create Recipe
              </button>
            )}
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && currentRecipes.length > 0 && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className="rounded-lg border-2 border-slate-200 bg-white p-2 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600" />
                </button>

                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`h-10 w-10 rounded-lg border-2 font-semibold transition-colors ${
                        currentPage === page
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-slate-400">
                      {page}
                    </span>
                  ),
                )}

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border-2 border-slate-200 bg-white p-2 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeHomePage;
