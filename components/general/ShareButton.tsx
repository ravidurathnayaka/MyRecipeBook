"use client";

import { useState } from "react";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  recipeId: string;
  recipeTitle: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

export function ShareButton({
  recipeId,
  recipeTitle,
  size = "default",
  variant = "outline",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const getRecipeUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/recipe/${recipeId}`;
    }
    return "";
  };

  const handleCopyLink = async () => {
    try {
      setLoading(true);
      const url = getRecipeUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = getRecipeUrl();
    const text = `Check out this recipe: ${recipeTitle}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipeTitle,
          text: text,
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error)?.name !== "AbortError") {
          console.error("Error sharing:", error);
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to copy if share API not available
      handleCopyLink();
    }
  };

  const sizeClasses: Record<string, string> = {
    sm: "h-8 w-8 p-0",
    default: "h-10 w-10 p-0",
    lg: "h-12 w-12 p-0",
    icon: "h-10 w-10 p-0",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={sizeClasses[size]}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : copied ? (
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Recipe
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
