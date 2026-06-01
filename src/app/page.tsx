"use client";

import { useState, useEffect, useRef } from "react";
import BackgroundLayer from "@/components/BackgroundLayer";
import CompareSlider from "@/components/CompareSlider";
import TopBrandsButton from "@/components/TopBrandsButton";
import TopBrandsPanel from "@/components/TopBrandsPanel";
import BrandSearch from "@/components/BrandSearch";
import ResultsCard from "@/components/ResultsCard";
import ProductCard from "@/components/ProductCard";
import QRScannerModal from "@/components/QRScannerModal";
import ContactButton from "@/components/ContactButton";
import ContactModal from "@/components/ContactModal";
import { Toaster } from "@/components/ui/toaster";

import { Theme, BrandData, BackgroundMode } from "@/types";
import {
  ProductData,
  AlternativeProduct,
  AlternativeBrand,
} from "@/types/product";

import { getThemeByIndex, getNextThemeIndex } from "@/lib/themes";
import { analyzeBrand } from "@/lib/analyzeBrand";
import {
  analyzeProduct,
  getAlternatives,
  getBrandAlternatives,
} from "@/lib/analyzeProduct";

import { Search, Loader2, X } from "lucide-react";

// SAMPLE SUGGESTIONS
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

export default function Page() {
  const [themeIndex, setThemeIndex] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [brandName, setBrandName] = useState<string>("");

  const [brandData2, setBrandData2] = useState<BrandData | null>(null);
  const [brandName2, setBrandName2] = useState<string>("");

  const [compareMode, setCompareMode] = useState(false);

  const [backgroundMode, setBackgroundMode] =
    useState<BackgroundMode>("dynamic");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const [compareBrandInput, setCompareBrandInput] = useState("");
  const [showCompareSuggestions, setShowCompareSuggestions] = useState(false);
  const [filteredCompareSuggestions, setFilteredCompareSuggestions] = useState<
    string[]
  >([]);

  const [showContactModal, setShowContactModal] = useState(false);
  const [showTopBrandsPanel, setShowTopBrandsPanel] = useState(false);

  // PRODUCT
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [brandAlternatives, setBrandAlternatives] = useState<
    AlternativeBrand[]
  >([]);

  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [isLoadingBrandAlternatives, setIsLoadingBrandAlternatives] =
    useState(false);

  const [showQRScanner, setShowQRScanner] = useState(false);

  // refs
  const compareInputRef = useRef<HTMLDivElement>(null);
  // Start the cinematic sequence with City, then move to Earth and Underwater.
  useEffect(() => {
    setThemeIndex(3);
  }, []);

  // AUTOCOMPLETE
  useEffect(() => {
    if (compareBrandInput.trim().length > 0) {
      const filtered = BRAND_SUGGESTIONS.filter((brand) =>
        brand.toLowerCase().startsWith(compareBrandInput.toLowerCase()),
      ).slice(0, 8);

      setFilteredCompareSuggestions(filtered);
      setShowCompareSuggestions(filtered.length > 0);
    } else {
      setShowCompareSuggestions(false);
      setFilteredCompareSuggestions([]);
    }
  }, [compareBrandInput]);

  // CLICK OUTSIDE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        compareInputRef.current &&
        !compareInputRef.current.contains(event.target as Node)
      ) {
        setShowCompareSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // THEME BUTTON RESET
  const handleThemeChange = () => {
    setThemeIndex((current) => getNextThemeIndex(current ?? 3));
    setSliderPosition(50);

    setBrandData(null);
    setBrandName("");

    setBrandData2(null);
    setBrandName2("");

    setCompareMode(false);
    setBackgroundMode("dynamic");

    setCompareBrandInput("");

    setProductData(null);
    setAlternatives([]);
    setBrandAlternatives([]);
  };

  // BRAND ANALYSIS
  const handleBrandAnalysis = async (name: string) => {
    setIsLoading(true);
    setBrandAlternatives([]);

    try {
      const data = await analyzeBrand(name);
      setBrandData(data);
      setBrandName(name);

      setBackgroundMode("brand");
      setProductData(null);
      setAlternatives([]);

      setIsLoadingBrandAlternatives(true);
      const alts = await getBrandAlternatives(name, data.sector, data.score);
      setBrandAlternatives(alts);
    } catch (error) {
      console.error("Error analyzing brand:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingBrandAlternatives(false);
    }
  };

  // PRODUCT ANALYSIS
  const handleProductAnalysis = async (
    productName: string,
    barcode?: string,
  ) => {
    setIsLoading(true);
    setProductData(null);

    setAlternatives([]);
    setBrandData(null);
    setBrandName("");

    setBrandAlternatives([]);

    try {
      const data = await analyzeProduct(productName, barcode);
      setProductData(data);

      setBackgroundMode("brand");

      setIsLoadingAlternatives(true);

      const alts = await getAlternatives(
        data.product_name,
        data.sector,
        data.score,
      );

      setAlternatives(alts);
    } catch (error) {
      console.error("Error analyzing product:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingAlternatives(false);
    }
  };

  // QR SCAN
  const handleQRScan = (code: string) => {
    setShowQRScanner(false);
    handleProductAnalysis(code, code);
  };

  // SELECT ALTERNATIVE PRODUCT
  const handleSelectAlternative = async (productName: string) => {
    await handleProductAnalysis(productName);
  };

  // 🔥🔥🔥 CRITICAL FIX → AlternativeBrand expected
  const handleSelectAlternativeBrand = async (brandName: string) => {
    await handleBrandAnalysis(brandName);
  };

  // VIEW BRAND FROM PRODUCT CARD
  const handleViewBrandFromProduct = async (brandName: string) => {
    setProductData(null);
    setAlternatives([]);

    await handleBrandAnalysis(brandName);
  };

  // CLOSE PRODUCT
  const handleCloseProductCard = () => {
    setProductData(null);
    setAlternatives([]);
    setBackgroundMode("dynamic");
  };

  // COMPARE BRAND SUBMIT
  const handleCompareBrandAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareBrandInput.trim() || isLoading2) return;

    setIsLoading2(true);
    setShowCompareSuggestions(false);

    try {
      const data = await analyzeBrand(compareBrandInput.trim());
      setBrandData2(data);
      setBrandName2(compareBrandInput.trim());
      setCompareBrandInput("");
    } catch (error) {
      console.error("Error analyzing brand:", error);
    } finally {
      setIsLoading2(false);
    }
  };

  // CLICK AUTOCOMPLETE SUGGESTION
  const handleCompareSuggestionClick = async (suggestion: string) => {
    setCompareBrandInput(suggestion);
    setShowCompareSuggestions(false);

    setIsLoading2(true);

    try {
      const data = await analyzeBrand(suggestion);
      setBrandData2(data);
      setBrandName2(suggestion);

      setCompareBrandInput("");
    } catch (error) {
      console.error("Error analyzing brand:", error);
    } finally {
      setIsLoading2(false);
    }
  };

  const handleCompareMode = () => setCompareMode(true);

  const handleBackToSingleView = () => {
    setCompareMode(false);
    setBrandData2(null);
    setBrandName2("");
    setCompareBrandInput("");
  };

  // CLOSE RESULTS
  const handleCloseResults = (e?: React.MouseEvent | KeyboardEvent) => {
    if (
      e &&
      "target" in e &&
      e.target !== e.currentTarget &&
      !(e instanceof KeyboardEvent)
    ) {
      return;
    }

    setBrandData(null);
    setBrandName("");

    setBrandData2(null);
    setBrandName2("");

    setCompareMode(false);
    setBackgroundMode("dynamic");

    setCompareBrandInput("");

    setProductData(null);
    setAlternatives([]);
    setBrandAlternatives([]);
  };

  // ESC CLOSE IN COMPARE MODE
  useEffect(() => {
    if (!compareMode) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseResults();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [compareMode]);

  if (!themeIndex) return null;

  const currentTheme: Theme = getThemeByIndex(themeIndex);
  const showSlider = backgroundMode === "dynamic";
  const showHeroText = !brandData && !productData;
  const showSearchBar = !brandData && !productData;

  const averageScore =
    brandData && brandData2
      ? Math.round((brandData.score + brandData2.score) / 2)
      : (productData?.score ?? brandData?.score ?? 50);

  const handleDynamicVideoEnded = () => {
    if (backgroundMode !== "dynamic" || brandData || productData) return;
    setThemeIndex((current) => getNextThemeIndex(current ?? 3));
    setSliderPosition(50);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* BACKGROUND */}
      <BackgroundLayer
        theme={currentTheme}
        sliderPosition={sliderPosition}
        backgroundMode={backgroundMode}
        brandScore={averageScore}
        onDynamicVideoEnded={handleDynamicVideoEnded}
      />

      {showSlider && (
        <CompareSlider value={sliderPosition} onChange={setSliderPosition} />
      )}

      {/* SPLIT BAR */}
      {backgroundMode === "brand" && (
        <div className="fixed inset-0 z-[16] pointer-events-none">
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `${averageScore}%`,
              width: "3px",
              marginLeft: "-1.5px",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "#E4FF3A",
                boxShadow:
                  "0 0 14px rgba(228,255,58,0.3), 0 0 28px rgba(228,255,58,0.2)",
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center"
                style={{
                  border: "3px solid #E4FF3A",
                  boxShadow:
                    "0 0 16px rgba(228,255,58,0.3), 0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                <div className="flex gap-1">
                  <div
                    className="w-0.5 h-4 rounded-full"
                    style={{ backgroundColor: "rgba(228,255,58,0.7)" }}
                  />
                  <div
                    className="w-0.5 h-4 rounded-full"
                    style={{ backgroundColor: "rgba(228,255,58,0.7)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      {showHeroText && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 pb-24 md:pb-0">
          <h1 className="text-[#F3F3F3] text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-center leading-none mb-6">
            SEE THE IMPACT.
            <br />
            CHANGE THE FUTURE.
          </h1>
          <p
            className="text-white text-lg md:text-xl max-w-3xl text-center px-4 font-medium leading-relaxed"
            style={{ textShadow: "0px 3px 12px rgba(0,0,0,0.8)" }}
          >
            A real-time sustainability lens of brands.
            <br />
            Search and instantly see whether the world behind them looks cleaner
            — or more polluted.
          </p>
        </div>
      )}

      {/* TOP BRANDS BUTTON */}
      <TopBrandsButton onClick={() => setShowTopBrandsPanel(true)} />

      {/* TOP BRANDS PANEL */}
      <TopBrandsPanel
        isOpen={showTopBrandsPanel}
        onClose={() => setShowTopBrandsPanel(false)}
        onSelectBrand={handleBrandAnalysis}
      />

      {/* BRAND SEARCH */}
      <BrandSearch
        onAnalyze={handleBrandAnalysis}
        isLoading={isLoading}
        compareMode={compareMode}
        hidden={!showSearchBar}
        onQRScan={() => setShowQRScanner(true)}
      />

      {/* QR SCANNER */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />

      {/* PRODUCT CARD */}
      {productData && (
        <ProductCard
          productData={productData}
          onViewBrand={handleViewBrandFromProduct}
          onClose={handleCloseProductCard}
          alternatives={alternatives}
          onSelectAlternative={handleSelectAlternative}
          isLoadingAlternatives={isLoadingAlternatives}
        />
      )}

      {/* BRAND RESULTS */}
      {brandData && !compareMode && (
        <ResultsCard
          brandData={brandData}
          brandName={brandName}
          onCompare={handleCompareMode}
          onClose={handleCloseResults}
          alternatives={brandAlternatives}
          onSelectAlternativeBrand={handleSelectAlternativeBrand}
          isLoadingAlternatives={isLoadingBrandAlternatives}
        />
      )}

      {/* COMPARE MODE */}
      {brandData && compareMode && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-4 p-4 pb-20 overflow-y-auto overscroll-contain"
          onClick={handleCloseResults}
        >
          <div
            className="relative w-full max-w-7xl min-h-0 flex flex-col lg:h-[calc(100vh-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseResults}
              className="absolute top-0 right-0 z-10 p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 hover:border-[#E4FF3A]/30 transition-all duration-300"
            >
              <X className="w-5 h-5 text-white/70 hover:text-[#E4FF3A]" />
            </button>

            <div className="flex justify-center mb-4 flex-shrink-0">
              <button
                onClick={handleBackToSingleView}
                className="px-6 py-2 bg-black/35 backdrop-blur-[8px] rounded-full border border-white/12 text-white/85 font-medium hover:bg-black/45 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
              >
                ← Back to Single View
              </button>
            </div>

            {/* COMPARE SEARCH BAR - Shows at top on mobile when no second brand */}
            {!brandData2 && (
              <div className="lg:hidden bg-black/65 backdrop-blur-[16px] rounded-xl border border-white/15 shadow-lg p-4 mb-4 flex-shrink-0">
                <p className="text-white/70 text-sm mb-3 text-center">
                  Enter a brand to compare
                </p>

                <div ref={compareInputRef} className="w-full relative">
                  {showCompareSuggestions && (
                    <div className="absolute bottom-full mb-2 w-full bg-black/70 backdrop-blur-[12px] rounded-xl border border-white/15 shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                      {filteredCompareSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            handleCompareSuggestionClick(suggestion)
                          }
                          className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors duration-200 border-b border-white/5 last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleCompareBrandAnalysis}>
                    <div className="relative bg-black/35 backdrop-blur-[8px] rounded-2xl border border-white/12 shadow-[0_4px_16px_rgba(0,0,0,0.25)] overflow-hidden">
                      <div className="flex items-center gap-2 p-3">
                        <Search className="w-5 h-5 text-white/85 flex-shrink-0" />

                        <input
                          type="text"
                          value={compareBrandInput}
                          onChange={(e) => setCompareBrandInput(e.target.value)}
                          onFocus={() =>
                            filteredCompareSuggestions.length > 0 &&
                            setShowCompareSuggestions(true)
                          }
                          placeholder="Enter brand name..."
                          className="flex-1 min-w-0 bg-transparent text-white/85 placeholder:text-white/40 outline-none text-sm"
                          disabled={isLoading2}
                        />

                        <button
                          type="submit"
                          disabled={!compareBrandInput.trim() || isLoading2}
                          className="px-4 py-2 bg-[#D5FF3F] hover:bg-[#E0FF6F] disabled:bg-gray-600 text-[#0C0C0C] font-semibold rounded-[40px] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5 text-sm whitespace-nowrap flex-shrink-0"
                        >
                          {isLoading2 ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="hidden xs:inline">
                                Analyzing...
                              </span>
                            </>
                          ) : (
                            <span>Analyze</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 lg:overflow-hidden">
              <div className="lg:h-full min-h-0 lg:overflow-hidden">
                <ResultsCard
                  brandData={brandData}
                  brandName={brandName}
                  isCompareMode={true}
                />
              </div>

              {brandData2 ? (
                <div className="lg:h-full min-h-0 lg:overflow-hidden">
                  <ResultsCard
                    brandData={brandData2}
                    brandName={brandName2}
                    isCompareMode={true}
                  />
                </div>
              ) : (
                <div className="hidden lg:flex bg-black/65 backdrop-blur-[16px] rounded-xl border border-white/15 shadow-lg flex-col items-center justify-center p-6 lg:h-full overflow-hidden">
                  <p className="text-white/70 text-lg mb-4">
                    Enter a brand to compare
                  </p>

                  <div className="w-full max-w-md relative">
                    {showCompareSuggestions && (
                      <div className="absolute bottom-full mb-2 w-full bg-black/70 backdrop-blur-[12px] rounded-xl border border-white/15 shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                        {filteredCompareSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              handleCompareSuggestionClick(suggestion)
                            }
                            className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors duration-200 border-b border-white/5 last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleCompareBrandAnalysis}>
                      <div className="relative bg-black/35 backdrop-blur-[8px] rounded-2xl border border-white/12 shadow-[0_4px_16px_rgba(0,0,0,0.25)] overflow-hidden">
                        <div className="flex items-center gap-3 p-4">
                          <Search className="w-5 h-5 text-white/85 flex-shrink-0" />

                          <input
                            type="text"
                            value={compareBrandInput}
                            onChange={(e) =>
                              setCompareBrandInput(e.target.value)
                            }
                            onFocus={() =>
                              filteredCompareSuggestions.length > 0 &&
                              setShowCompareSuggestions(true)
                            }
                            placeholder="Enter a brand name to compare..."
                            className="flex-1 bg-transparent text-white/85 placeholder:text-white/40 outline-none text-base"
                            disabled={isLoading2}
                          />

                          <button
                            type="submit"
                            disabled={!compareBrandInput.trim() || isLoading2}
                            className="px-5 py-2 bg-[#D5FF3F] hover:bg-[#E0FF6F] disabled:bg-gray-600 text-[#0C0C0C] font-semibold rounded-[40px] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 text-sm"
                          >
                            {isLoading2 ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing...</span>
                              </>
                            ) : (
                              <span>Analyze</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ContactButton
        onClick={() => setShowContactModal(true)}
        hidden={!!(brandData || productData)}
      />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      <Toaster />
    </div>
  );
}
