"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Wallet, TrendingUp, Shield, PieChart } from "lucide-react";

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen overflow-hidden bg-[#0f172a] relative selection:bg-purple-500/30">
      <div data-theme="dark" className="relative z-50">
        <Navbar />
      </div>

      {/* Dynamic Background Blobs - Soft & Modern */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[30%] w-[600px] h-[600px] bg-pink-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 isolate pt-20 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">

            {/* Title - Bigger, Bolder, Gradient */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 drop-shadow-2xl">
              <span className="block text-white mb-2">Prenez le contrôle</span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient-x">
                de vos finances
              </span>
            </h1>

            {/* Subtext - Cleaned up */}
            <p className="mt-8 text-xl leading-8 text-gray-300 max-w-2xl mx-auto font-light">
              Une solution élégante et fluide pour suivre vos revenus et atteindre vos objectifs d'épargne.
            </p>

            {/* Buttons - Modern & Soft Glow */}
            <div className="mt-12 flex items-center justify-center gap-x-6">
              {!isSignedIn ? (
                <>
                  <Link
                    href={"/sign-up"}
                    className="group relative rounded-full bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-2xl backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 hover:shadow-purple-500/20 border border-white/20 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Commencer <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  </Link>
                  <Link href={"/sign-in"} className="text-base font-semibold leading-6 text-gray-300 hover:text-white transition-colors">
                    Se connecter <span aria-hidden="true">→</span>
                  </Link>
                </>
              ) : (
                <Link
                  href={"/dashboard"}
                  className="group relative rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 text-lg font-bold text-white shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  Accéder à mon espace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Feature Grid - Softer Glassmorphism */}
          <div className="mx-auto mt-24 max-w-7xl px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {[
                {
                  name: "Suivi Intuitif",
                  description: "Visualisez vos flux financiers en un clin d'œil.",
                  icon: PieChart,
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  name: "Budgets Intelligents",
                  description: "Maîtrisez vos dépenses sans effort.",
                  icon: Wallet,
                  color: "from-purple-500 to-indigo-500"
                },
                {
                  name: "Épargne Simplifiée",
                  description: "Réalisez vos projets à votre rythme.",
                  icon: TrendingUp,
                  color: "from-pink-500 to-rose-500"
                },
              ].map((feature, idx) => (
                <div
                  key={feature.name}
                  className={`group relative flex flex-col items-center text-center p-8 rounded-3xl glass-card transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 border border-white/5 hover:border-white/20 overflow-hidden`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Hover Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{feature.name}</h3>
                  <p className="text-gray-400 relative z-10 group-hover:text-gray-200 transition-colors">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
