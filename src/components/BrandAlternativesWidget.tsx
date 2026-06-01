"use client";

import { AlternativeBrand } from "@/types/product";
import { Leaf, Building2, Loader2, Sparkles, ExternalLink } from "lucide-react";

interface BrandAlternativesWidgetProps {
  alternatives: AlternativeBrand[];
  onSelectBrand?: (brandName: string) => void; // expects string
  isLoading?: boolean;
}

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BrandAlternativesWidget({
  alternatives,
  onSelectBrand,
  isLoading = false,
}: BrandAlternativesWidgetProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-500";
    return "text-orange-500";
  };

  if (isLoading) {
    return (
      <div className="mt-4 bg-black/50 backdrop-blur-[12px] rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-[#8CFF73]" />
          <h3 className="text-lg font-semibold text-white">
            Alternative Brands
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#E4FF3A] animate-spin" />
          <span className="ml-2 text-white/60">Finding alternatives...</span>
        </div>
      </div>
    );
  }

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 bg-black/50 backdrop-blur-[12px] rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-5 h-5 text-[#8CFF73]" />
        <h3 className="text-base font-semibold text-white">
          Alternative Brands
        </h3>
      </div>

      {/* Horizontal scroll list */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {alternatives.map((alt, index) => (
          <button
            key={index}
            onClick={() => onSelectBrand?.(alt.brand_name)} // ✔ STRING gönderiyor
            className={`relative flex-shrink-0 w-36 sm:w-40 bg-black/40 backdrop-blur-sm rounded-lg border transition-all duration-300 overflow-hidden group ${
              alt.hasHigherScore
                ? "border-[#8CFF73]/50 shadow-[0_0_12px_rgba(140,255,115,0.3)]"
                : "border-white/10 hover:border-[#E4FF3A]/30"
            }`}
          >
            {/* Sponsored Badge (overlay, layout'ı bozmaz) */}
            {alt.isSponsored && (
              <div className="absolute top-1 left-1 right-1 flex items-center justify-center pointer-events-none">
                <div className="bg-[#E4FF3A]/20 px-2 py-1 flex items-center justify-center gap-1 rounded-md">
                  <Sparkles className="w-3 h-3 text-[#E4FF3A]" />
                  <span className="text-[#E4FF3A] text-xs font-medium">
                    Sponsored
                  </span>
                </div>
              </div>
            )}

            {/* Brand Logo – kare alan */}
            <div className="w-full aspect-square bg-black/30 flex items-center justify-center mt-6">
              {alt.logo_url ? (
                <img
                  src={alt.logo_url}
                  alt={alt.brand_name}
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <Building2 className="w-8 h-8 text-white/30" />
              )}
            </div>

            {/* Brand Info */}
            <div className="p-2">
              <div className="flex items-center gap-1">
                <h4 className="text-white text-xs font-medium truncate flex-1 group-hover:text-[#E4FF3A] transition-colors">
                  {toTitleCase(alt.brand_name)}
                </h4>

                {alt.url && (
                  <a
                    href={alt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // prevent blocking onSelect
                    className="text-white/40 hover:text-[#E4FF3A] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Score */}
              <div className="flex items-center justify-between mt-1">
                <span
                  className={`text-base font-bold ${getScoreColor(alt.score)}`}
                >
                  {alt.score}
                </span>
                <span className="text-white/40 text-[10px]">score</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
