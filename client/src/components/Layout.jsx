import React from "react";
import Navbar from "./Navbar";
import { Box, Heart, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Enhanced Footer */}
      <footer className="border-t border-slate-200/80 bg-white pt-10 pb-8 mt-16 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
                  <Box className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  BorrowBox
                </span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                A student-led campus borrowing network. Save money, reduce one-time consumption, and build a tighter student community.
              </p>
              <p className="text-xs font-semibold text-indigo-600 italic">
                "Don't buy it, borrow it."
              </p>
            </div>

            {/* Quick links */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/items" className="hover:text-indigo-600 transition-colors">
                    Browse All Items
                  </Link>
                </li>
                <li>
                  <Link to="/add-item" className="hover:text-indigo-600 transition-colors">
                    List an Item
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
                    My Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Popular categories */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Categories
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/items?category=Electronics" className="hover:text-indigo-600 transition-colors">
                    Calculators & Electronics
                  </Link>
                </li>
                <li>
                  <Link to="/items?category=Books" className="hover:text-indigo-600 transition-colors">
                    Textbooks & Prep
                  </Link>
                </li>
                <li>
                  <Link to="/items?category=Lab%20Equipment" className="hover:text-indigo-600 transition-colors">
                    Lab Coats & Goggles
                  </Link>
                </li>
                <li>
                  <Link to="/items?category=Sports" className="hover:text-indigo-600 transition-colors">
                    Sports & Fitness Gear
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>BorrowBox © 2026 • Built for campus students with React & Express</p>
            <div className="flex items-center gap-1">
              <span>Share more, waste less</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
