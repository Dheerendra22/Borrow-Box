import React, { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "./Badge";
import Card from "./Card";
import { Clock, User } from "lucide-react";

const FALLBACK_IMAGE = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image+Available";

export default function ItemCard({ item }) {
  const [imgSrc, setImgSrc] = useState(item.imageUrl || FALLBACK_IMAGE);

  const conditionColors = {
    New: "text-emerald-700 bg-emerald-50 border-emerald-200/60",
    Good: "text-blue-700 bg-blue-50 border-blue-200/60",
    Fair: "text-amber-700 bg-amber-50 border-amber-200/60",
  };

  return (
    <Link to={`/items/${item._id}`} className="group block focus:outline-none">
      <Card
        hoverEffect
        className="h-full flex flex-col group-hover:-translate-y-1.5 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/10 group-focus:ring-2 group-focus:ring-indigo-500"
      >
        {/* Item Image with Fallback and Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={imgSrc}
            alt={item.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Status Badge overlay */}
          <div className="absolute top-3 right-3 shadow-sm">
            <Badge status={item.status} />
          </div>

          {/* Category Chip overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-white/50">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                  conditionColors[item.condition] || "text-slate-600 bg-slate-50 border-slate-200"
                }`}
              >
                {item.condition} Condition
              </span>
              <span className="flex items-center text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Up to {item.maxDays}d
              </span>
            </div>

            <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h3>

            {item.description && (
              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Owner details */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3" />
              </div>
              <span className="truncate font-medium text-slate-700">
                {item.owner?.name || "Student"}
              </span>
            </div>
            <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
              View &rarr;
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
