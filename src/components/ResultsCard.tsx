"use client";

import { useState, useEffect } from "react";
import { BrandData } from "@/types";
import { AlternativeBrand } from "@/types/product";
import { CheckCircle2, XCircle, X } from "lucide-react";
import MethodologyModal from "./MethodologyModal";
import BrandAlternativesWidget from "./BrandAlternativesWidget";

type ResultsCardProps = {
  brandData: BrandData;
  brandName: string;
  onCompare?: () => void;
  onClose?: () => void;
  isCompareMode?: boolean;
  alternatives?: AlternativeBrand[];
  onSelectAlternativeBrand?: (brandName: string) => void;
  isLoadingAlternatives?: boolean;
};

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function ResultsCard({
  brandData,
  brandName,
  onCompare,
  isCompareMode = false,
  onClose,
  alternatives = [],
  onSelectAlternativeBrand,
  isLoadingAlternatives = false,
}: ResultsCardProps) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  const displayName = toTitleCase(brandName);

  useEffect(() => {
    if (isCompareMode) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, isCompareMode]);

  return (
    <>
      <div
        className={
          isCompareMode
            ? "h-full"
            : "fixed inset-0 z-[60] flex items-start justify-center pt-4 px-4 pb-20 overflow-y-auto overscroll-contain"
        }
        onClick={!isCompareMode ? handleBackdropClick : undefined}
      >
        <div
          className={
            isCompareMode
              ? "w-full h-full pointer-events-auto"
              : "w-full max-w-4xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 mb-8"
          }
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`relative ${
              isCompareMode ? "h-full flex flex-col" : ""
            }`}
          >
            {!isCompareMode && onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute -top-4 -right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 shadow-[0_0_8px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 cursor-pointer"
              >
                <X className="w-5 h-5 text-white/80 hover:text-[#E4FF3A]" />
              </button>
            )}

            <div
              className={`relative bg-black/65 backdrop-blur-[16px] rounded-xl border border-white/15 shadow-lg overflow-hidden ${
                isCompareMode ? "h-full flex flex-col" : ""
              }`}
            >
              {/* HEADER */}
              <div className="p-6 border-b border-white/10 relative flex flex-col gap-4">
                <div className="flex flex-col gap-2 pr-32">
                  <h2 className="text-2xl font-bold text-white sm:text-xl">
                    {displayName}
                  </h2>

                  {brandData.sector && (
                    <p className="text-white/50 text-xs">
                      {brandData.sector}
                      {brandData.category ? ` • ${brandData.category}` : ""}
                    </p>
                  )}

                  {!isCompareMode && onCompare && (
                    <button
                      onClick={onCompare}
                      className="w-fit mt-1 px-4 py-1.5 bg-[#D5FF3F] hover:bg-[#E0FF6F] text-[#0C0C0C] text-sm font-semibold rounded-[40px] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                    >
                      Compare Brands
                    </button>
                  )}
                </div>

                <div className="absolute top-6 right-6">
                  <div
                    className="relative bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[110px]"
                    style={{ boxShadow: "0px 0px 8px rgba(213,255,63,0.4)" }}
                  >
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${getScoreColor(
                          brandData.score,
                        )}`}
                      >
                        {brandData.score}
                      </div>
                      <div className="text-white/80 text-xs font-medium mt-1">
                        {getScoreLabel(brandData.score)}
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

                {brandData.industryContext && (
                  <div className="mt-8 text-white/80 text-sm leading-relaxed">
                    {!expanded ? (
                      <>
                        <p className="line-clamp-3">
                          {brandData.industryContext}
                        </p>
                        <button
                          onClick={() => setExpanded(true)}
                          className="text-[#E4FF3A] mt-2 underline text-sm"
                        >
                          See More
                        </button>
                      </>
                    ) : (
                      <>
                        <p>{brandData.industryContext}</p>
                        <button
                          onClick={() => setExpanded(false)}
                          className="text-[#E4FF3A] mt-2 underline text-sm"
                        >
                          See Less
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* MAIN CONTENT – artık iç scroll yok */}
              <div className="p-6 space-y-5">
                {brandData.positives?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#8CFF73]" />
                      <h3 className="text-base font-semibold text-white">
                        Positive Impact
                      </h3>
                    </div>

                    <ul className="space-y-2 ml-7">
                      {brandData.positives.map((positive, i) => (
                        <li
                          key={i}
                          className="text-white text-sm leading-relaxed"
                        >
                          {positive}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {brandData.negatives?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-[#FF9361]" />
                      <h3 className="text-base font-semibold text-white">
                        Areas of Concern
                      </h3>
                    </div>

                    <ul className="space-y-2 ml-7">
                      {brandData.negatives.map((negative, i) => (
                        <li
                          key={i}
                          className="text-white text-sm leading-relaxed"
                        >
                          {negative}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isCompareMode && (
            <BrandAlternativesWidget
              alternatives={alternatives}
              onSelectBrand={(name) => onSelectAlternativeBrand?.(name)}
              isLoading={isLoadingAlternatives}
            />
          )}
        </div>
      </div>

      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </>
  );
}
