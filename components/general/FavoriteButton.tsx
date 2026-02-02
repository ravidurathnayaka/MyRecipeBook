"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  recipeId: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

export function FavoriteButton({
  recipeId,
  size = "default",
  variant = "outline",
}: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      checkFavorite();
    } else {
      setChecking(false);
    }
  }, [status, recipeId]);

  const checkFavorite = async () => {
    try {
      const response = await fetch(`/api/favorites/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      if (isFavorite) {
        const response = await fetch(`/api/favorites?recipeId=${recipeId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsFavorite(false);
          toast.success("Removed from favorites");
        } else {
          toast.error("Failed to remove from favorites");
        }
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId }),
        });
        if (response.ok) {
          setIsFavorite(true);
          toast.success("Added to favorites");
        } else {
          toast.error("Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses: Record<string, string> = {
    sm: "h-8 w-8 !px-0 !py-0",
    default: "h-10 w-10 !px-0 !py-0",
    lg: "h-12 w-12 !px-0 !py-0",
    icon: "h-10 w-10 !px-0 !py-0",
  };

  if (checking) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={sizeClasses[size]}
      >
        <Loader2 className="text-primary h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={loading}
      className={sizeClasses[size]}
    >
      {loading ? (
        <Loader2 className="text-primary h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 ${
            isFavorite ? "fill-destructive text-destructive" : ""
          }`}
        />
      )}
    </Button>
  );
}
