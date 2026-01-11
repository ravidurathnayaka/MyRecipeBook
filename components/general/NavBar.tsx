import { ChefHat, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { auth } from "@/app/utils/auth";
import { UserDropdown } from "./UserDropdown";

const Navbar = async () => {
  const session = await auth();
  return (
    <>
      <nav className="border-b-2 px-5 py-5">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-5">
            <Link href={"/"}>
              <div className="mr-5 flex items-center justify-center gap-1">
                <ChefHat className="text-primary h-10 w-10" />
                <h1 className="text-2xl font-bold">RecipeBook</h1>
              </div>
            </Link>
          </div>
          {/* <div className="flex gap-5">
            <Link className="text-xl" href="/my-recipe">
              MyRecipe
            </Link>
            <Link className="text-xl" href="/feedback">
              FeedBack
            </Link>
          </div> */}

          <div className="flex items-center gap-5">
            <Link href="/create-recipe">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-2 py-2 font-semibold text-white shadow-md transition-colors hover:bg-slate-800">
                <Plus className="h-5 w-5" />
              </button>
            </Link>
            {session?.user ? (
              <UserDropdown
                email={session.user.email as string}
                name={session.user.name as string}
                image={session.user.image as string}
              />
            ) : (
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
