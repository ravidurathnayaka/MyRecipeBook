import Link from "next/link";
import { Briefcase, ChefHat } from "lucide-react";
import { LoginForm } from "@/components/form/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <div className="flex gap-3 justify-center items-center">
            <div className="flex gap-1 justify-center items-center">
              <ChefHat className="w-10 h-10 text-orange-500" />
              <h1 className=" text-2xl font-bold">MyRecipeBook</h1>
            </div>
          </div>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
