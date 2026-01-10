"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Types
enum Category {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  DESSERT = "DESSERT",
  SNACK = "SNACK",
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  makeTime?: number | null;
  category: Category;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const RECIPES_PER_PAGE = 5;

const MyRecipesPage: React.FC = () => {
  const { data: session, status } = useSession();

  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMyRecipes();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    filterRecipes();
    setCurrentPage(1);
  }, [recipes, searchQuery]);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);

      // Debug: Log session data
      console.log("Session data:", session);
      console.log("User ID:", session?.user?.id);

      // Check if user ID exists
      const userId = "cmk466xh20000awidg56vg4tf";
      if (!userId) {
        console.error("No user ID found in session");
        setLoading(false);
        return;
      }

      const url = `/api/recipes?authorId=${userId}`;
      console.log("Fetching from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      console.log("Fetched recipes:", data);
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleView = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleEdit = (recipeId: string) => {
    router.push(`/my-recipe/edit/${recipeId}`);
  };

  const handleDeleteClick = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      setDeletingId(recipeToDelete.id);
      const response = await fetch(`/api/recipes/${recipeToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }

      setRecipes(recipes.filter((r) => r.id !== recipeToDelete.id));
      setShowDeleteModal(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateRecipe = () => {
    router.push("/create-recipe");
  };

  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800",
      [Category.DINNER]: "bg-blue-100 text-blue-800",
      [Category.DESSERT]: "bg-pink-100 text-pink-800",
      [Category.SNACK]: "bg-purple-100 text-purple-800",
    };
    return colors[category];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-slate-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-xl border-0 text-center">
          <CardContent className="pt-12 pb-8">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Authentication Required
            </h2>
            <p className="text-slate-600 mb-6">
              Please sign in to view your recipes.
            </p>
            <button
              onClick={() => router.push("/api/auth/signin")}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Sign In
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Recipes</h1>
            <p className="text-slate-600 mt-1">Manage your recipe collection</p>
          </div>
          <button
            onClick={handleCreateRecipe}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Recipe
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your recipes..."
              className="w-full px-2 py-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            {loading
              ? "Loading..."
              : `Showing ${startIndex + 1}-${Math.min(
                  endIndex,
                  filteredRecipes.length
                )} of ${filteredRecipes.length} recipes`}
          </span>
          {totalPages > 1 && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-slate-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecipes.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No recipes found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start by creating your first recipe!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateRecipe}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Recipe
                </button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Desktop Table */}
        {!loading && currentRecipes.length > 0 && (
          <>
            <div className="hidden md:block">
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Recipe
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Time
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Created
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currentRecipes.map((recipe) => (
                        <tr
                          key={recipe.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {recipe.imageUrl && (
                                <img
                                  src={recipe.imageUrl}
                                  alt={recipe.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {recipe.title}
                                </p>
                                <p className="text-sm text-slate-500 line-clamp-1">
                                  {recipe.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={getCategoryColor(recipe.category)}
                            >
                              {recipe.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {recipe.makeTime ? `${recipe.makeTime} min` : "-"}
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {formatDate(recipe.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleView(recipe.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(recipe.id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(recipe)}
                                disabled={deletingId === recipe.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === recipe.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {currentRecipes.map((recipe) => (
                <Card key={recipe.id} className="shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex gap-3 mb-3">
                      {recipe.imageUrl && (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 mb-1">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                          {recipe.description}
                        </p>
                        <Badge className={getCategoryColor(recipe.category)}>
                          {recipe.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div className="text-sm text-slate-600">
                        {formatDate(recipe.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(recipe.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(recipe.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(recipe)}
                          disabled={deletingId === recipe.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {deletingId === recipe.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
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
                      className={`min-w-[40px] h-10 w-10 rounded-lg border-2 font-semibold transition-colors ${
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
                  onClick={() => goToPage(currentPage + 1)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recipeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full shadow-2xl border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Delete Recipe
                  </h3>
                  <p className="text-slate-600">
                    Are you sure you want to delete "
                    <span className="font-semibold">
                      {recipeToDelete.title}
                    </span>
                    "? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRecipeToDelete(null);
                  }}
                  disabled={deletingId !== null}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage;
