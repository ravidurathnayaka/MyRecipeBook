import { ChefHat, Clock, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";

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

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({
  recipe,
  onClick,
}) => {
  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      [Category.DINNER]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800",
      [Category.SNACK]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    };
    return colors[category];
  };
  return (
    <Card className="group mx-auto flex h-full w-full max-w-sm flex-col self-center overflow-hidden border-0 pt-0 shadow-md transition-all duration-300 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={
            recipe.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
          }
          alt={recipe.title}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge
            className={`${getCategoryColor(
              recipe.category,
            )} border-0 shadow-sm`}
          >
            {recipe.category}
          </Badge>
        </div>
        {recipe.makeTime && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-background/95 dark:bg-background/80 px-3 py-1.5 shadow-md backdrop-blur-sm border border-border/50">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {recipe.makeTime} min
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="line-clamp-2 text-xl font-bold text-card-foreground transition-colors group-hover:text-primary">
          {recipe.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-0 pt-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {recipe.author ? (
            <>
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{recipe.author.name}</span>
            </>
          ) : (
            <>
              <ChefHat className="h-4 w-4" />
              <span className="text-sm font-medium">Anonymous</span>
            </>
          )}
        </div>
        <Link href={`/recipe/${recipe.id}`} className="shrink-0">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            aria-label={`View recipe: ${recipe.title}`}
          >
            View Recipe
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
