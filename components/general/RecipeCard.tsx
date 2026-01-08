import { ChefHat, Clock, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";

const RecipeCard = ({ recipe }: any) => {
  const sampleRecipe = {
    id: "1",
    title: "Homemade Margherita Pizza",
    description:
      "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
    makeTime: 45,
    category: "DINNER",
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    author: { name: "Chef Mario" },
    createdAt: new Date("2024-01-15"),
  };

  const data = recipe || sampleRecipe;
  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
      <div className="relative overflow-hidden">
        <img
          src={data.imageUrl}
          alt={data.title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge className={` border-0 shadow-sm`}>{data.category}</Badge>
        </div>
        {data.makeTime && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              {data.makeTime} min
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {data.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
          {data.description}
        </p>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-slate-600">
          {data.author ? (
            <>
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{data.author.name}</span>
            </>
          ) : (
            <>
              <ChefHat className="w-4 h-4" />
              <span className="text-sm font-medium">Anonymous</span>
            </>
          )}
        </div>
        <Link href="/recipe/1">
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md">
            View Recipe
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
