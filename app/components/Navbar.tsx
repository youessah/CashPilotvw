"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect } from "react";
import { checkAndAddUser, syncRecurringTransactions } from "../actions";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  const [theme, setTheme] = React.useState("cupcake");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "cupcake";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "cupcake" ? "dark" : "cupcake";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      checkAndAddUser(user?.primaryEmailAddress?.emailAddress)
      syncRecurringTransactions(user.primaryEmailAddress.emailAddress)
    }
  }, [user])


  return (
    <div className="bg-base-200/30 px-5 md:px-[10%] py-4">
      {isLoaded &&
        (isSignedIn ? (
          <>
            <div className="flex justify-between items-center">
              <div className="flex text-2xl items-center font-bold">
                find <span className="text-accent">.Track</span>
              </div>

              <div className="md:flex hidden items-center">
                <Link href={"/budjets"} className="btn">
                  Mes budjets
                </Link>
                <Link href={"/dashboard"} className="btn mx-4">
                  Tableau de bord
                </Link>
                <Link href={"/transactions"} className="btn mr-4">
                  Mes Transactions
                </Link>
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle mr-2">
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
              </div>
              <UserButton />
            </div>

            <div className="md:hidden flex mt-2 justify-center">
              <Link href={"/budjets"} className="btn btn-sm">
                Mes budjets
              </Link>
              <Link href={"/dashboard"} className="btn mx-4 btn-sm">
                Tableau de bord
              </Link>
              <Link href={"/transactions"} className="btn btn-sm">
                Mes Transactions
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex text-2xl items-center font-bold">
              find <span className="text-accent">.Track</span>
            </div>
            <div className=" flex mt-2 justify-center">
              <Link href={"/sign-in"} className="btn btn-sm">
                Se connecter
              </Link>
              <Link href={"/sign-up"} className="btn mx-4 btn-sm btn-accent">
                Sinscrire
              </Link>

            </div>
          </div>
        ))}
    </div>
  );
};

export default Navbar;
