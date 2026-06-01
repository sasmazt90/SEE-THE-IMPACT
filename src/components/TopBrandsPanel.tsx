"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles, ArrowRight, Trophy } from "lucide-react";

interface TopBrand {
  brand_name: string;
  score: number;
  sector: string;
  reason: string;
  isSponsored?: boolean;
  url?: string;
}

interface TopBrandsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBrand: (brandName: string) => void;
}

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function TopBrandsPanel({
  isOpen,
  onClose,
  onSelectBrand,
}: TopBrandsPanelProps) {
  const [brands, setBrands] = useState<TopBrand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && brands.length === 0) fetchTopBrands();
  }, [isOpen]);

  const fetchTopBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/top-brands");
      const data = await res.json();
      setBrands(data.brands || []);
    } catch (e) {
      setError("Unable to load top brands");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-500";
    return "text-orange-500";
  };

  // ⭐ NEW: Sadece AI markalar için sıra sayacı
  let rankCounter = 1;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg bg-black/70 backdrop-blur-[16px] rounded-xl border border-white/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E4FF3A]/20 rounded-lg">
              <Trophy className="w-5 h-5 text-[#E4FF3A]" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Top 10 Sustainable Brands
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {brands.map((brand, index) => {
            const isSponsored = brand.isSponsored;

            // ⭐ NEW: Eğer AI markaysa rankCounter kullan
            const displayRank = !isSponsored ? rankCounter : null;

            // RankCounter’ı sadece AI itemlerde artır
            if (!isSponsored) rankCounter++;

            return (
              <button
                key={index}
                onClick={() => onSelectBrand(brand.brand_name)}
                className="w-full p-4 bg-black/30 hover:bg-black/50 rounded-lg border border-white/10 hover:border-[#E4FF3A]/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20 text-white/70">
                    {isSponsored ? (
                      <Sparkles className="w-4 h-4 text-[#E4FF3A]" />
                    ) : (
                      <span className="text-sm font-bold">{displayRank}</span>
                    )}
                  </div>

                  {/* Brand Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">
                        {toTitleCase(brand.brand_name)}
                      </h3>

                      {isSponsored && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#E4FF3A]/20 rounded-full">
                          <Sparkles className="w-3 h-3 text-[#E4FF3A]" />
                          <span className="text-[#E4FF3A] text-xs font-medium">
                            Sponsored
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-sm">{brand.sector}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span
                      className={`text-2xl font-bold ${getScoreColor(
                        brand.score,
                      )}`}
                    >
                      {brand.score}
                    </span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-white/30" />
                </div>

                {brand.reason && (
                  <p className="text-white/60 text-xs mt-2 text-left line-clamp-1">
                    {brand.reason}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 text-center text-white/40 text-xs">
          Rankings based on environmental impact and sustainability initiatives
        </div>
      </div>
    </div>
  );
}
