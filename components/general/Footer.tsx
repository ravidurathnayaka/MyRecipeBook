import Link from "next/link";

const Footer = async () => {
  return (
    <footer className="border-primary/20 bg-primary text-primary-foreground w-full border-t shadow-[0_-4px_14px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_14px_-4px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold transition-opacity hover:opacity-90"
        >
          MyRecipeBook
        </Link>
        <div className="text-primary-foreground/90 text-center text-sm">
          &copy;2026 | MyRecipeBook | All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
