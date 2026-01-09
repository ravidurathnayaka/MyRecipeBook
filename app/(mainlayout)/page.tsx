import { CategorySelector } from "@/components/general/CategorySelector";
import RecipeCard from "@/components/general/RecipeCard";
import { Search } from "@/components/general/Search";
import { recipes } from "@/app/utils/data";

export default function Home() {
  return (
    <div className="mt-10 max-w-7xl mx-auto px-5">
      <div className="my-5 flex">
        <h1 className="text-2xl font-bold flex justify-center items-center text-secondary">
          All Recipes
        </h1>
        <hr />
      </div>
      <div className="grid grid-cols-3 space-y-5">
        {recipes.map((recipe, index) => (
          <RecipeCard recipe={recipe} key={index} />
        ))}
      </div>
    </div>
  );
}
