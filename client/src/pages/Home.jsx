import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";
import {
  Sparkles,
  ArrowRight,
  PlusCircle,
  Search,
  CheckCircle2,
  Share2,
  RotateCcw,
  Cpu,
  BookOpen,
  FlaskConical,
  Trophy,
  PenTool,
  Shirt,
  Box,
} from "lucide-react";

const CATEGORIES_DATA = [
  { name: "Electronics", icon: Cpu, color: "text-blue-600 bg-blue-50" },
  { name: "Books", icon: BookOpen, color: "text-amber-600 bg-amber-50" },
  { name: "Lab Equipment", icon: FlaskConical, color: "text-emerald-600 bg-emerald-50" },
  { name: "Sports", icon: Trophy, color: "text-indigo-600 bg-indigo-50" },
  { name: "Stationery", icon: PenTool, color: "text-purple-600 bg-purple-50" },
  { name: "Clothing", icon: Shirt, color: "text-rose-600 bg-rose-50" },
  { name: "Other", icon: Box, color: "text-slate-600 bg-slate-100" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 bg-gradient-to-b from-indigo-50/70 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Campus Resource Sharing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Don't buy it, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800">
              borrow it.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Borrow scientific calculators, lab coats, sports gear, textbooks, and chargers from fellow students instead of buying items you need only once.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link to="/items">
              <Button size="lg" className="shadow-lg shadow-indigo-300/40 text-base px-6 py-3">
                <Search className="w-4 h-4 mr-1.5" /> Browse Items
              </Button>
            </Link>

            <Link to={isAuthenticated ? "/add-item" : "/register"}>
              <Button variant="secondary" size="lg" className="text-base px-6 py-3">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Share an Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-wider font-bold text-indigo-600 mb-2">
            Simple 3-Step Process
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How BorrowBox Works
          </h3>
          <p className="text-slate-500 text-sm mt-2">
            Lending and borrowing between students is direct, safe, and free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <Card className="p-8 relative text-center flex flex-col items-center space-y-4 hover:border-indigo-200 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
              <Share2 className="w-7 h-7" />
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center -mt-2">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900">1. List Your Item</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Snap a picture or add a link, choose how many days students can borrow it, and put idle gear to good use.
            </p>
          </Card>

          {/* Step 2 */}
          <Card className="p-8 relative text-center flex flex-col items-center space-y-4 hover:border-violet-200 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center -mt-2">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900">2. Request with Dates</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Find what you need, pick your return date, and send a borrow request. The owner approves with one click.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="p-8 relative text-center flex flex-col items-center space-y-4 hover:border-emerald-200 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center -mt-2">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900">3. Borrow & Return</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Meet on campus to pick up the item. When done, hand it back and the owner marks it Returned.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Category Quick-Links Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold text-indigo-600 mb-1">
              Explore by Category
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What do you need for class today?
            </h3>
          </div>
          <Link to="/items" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Browse all items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES_DATA.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/items?category=${encodeURIComponent(cat.name)}`}
                className="group"
              >
                <Card
                  hoverEffect
                  className="p-5 flex items-center gap-4 group-hover:-translate-y-1 transition-all duration-200"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${cat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 truncate transition-colors">
                      {cat.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">Explore &rarr;</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 sm:p-14 text-white overflow-hidden shadow-2xl shadow-indigo-900/20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to stop buying things you only use once?
            </h3>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Join students already sharing textbooks, chargers, lab equipment, and sports gear on BorrowBox.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link to={isAuthenticated ? "/items" : "/register"}>
              <Button
                size="lg"
                className="bg-white text-indigo-900 hover:bg-slate-100 hover:text-indigo-950 font-bold px-8 shadow-md"
              >
                {isAuthenticated ? "Start Browsing" : "Get Started Free"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
