import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import useDebounce from "../hooks/useDebounce";
import ItemCard from "../components/ItemCard";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Card from "../components/Card";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Electronics",
  "Books",
  "Lab Equipment",
  "Sports",
  "Stationery",
  "Clothing",
  "Other",
];

export default function Items() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL query parameters
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Debounce search input by 400ms to avoid spamming the backend
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Data states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, setSearchParams]);

  // Fetch items whenever search query or category changes
  useEffect(() => {
    let isActive = true;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (debouncedSearch.trim()) queryParams.append("search", debouncedSearch.trim());
        if (selectedCategory && selectedCategory !== "All") {
          queryParams.append("category", selectedCategory);
        }

        const response = await api.get(`/items?${queryParams.toString()}`);
        if (isActive && response.data?.success) {
          setItems(response.data.data || []);
        }
      } catch (err) {
        if (isActive) {
          console.error("Failed to fetch items:", err);
          setError(
            err.response?.data?.message ||
              err.userFriendlyMessage ||
              "Cannot reach server. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, selectedCategory]);

  // Client-side filter for "Available only"
  const filteredItems = useMemo(() => {
    if (!availableOnly) return items;
    return items.filter((item) => item.status === "Available");
  }, [items, availableOnly]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setAvailableOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Items
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search calculators, books, lab coats, and essentials shared by your peers.
          </p>
        </div>

        {/* Search & Toggle Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Available Only Switch */}
          <label className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm cursor-pointer select-none hover:bg-slate-50">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
            />
            <span className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Available only
            </span>
          </label>
        </div>

        {/* Category Chips Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-8 border-rose-200 bg-rose-50/50 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-rose-900">Failed to load items</h3>
            <p className="text-xs sm:text-sm text-rose-600 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={fetchItems}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Request
          </Button>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="aspect-[4/3] bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 font-medium mb-4">
            Showing {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <EmptyState
          icon={Search}
          title="No items found"
          text={
            searchTerm || selectedCategory !== "All" || availableOnly
              ? "We couldn't find anything matching your filters. Try clearing them or using a broader search term."
              : "No items have been listed yet. Be the first to share something with your campus!"
          }
          action={
            (searchTerm || selectedCategory !== "All" || availableOnly) ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            ) : null
          }
        />
      )}
    </div>
  );
}
