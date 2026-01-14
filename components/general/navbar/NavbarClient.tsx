"use client";

import { BookOpen, ChefHat, Info, Plus, Menu, X, Home } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../../ui/button";
import { UserDropdown } from "../UserDropdown";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect } from "react";

const NavBarClient = ({ session }: { session: any }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = pathname === "/my-recipe";
  const isActiveAbout = pathname === "/";

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      isActive: isActiveAbout,
    },
    {
      href: "/my-recipe",
      label: "My Recipes",
      icon: BookOpen,
      isActive: isActive,
    },
  ];

  return (
    <>
      <nav className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b-2 py-1 backdrop-blur">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <ChefHat className="text-primary h-8 w-8 sm:h-10 sm:w-10" />
              <h1 className="text-xl font-bold sm:text-2xl">RecipeBook</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-2 md:flex lg:gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "group flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-all duration-300",
                      "hover:bg-primary/10 hover:text-primary",
                      link.isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-foreground/70",
                    )}
                    aria-current={link.isActive ? "page" : undefined}
                  >
                    <Icon
                      className={clsx(
                        "h-5 w-5 transition-transform duration-300",
                        link.isActive ? "scale-110" : "group-hover:scale-110",
                      )}
                    />
                    <span className="hidden lg:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-3 md:flex">
              {session?.user ? (
                <div className="flex place-content-center gap-5">
                  <Link
                    href="/create-recipe"
                    className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-md bg-slate-900 font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    <Plus className="flex h-5 w-5" />
                  </Link>
                  <UserDropdown
                    email={session.user.email as string}
                    name={session.user.name as string}
                    image={session.user.image as string}
                  />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hover inline-flex items-center gap-2 rounded-lg border-2 px-6 py-3 font-semibold transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <span className="hidden lg:inline">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/create-recipe"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-lg p-2 shadow-md transition-all"
              >
                <Plus className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover:bg-accent rounded-lg p-2 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={clsx(
            "bg-background fixed top-16 right-0 left-0 z-50 border-b-2 shadow-lg transition-all duration-300 ease-in-out md:hidden",
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-full opacity-0",
          )}
        >
          <div className="space-y-4 px-4 py-6">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition-all",
                      link.isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Section */}
            <div className="border-t pt-4">
              {session?.user ? (
                <div className="space-y-3">
                  <div className="bg-accent/50 flex items-center gap-3 rounded-lg px-2 py-3">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                        <span className="text-primary text-xl font-semibold">
                          {session.user.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-muted-foreground truncate text-sm">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/api/auth/signout"
                    className={clsx(
                      "flex w-full justify-center",
                      buttonVariants({ variant: "outline" }),
                    )}
                  >
                    Sign Out
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={clsx(
                    "flex w-full justify-center",
                    buttonVariants({ variant: "default" }),
                  )}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBarClient;
