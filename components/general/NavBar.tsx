import { ChefHat } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = async () => {
  return (
    <nav className="flex justify-between items-center py-5 px-5 border-b-2">
      <Link href={"/"}>
        <div className="flex gap-3 justify-center items-center">
          <ChefHat className="text-primary w-10 h-10" />
          <h1 className="text-primary text-2xl font-bold">MyRecipeBook</h1>
        </div>
      </Link>
      <div className="hidden md:flex items-center gap-5">
        <Link href="/create-recipe" className={buttonVariants({ size: "lg" })}>
          Create Recipe
        </Link>
        <ThemeToggle />
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
