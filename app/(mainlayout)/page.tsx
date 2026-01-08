import { CategorySelector } from "@/components/general/CategorySelector";
import RecipeCard from "@/components/general/RecipeCard";
import { Search } from "@/components/general/Search";

export default function Home() {
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center">
        <CategorySelector />
        <Search />
      </div>
      <div className="mt-10 flex">
        <h1 className="text-2xl font-bold flex justify-center items-center">
          All Recipes
        </h1>
        <hr />
      </div>
      <div>
        <RecipeCard />
      </div>
    </div>
  );
}
