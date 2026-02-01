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
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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
  status?: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

const RECIPES_PER_PAGE = 5;
const MY_RECIPES_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let myRecipesCache: {
  userId: string;
  data: Recipe[];
  timestamp: number;
} | null = null;

const MyRecipesPage: React.FC = () => {
  const { data: session, status } = useSession();

  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      const cached =
        myRecipesCache &&
        myRecipesCache.userId === userId &&
        Date.now() - myRecipesCache.timestamp < MY_RECIPES_CACHE_DURATION_MS;
      if (cached && myRecipesCache) {
        setRecipes(myRecipesCache.data);
        setLoading(false);
        return;
      }
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
      const userId = session?.user?.id;
      if (!userId) {
        console.error("No user ID found in session");
        setLoading(false);
        return;
      }

      const url = `/api/recipes?authorId=${userId}&limit=100`;
      console.log("Fetching from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      console.log("Fetched recipes:", data);
      // API returns { recipes: [...], pagination: {...} }
      const recipesArray = Array.isArray(data.recipes)
        ? data.recipes
        : Array.isArray(data)
          ? data
          : [];
      setRecipes(recipesArray);
      if (session?.user?.id) {
        myRecipesCache = {
          userId: session.user.id,
          data: recipesArray,
          timestamp: Date.now(),
        };
      }
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

    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
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
    setDeleteDialogOpen(true);
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

      const updatedRecipes = recipes.filter((r) => r.id !== recipeToDelete.id);
      setRecipes(updatedRecipes);
      if (session?.user?.id && myRecipesCache?.userId === session.user.id) {
        myRecipesCache = {
          userId: session.user.id,
          data: updatedRecipes,
          timestamp: Date.now(),
        };
      }
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
      toast.error("Failed to delete recipe. Please try again.");
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

  const getStatusIcon = (recipeStatus: string) => {
    switch (recipeStatus) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (recipeStatus: string) => {
    switch (recipeStatus) {
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="w-full max-w-md border-0 text-center shadow-xl">
          <CardContent className="pt-12 pb-8">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-600" />
            <h2 className="mb-3 text-2xl font-bold text-slate-900">
              Authentication Required
            </h2>
            <p className="mb-6 text-slate-600">
              Please sign in to view your recipes.
            </p>
            <button
              onClick={() => router.push("/api/auth/signin")}
              className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Sign In
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <BookOpen className="text-primary h-8 w-8" />
              <h1 className="text-3xl font-bold">My Recipes</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your recipe collection
            </p>
          </div>
          <Button
            onClick={handleCreateRecipe}
            className="flex items-center gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Create Recipe
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your recipes..."
              className="h-10 w-full pl-10"
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
                  filteredRecipes.length,
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
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecipes.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">
                No recipes found
              </h3>
              <p className="mb-6 text-slate-600">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start by creating your first recipe!"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreateRecipe}
                  className="inline-flex items-center gap-2"
                  size="lg"
                >
                  <Plus className="h-5 w-5" />
                  Create Recipe
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Desktop Table */}
        {!loading && currentRecipes.length > 0 && (
          <>
            <div className="hidden md:block">
              <Card className="overflow-hidden border-0 py-0 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-slate-150 border-b-2 bg-slate-200">
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
                          Status
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
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {recipe.imageUrl && (
                                <img
                                  src={recipe.imageUrl}
                                  alt={recipe.title}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {recipe.title}
                                </p>
                                <p className="line-clamp-1 text-sm text-slate-500">
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
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(recipe.status ?? "PENDING")}
                              <Badge variant={getStatusBadgeVariant(recipe.status ?? "PENDING")}>
                                {recipe.status ?? "PENDING"}
                              </Badge>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {formatDate(recipe.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleView(recipe.id)}
                                className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                                title="View"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(recipe.id)}
                                className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                                title="Edit"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(recipe)}
                                disabled={deletingId === recipe.id}
                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === recipe.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                ) : (
                                  <Trash2 className="h-5 w-5" />
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
            <div className="space-y-4 md:hidden">
              {currentRecipes.map((recipe) => (
                <Card key={recipe.id} className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="mb-3 flex gap-3">
                      {recipe.imageUrl && (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 font-bold text-slate-900">
                          {recipe.title}
                        </h3>
                        <p className="mb-2 line-clamp-2 text-sm text-slate-500">
                          {recipe.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getCategoryColor(recipe.category)}>
                            {recipe.category}
                          </Badge>
                          <span className="flex items-center gap-1.5">
                            {getStatusIcon(recipe.status ?? "PENDING")}
                            <Badge variant={getStatusBadgeVariant(recipe.status ?? "PENDING")}>
                              {recipe.status ?? "PENDING"}
                            </Badge>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <div className="text-sm text-slate-600">
                        {formatDate(recipe.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(recipe.id)}
                          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(recipe.id)}
                          className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(recipe)}
                          disabled={deletingId === recipe.id}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                        >
                          {deletingId === recipe.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
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
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border-2 border-border bg-background p-2 transition-colors hover:border-input hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </button>

                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`h-10 w-10 min-w-[40px] rounded-lg border-2 font-semibold transition-colors ${
                        currentPage === page
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-input hover:bg-accent"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">
                      {page}
                    </span>
                  ),
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border-2 border-border bg-background p-2 transition-colors hover:border-input hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                <AlertDialogDescription className="mt-1.5">
                  Are you sure you want to delete &quot;
                  <span className="font-semibold text-foreground">
                    {recipeToDelete?.title}
                  </span>
                  &quot;? This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-row gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={() => setRecipeToDelete(null)}
              disabled={deletingId !== null}
              className="mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingId !== null}
            >
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyRecipesPage;
