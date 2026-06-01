"use client";

import { useState, useEffect } from "react";
import { ProductData, AlternativeProduct } from "@/types/product";
import { CheckCircle2, XCircle, Package, ArrowRight, X } from "lucide-react";
import MethodologyModal from "./MethodologyModal";
import AlternativesWidget from "./AlternativesWidget";

interface ProductCardProps {
  productData: ProductData;
  onViewBrand?: (brandName: string) => void;
  onClose?: () => void;
  alternatives?: AlternativeProduct[];
  onSelectAlternative?: (productName: string) => void;
  isLoadingAlternatives?: boolean;
}

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ProductCard({
  productData,
  onViewBrand,
  onClose,
  alternatives = [],
  onSelectAlternative,
  isLoadingAlternatives = false,
}: ProductCardProps) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const summary = productData.summary || "";
  const shortSummary = summary.slice(0, 200);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const displayName = toTitleCase(productData.product_name);
  const displayBrand = toTitleCase(productData.brand);

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-start justify-center pt-4 px-4 pb-20 overflow-y-auto overscroll-contain"
        onClick={handleBackdropClick}
      >
        <div
          className="w-full max-w-3xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 mb-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CARD */}
          <div className="relative bg-black/65 backdrop-blur-[16px] rounded-xl border border-white/15 shadow-lg overflow-hidden">
            {/* CLOSE */}
            {onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute -top-4 -right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 shadow-[0_0_8px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer"
              >
                <X className="w-5 h-5 text-white/80 hover:text-[#E4FF3A]" />
              </button>
            )}

            {/* HEADER */}
            <div className="p-6 border-b border-white/10 flex gap-4 relative">
              <div className="w-20 h-20 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {productData.product_image ? (
                  <img
                    src={productData.product_image}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-white/40" />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white sm:text-xl break-words">
                  {displayName}
                </h2>
                <p className="text-white/60 text-sm">{displayBrand}</p>

                {(productData.sector || productData.category) && (
                  <p className="text-white/50 text-xs mt-1">
                    {productData.sector}
                    {productData.category ? ` • ${productData.category}` : ""}
                  </p>
                )}
              </div>

              {/* SCORE */}
              <div className="absolute top-6 right-6">
                <div
                  className="relative bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[110px]"
                  style={{ boxShadow: "0px 0px 8px rgba(213,255,63,0.4)" }}
                >
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold ${getScoreColor(productData.score)}`}
                    >
                      {productData.score}
                    </div>
                    <div className="text-white/80 text-xs mt-1">
                      {getScoreLabel(productData.score)}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowMethodology(true)}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-[#E4FF3A] text-xs underline"
                  >
                    Methodology
                  </button>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            {summary && (
              <div className="px-6 pt-4 pb-2 border-b border-white/10">
                <p className="text-white/70 text-sm leading-relaxed break-words">
                  {expanded
                    ? summary
                    : shortSummary + (summary.length > 200 ? "..." : "")}
                </p>

                {summary.length > 200 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[#E4FF3A] text-sm mt-1 underline"
                  >
                    {expanded ? "See Less" : "See More"}
                  </button>
                )}
              </div>
            )}

            {/* CONTENT — iç scroll kaldırıldı */}
            <div className="p-6 space-y-5">
              {/* POSITIVES */}
              {productData.positives?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#8CFF73]" />
                    <h3 className="text-base font-semibold text-white">
                      Positive Impact
                    </h3>
                  </div>

                  <ul className="space-y-2 ml-7">
                    {productData.positives.map((p, i) => (
                      <li
                        key={i}
                        className="text-white text-sm leading-relaxed"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* NEGATIVES */}
              {productData.negatives?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-[#FF9361]" />
                    <h3 className="text-base font-semibold text-white">
                      Areas of Concern
                    </h3>
                  </div>

                  <ul className="space-y-2 ml-7">
                    {productData.negatives.map((n, i) => (
                      <li
                        key={i}
                        className="text-white text-sm leading-relaxed"
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ALTERNATIVES */}
          <AlternativesWidget
            alternatives={alternatives}
            onSelectProduct={onSelectAlternative}
            isLoading={isLoadingAlternatives}
            productBrand={productData.brand}
          />
        </div>
      </div>

      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </>
  );
}
