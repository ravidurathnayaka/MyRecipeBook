import Link from "next/link";

const Footer = async () => {
  return (
    <footer className="w-full bg-gray-900  text-gray-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4  py-6">
        <Link href="/">
          <div className="text-xl font-bold">MyRecipeBook</div>
        </Link>

        <div className="mt-4 text-center text-sm text-gray-500 md:mt-0">
          &copy;2026 | MyRecipeBook | All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
