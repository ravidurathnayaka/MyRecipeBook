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
    "ALL"
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
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(
        (recipe) => recipe.category === selectedCategory
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
      return "bg-slate-100 text-slate-800 border-slate-300";
    }
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 border-amber-300",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 border-emerald-300",
      [Category.DINNER]: "bg-blue-100 text-blue-800 border-blue-300",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 border-pink-300",
      [Category.SNACK]: "bg-purple-100 text-purple-800 border-purple-300",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Recipes</h1>
            <p className="text-slate-600 mt-1">
              Discover variant recipes and enjoy
            </p>
          </div>
        </div>
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="  Search recipes by title or description..."
                className="w-full px-2 py-3  rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-semibold transition-colors ${
                showFilters
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <Card className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">
                    Filter by Category
                  </h3>
                  {(searchQuery || selectedCategory !== "ALL") && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`cursor-pointer border-2 transition-all ${
                      selectedCategory === "ALL"
                        ? getCategoryColor("ALL")
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
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
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
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
              <Loader2 className="w-12 h-12 animate-spin text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading recipes...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No recipes found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || selectedCategory !== "ALL"
                ? "Try adjusting your filters or search query"
                : "Be the first to create a recipe!"}
            </p>
            {session && (
              <button
                onClick={handleCreateRecipe}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Recipe
              </button>
            )}
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && currentRecipes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  className="p-2 rounded-lg border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`h-10 w-10 rounded-lg border-2 font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-slate-400">
                      {page}
                    </span>
                  )
                )}

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
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
