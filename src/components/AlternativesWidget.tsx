"use client";

import { AlternativeProduct } from "@/types/product";
import { Leaf, Package, Loader2, Sparkles } from "lucide-react";

interface AlternativesWidgetProps {
  alternatives: AlternativeProduct[];
  onSelectProduct?: (productName: string) => void;
  isLoading?: boolean;

  /** Kendi ürününün sponsorlu versiyonunu gizlemek için */
  productBrand?: string;
}

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function AlternativesWidget({
  alternatives,
  onSelectProduct,
  isLoading = false,
  productBrand,
}: AlternativesWidgetProps) {
  // Kendi sponsorlu ürünü gizleme
  const filteredAlternatives = alternatives.filter(
    (alt) =>
      !(
        alt.isSponsored &&
        alt.brand?.toLowerCase() === productBrand?.toLowerCase()
      ),
  );

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
            More Eco-Friendly Alternatives
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#E4FF3A] animate-spin" />
          <span className="ml-2 text-white/60">Finding alternatives...</span>
        </div>
      </div>
    );
  }

  if (filteredAlternatives.length === 0) return null;

  return (
    <div className="mt-4 bg-black/50 backdrop-blur-[12px] rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-5 h-5 text-[#8CFF73]" />
        <h3 className="text-base font-semibold text-white">
          More Eco-Friendly Alternatives
        </h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin select-none">
        {filteredAlternatives.map((alt, index) => (
          <button
            key={index}
            onClick={() => onSelectProduct?.(alt.product_name)}
            className={`flex-shrink-0 w-40 bg-black/40 backdrop-blur-sm rounded-lg border overflow-hidden group transition-all duration-300
              ${
                alt.hasHigherScore
                  ? "border-[#8CFF73]/50 shadow-[0_0_12px_rgba(140,255,115,0.3)]"
                  : "border-white/10 hover:border-[#E4FF3A]/30"
              }
            `}
          >
            {/* SPONSORED BADGE */}
            {alt.isSponsored && (
              <div className="bg-[#E4FF3A]/20 px-2 py-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#E4FF3A]" />
                <span className="text-[#E4FF3A] text-xs font-medium">
                  Sponsored
                </span>
              </div>
            )}

            {/* IMAGE – kare format */}
            <div className="w-full aspect-square bg-black/30 flex items-center justify-center">
              {alt.product_image ? (
                <img
                  src={alt.product_image}
                  alt={alt.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-white/30" />
              )}
            </div>

            {/* INFO */}
            <div className="p-2">
              <h4 className="text-white text-xs font-medium group-hover:text-[#E4FF3A] transition-colors truncate">
                {toTitleCase(alt.product_name)}
              </h4>
              <p className="text-white/50 text-xs truncate">
                {toTitleCase(alt.brand)}
              </p>

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
