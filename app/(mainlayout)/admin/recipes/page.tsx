"use client";

import { useEffect, useState } from "react";
import { FileText, Search, Loader2, CheckCircle, XCircle, Trash2, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Author {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  imageUrl: string | null;
  createdAt: string;
  author: Author | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ADMIN_RECIPES_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let adminRecipesCache: {
  key: string;
  recipes: Recipe[];
  pagination: Pagination | null;
  timestamp: number;
} | null = null;

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const response = await fetch(`/api/admin/recipes?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      const recipesData = data.recipes || [];
      const paginationData = data.pagination || null;
      setRecipes(recipesData);
      setPagination(paginationData);
      adminRecipesCache = {
        key: `${page}-${search}-${statusFilter}-${categoryFilter}`,
        recipes: recipesData,
        pagination: paginationData,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cacheKey = `${page}-${search}-${statusFilter}-${categoryFilter}`;
    const cached =
      adminRecipesCache &&
      adminRecipesCache.key === cacheKey &&
      Date.now() - adminRecipesCache.timestamp < ADMIN_RECIPES_CACHE_DURATION_MS;
    if (cached && adminRecipesCache) {
      setRecipes(adminRecipesCache.recipes);
      setPagination(adminRecipesCache.pagination);
      setLoading(false);
    } else {
      fetchRecipes();
    }
  }, [page, search, statusFilter, categoryFilter]);

  const updateRecipeStatus = async (
    recipeId: string,
    status: "APPROVED" | "REJECTED" | "PENDING"
  ) => {
    try {
      setUpdating(recipeId);
      const response = await fetch("/api/admin/recipes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to update recipe status");
        return;
      }

      toast.success(`Recipe ${status.toLowerCase()} successfully`);
      fetchRecipes();
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("Failed to update recipe status");
    } finally {
      setUpdating(null);
    }
  };

  const openDeleteDialog = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const deleteRecipe = async () => {
    if (!recipeToDelete) return;

    try {
      setDeletingId(recipeToDelete.id);

      const response = await fetch(`/api/admin/recipes?recipeId=${recipeToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        setDeleteDialogOpen(false);
        setRecipeToDelete(null);
        toast.error(error.message || "Failed to delete recipe");
        return;
      }

      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
      toast.success("Recipe deleted successfully");
      fetchRecipes();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
      toast.error("Failed to delete recipe");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Recipe Moderation</h1>
          </div>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>
        <p className="text-muted-foreground">
          Review and manage all recipes in the system
        </p>
      </div>

      <Card className="mb-6 border-0 px-0 py-4 shadow-none">
        <CardHeader className="px-0 pb-2 pt-0">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                <SelectItem value="LUNCH">Lunch</SelectItem>
                <SelectItem value="DINNER">Dinner</SelectItem>
                <SelectItem value="DESSERT">Dessert</SelectItem>
                <SelectItem value="SNACK">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No recipes found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 mb-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="py-4">
                <CardContent className="p-4">
                  <div className="flex gap-3 flex-col sm:flex-row">
                    {recipe.imageUrl && (
                      <div className="shrink-0">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/recipe/${recipe.id}`}
                            className="text-xl font-semibold hover:text-primary transition-colors"
                          >
                            {recipe.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {recipe.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusIcon(recipe.status)}
                          <Badge variant={getStatusBadgeVariant(recipe.status)}>
                            {recipe.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap mt-2">
                        <Badge variant="outline">{recipe.category}</Badge>
                        {recipe.author && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={recipe.author.image || undefined} />
                              <AvatarFallback>
                                {recipe.author.name?.charAt(0) ||
                                  recipe.author.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {recipe.author.name || recipe.author.email}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(recipe.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {recipe.status !== "APPROVED" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateRecipeStatus(recipe.id, "APPROVED")}
                            disabled={updating === recipe.id}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {updating === recipe.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                        )}
                        {recipe.status !== "REJECTED" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateRecipeStatus(recipe.id, "REJECTED")}
                            disabled={updating === recipe.id}
                          >
                            {updating === recipe.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                        )}
                        {recipe.status === "REJECTED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRecipeStatus(recipe.id, "PENDING")}
                            disabled={updating === recipe.id}
                          >
                            {updating === recipe.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Set Pending
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(recipe)}
                          disabled={updating === recipe.id || deletingId !== null}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          {deletingId === recipe.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

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
                  className="mt-0"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    deleteRecipe();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deletingId === recipeToDelete?.id}
                >
                  {deletingId === recipeToDelete?.id ? (
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
        </>
      )}
    </div>
  );
}
