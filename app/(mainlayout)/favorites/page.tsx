"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RecipeCard from "@/components/general/RecipeCard";
import { Category } from "@/lib/types";

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
  createdAt: string;
  updatedAt: string;
}

const FAVORITES_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let favoritesCache: {
  userId: string;
  data: Recipe[];
  timestamp: number;
} | null = null;

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      const cached =
        favoritesCache &&
        favoritesCache.userId === userId &&
        Date.now() - favoritesCache.timestamp < FAVORITES_CACHE_DURATION_MS;
      if (cached && favoritesCache) {
        setRecipes(favoritesCache.data);
        setFilteredRecipes(favoritesCache.data);
        setLoading(false);
        return;
      }
      fetchFavorites();
    }
  }, [status, session, router]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [searchQuery, recipes]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/favorites");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        // If error, set empty array instead of throwing
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to fetch favorites:",
          errorData.message || "Unknown error",
        );
        setRecipes([]);
        setFilteredRecipes([]);
        return;
      }

      const data = await response.json();
      const recipesArray = Array.isArray(data) ? data : [];
      setRecipes(recipesArray);
      setFilteredRecipes(recipesArray);
      if (session?.user?.id) {
        favoritesCache = {
          userId: session.user.id,
          data: recipesArray,
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      // Set empty arrays on error to prevent crashes
      setRecipes([]);
      setFilteredRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Heart className="h-8 w-8 fill-red-500 text-red-500" />
          <h1 className="text-3xl font-bold">My Favorites</h1>
        </div>
        <p className="text-muted-foreground">Your saved recipes collection</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pl-10"
          />
        </div>
      </div>

      {/* Recipes Grid / Loading / Empty */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-semibold">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No recipes match your search"
                : "Start adding recipes to your favorites to see them here"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/")}
                className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors"
              >
                Browse Recipes
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 justify-items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
