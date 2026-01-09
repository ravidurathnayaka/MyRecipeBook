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
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group flex flex-col self-center mx-auto pt-0">
      <div className="relative overflow-hidden">
        <img
          src={
            recipe.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
          }
          alt={recipe.title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge
            className={`${getCategoryColor(
              recipe.category
            )} border-0 shadow-sm`}
          >
            {recipe.category}
          </Badge>
        </div>
        {recipe.makeTime && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              {recipe.makeTime} min
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {recipe.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-slate-600">
          {recipe.author ? (
            <>
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{recipe.author.name}</span>
            </>
          ) : (
            <>
              <ChefHat className="w-4 h-4" />
              <span className="text-sm font-medium">Anonymous</span>
            </>
          )}
        </div>
        <Link href={`/recipe/${recipe.id}`}>
          <button className="px-4 py-2 cursor-pointer bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md">
            View Recipe
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
