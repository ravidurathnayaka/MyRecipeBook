import { ChefHat, Clock, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";

const RecipeCard = ({ recipe }: any) => {
  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group flex flex-col self-center mx-auto pt-0">
      <div className="relative overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge className={` border-0 shadow-sm`}>{recipe.category}</Badge>
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
        <Link href="/recipe/1">
          <button className="px-4 py-2 cursor-pointer bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md">
            View Recipe
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
