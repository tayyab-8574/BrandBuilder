import React from "react";
import { Sparkles, ShieldCheck, EyeOff, Cpu } from "lucide-react";

interface HeaderProps {
  hasApiKey: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({ hasApiKey }) => {
  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-stone-900">
                Brand builder app
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
                <Cpu className="w-3 h-3 text-amber-700" />
                Nano-Banana
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Consistent multi-medium product visualizer powered by gemini-3.1-flash-lite-image
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Zero-Human Protocol:</span> No People In Shots
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
            <ShieldCheck className={`w-3.5 h-3.5 ${hasApiKey === false ? "text-amber-500" : "text-emerald-500"}`} />
            <span className="hidden sm:inline">
              {hasApiKey === false ? "Key Pending" : "API Connected"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
