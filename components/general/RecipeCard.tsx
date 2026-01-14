import { ChefHat, Clock, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
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
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      [Category.DINNER]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      [Category.SNACK]: "bg-purple-100 text-purple-800 hover:bg-purple-200",
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
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              {recipe.makeTime} min
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
          {recipe.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
          {recipe.description}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-0 pt-4">
        <div className="flex items-center gap-2 text-slate-600">
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
        <Link href={`/recipe/${recipe.id}`}>
          <button className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 hover:shadow-md">
            View Recipe
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
