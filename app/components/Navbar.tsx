"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { checkAndAddUser, syncRecurringTransactions } from "../actions";
import { Menu, X, LayoutDashboard, Landmark, ArrowLeftRight, PiggyBank } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard",    label: "Tableau de bord",   icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/budgets",      label: "Mes Budgets",        icon: <Landmark className="w-5 h-5" /> },
  { href: "/transactions", label: "Mes Transactions",   icon: <ArrowLeftRight className="w-5 h-5" /> },
  { href: "/savings",      label: "Mes Épargnes",       icon: <PiggyBank className="w-5 h-5" /> },
];

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [theme, setTheme] = useState("cupcake");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "cupcake";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Fermer le menu quand on change de page
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === "cupcake" ? "dark" : "cupcake";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      checkAndAddUser(user.primaryEmailAddress.emailAddress);
      syncRecurringTransactions(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const ThemeToggle = () => (
    <button onClick={toggleTheme} className="btn btn-ghost btn-circle" aria-label="Changer de thème">
      {theme === "cupcake" ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m9.75-9h-2.25m-13.5 0H3m15.364-6.364l-1.591 1.591M6.346 17.654l-1.591 1.591m0-11.314l1.591 1.591m11.314 11.314l1.591-1.591M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="bg-base-200/30 px-5 md:px-[10%] py-4 relative z-50">
      {isLoaded && (
        isSignedIn ? (
          <>
            {/* Barre principale */}
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/dashboard" className="flex text-2xl items-center font-bold select-none">
                Find<span className="text-accent">Track</span>
              </Link>

              {/* Liens desktop */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`btn btn-sm ${pathname === link.href ? "btn-accent text-white" : "btn-ghost"}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <ThemeToggle />
                <UserButton />
              </div>

              {/* Droite mobile : thème + user + hamburger */}
              <div className="flex md:hidden items-center gap-2">
                <ThemeToggle />
                <UserButton />
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={() => setMenuOpen(prev => !prev)}
                  aria-label="Ouvrir le menu"
                >
                  {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Menu mobile déroulant */}
            {menuOpen && (
              <div className="md:hidden absolute left-0 right-0 top-full bg-base-100 shadow-xl border-t border-base-300 z-50 animate-in slide-in-from-top-2 duration-200">
                <nav className="flex flex-col py-2">
                  {NAV_LINKS.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-colors
                        ${pathname === link.href
                          ? "bg-accent/10 text-accent border-l-4 border-accent"
                          : "hover:bg-base-200 border-l-4 border-transparent"
                        }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          /* Non connecté */
          <div className="flex items-center justify-between">
            <div className="flex text-2xl items-center font-bold">
              Find<span className="text-accent">Track</span>
            </div>
            <div className="flex gap-2">
              <Link href="/sign-in" className="btn btn-sm">Se connecter</Link>
              <Link href="/sign-up" className="btn btn-sm btn-accent">S&apos;inscrire</Link>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Navbar;
