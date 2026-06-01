"use client";

import { useState, useRef, useEffect } from "react";
import { ImageUp, Search, Loader2, QrCode } from "lucide-react";

// Sample brand names for autocomplete
const BRAND_SUGGESTIONS = [
  "Apple",
  "Amazon",
  "Google",
  "Microsoft",
  "Tesla",
  "Nike",
  "Adidas",
  "Patagonia",
  "Bioderma",
  "Biotherm",
  "BMW",
  "Mercedes",
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Coca-Cola",
  "Pepsi",
  "Nestle",
  "Unilever",
  "P&G",
  "Johnson & Johnson",
  "Samsung",
  "Sony",
  "LG",
  "Panasonic",
  "Dell",
  "HP",
  "Lenovo",
  "ASUS",
  "Starbucks",
  "McDonald's",
  "Burger King",
  "KFC",
  "Subway",
  "Chipotle",
  "Walmart",
  "Target",
  "Costco",
  "IKEA",
  "H&M",
  "Zara",
  "Gap",
  "Levi's",
  "Shell",
  "ExxonMobil",
  "BP",
  "Chevron",
  "TotalEnergies",
  "Netflix",
  "Disney",
  "Warner Bros",
  "Universal",
  "Paramount",
  "Whole Foods",
  "Trader Joe's",
  "Kroger",
  "Safeway",
  "The Body Shop",
  "Lush",
  "Seventh Generation",
  "Method",
  "Ecover",
];

interface BrandSearchProps {
  onAnalyze: (brandName: string) => Promise<void>;
  isLoading: boolean;
  compareMode?: boolean;
  hidden?: boolean;
  onQRScan?: () => void;
  onImageUpload?: (file: File) => Promise<void>;
}

export default function BrandSearch({
  onAnalyze,
  isLoading,
  compareMode = false,
  hidden = false,
  onQRScan,
  onImageUpload,
}: BrandSearchProps) {
  const [brandName, setBrandName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ❗ containerRef ARTIK DIV içindir, FORM için değil
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (brandName.trim().length > 0) {
      const filtered = BRAND_SUGGESTIONS.filter((brand) =>
        brand.toLowerCase().startsWith(brandName.toLowerCase()),
      ).slice(0, 8);

      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [brandName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim() && !isLoading) {
      setShowSuggestions(false);
      await onAnalyze(brandName.trim());
      setBrandName("");
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setBrandName(suggestion);
    setShowSuggestions(false);
    await onAnalyze(suggestion);
    setBrandName("");
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !onImageUpload || isLoading) return;

    setShowSuggestions(false);
    await onImageUpload(file);
  };

  return (
    // 🔥 ref BURADA OLMALI — formda değil!
    <div
      ref={containerRef}
      className={`fixed bottom-0 left-0 right-0 z-50 pb-20 flex justify-center px-4 transition-opacity duration-300 ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative group">
          {/* Autocomplete dropdown */}
          {showSuggestions && (
            <div className="absolute bottom-full mb-2 w-full bg-black/70 backdrop-blur-[12px] rounded-xl border border-white/15 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors duration-200 border-b border-white/5 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Search container */}
          <div className="relative bg-black/35 backdrop-blur-[8px] rounded-2xl border border-white/12 shadow-[0_4px_16px_rgba(0,0,0,0.25)] overflow-hidden">
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
              <Search className="w-5 h-5 text-white/85 flex-shrink-0" />

              <input
                ref={inputRef}
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                onFocus={() =>
                  filteredSuggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder={
                  compareMode
                    ? "Search another brand to compare..."
                    : "Enter brand or product name..."
                }
                className="flex-1 bg-transparent text-white/85 placeholder:text-white/40 outline-none text-base sm:text-lg min-w-0"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!brandName.trim() || isLoading}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#D5FF3F] hover:bg-[#E0FF6F] disabled:bg-gray-600 text-[#0C0C0C] font-semibold rounded-[40px] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Analyzing...</span>
                  </>
                ) : (
                  <span>Analyze</span>
                )}
              </button>

              {onImageUpload && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 disabled:bg-gray-600 rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                    title="Upload product image"
                  >
                    <ImageUp className="w-5 h-5 text-[#E4FF3A]" />
                  </button>
                </>
              )}

              {/* QR Scanner Button */}
              {onQRScan && (
                <button
                  type="button"
                  onClick={onQRScan}
                  disabled={isLoading}
                  className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 disabled:bg-gray-600 rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                  title="Scan product barcode"
                >
                  <QrCode className="w-5 h-5 text-[#E4FF3A]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
