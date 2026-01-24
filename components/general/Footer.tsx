import Link from "next/link";

const Footer = async () => {
  return (
    <footer className="bg-muted/50 w-full border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <Link href="/" className="hover:text-primary transition-colors">
          <div className="text-xl font-bold text-white">MyRecipeBook</div>
        </Link>

        <div className="text-muted-foreground text-center text-sm">
          &copy;2026 | MyRecipeBook | All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
