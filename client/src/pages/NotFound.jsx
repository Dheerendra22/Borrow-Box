import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { Box, ArrowRight, Search, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      {/* Visual illustration badge */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-200/50 flex items-center justify-center text-indigo-600 shadow-inner">
          <Box className="w-12 h-12 text-indigo-600 animate-bounce" />
        </div>
        <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-md">
          404
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        Item or Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        The link you followed doesn't exist, has been removed, or was moved to another shelf in our campus box.
      </p>

      {/* Helpful Action Links */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button size="md">
            Go to Home <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>

        <Link to="/items">
          <Button variant="secondary" size="md">
            <Search className="w-4 h-4 mr-1.5" /> Browse Items
          </Button>
        </Link>

        <Link to="/dashboard">
          <Button variant="ghost" size="md">
            <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
