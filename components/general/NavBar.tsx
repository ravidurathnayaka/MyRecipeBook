import { ChefHat } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { auth } from "@/app/utils/auth";
import { UserDropdown } from "./UserDropdown";

const Navbar = async () => {
  const session = await auth();
  return (
    <nav className="py-5 border-b-2 px-5">
      <div className="max-w-7xl flex justify-between items-center mx-auto">
        <div className="flex flex-row justify-center items-center gap-5">
          <Link href={"/"}>
            <div className="flex gap-1 justify-center items-center mr-5">
              <ChefHat className="w-10 h-10 text-primary" />
              <h1 className=" text-2xl font-bold">MyRecipeBook</h1>
            </div>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-5">
          <ThemeToggle />
          <Link
            href="/create-recipe"
            className={buttonVariants({ size: "lg" })}
          >
            Add Recipe +
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
  );
};

export default Navbar;
