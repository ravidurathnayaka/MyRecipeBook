import Link from "next/link";

const Footer = async () => {
  return (
    <footer
      className="w-full border-t border-orange-700/30 dark:border-orange-800/50"
      style={{
        backgroundColor: "var(--footer-bg)",
      }}
    >
      <div
        className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8"
        style={{ color: "#ffffff" }}
      >
        <Link
          href="/"
          className="text-xl font-bold transition-colors hover:opacity-90"
        >
          MyRecipeBook
        </Link>
        <div className="text-center text-sm opacity-90">
          &copy;2026 | MyRecipeBook | All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
