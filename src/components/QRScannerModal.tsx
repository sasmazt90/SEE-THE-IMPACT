"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, Loader2 } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

// Validate barcode format
const isValidBarcode = (code: string): boolean => {
  if (!code || code.length < 3) return false;
  
  // EAN-13 (13 digits)
  if (/^\d{13}$/.test(code)) return true;
  // EAN-8 (8 digits)
  if (/^\d{8}$/.test(code)) return true;
  // UPC-A (12 digits)
  if (/^\d{12}$/.test(code)) return true;
  // UPC-E (6-8 digits)
  if (/^\d{6,8}$/.test(code)) return true;
  // Code 128/39 (alphanumeric, at least 3 chars)
  if (/^[A-Za-z0-9\-\.\/\+\%\$\s]{3,}$/.test(code)) return true;
  // QR codes can contain URLs or text
  if (code.length >= 3) return true;
  
  return false;
};

export default function QRScannerModal({
  isOpen,
  onClose,
  onScan,
}: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // ZXing reader ref (fallback için)
  const zxingReaderRef = useRef<any>(null);
  const [shouldUseZXing, setShouldUseZXing] = useState(false);
  
  // Debounce and validation refs
  const lastScannedRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const scanCountRef = useRef<Map<string, number>>(new Map());
  const hasScannedRef = useRef<boolean>(false);

  // Reset scan tracking when modal opens
  useEffect(() => {
    if (isOpen) {
      lastScannedRef.current = "";
      lastScanTimeRef.current = 0;
      scanCountRef.current = new Map();
      hasScannedRef.current = false;
    }
  }, [isOpen]);

  // Validate and confirm scan with multiple reads
  const validateAndConfirmScan = useCallback((code: string): boolean => {
    if (hasScannedRef.current) return false;
    
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTimeRef.current;
    
    // Reset counts if more than 2 seconds since last scan
    if (timeSinceLastScan > 2000) {
      scanCountRef.current = new Map();
    }
    
    lastScanTimeRef.current = now;
    
    // Validate barcode format
    if (!isValidBarcode(code)) {
      return false;
    }
    
    // Count this scan
    const currentCount = (scanCountRef.current.get(code) || 0) + 1;
    scanCountRef.current.set(code, currentCount);
    
    // Require at least 2 consistent reads for confirmation (reduces false positives)
    if (currentCount >= 2) {
      hasScannedRef.current = true;
      return true;
    }
    
    return false;
  }, []);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Hangi yolu kullanacağımıza karar ver (iOS => ZXing, diğerleri => BarcodeDetector varsa onu)
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const iOS = /iP(hone|ad|od)/.test(ua);
    const hasBarcodeDetector = (window as any).BarcodeDetector !== undefined;

    // iOS’ta kesin ZXing’e zorla, diğerlerinde BarcodeDetector varsa onu, yoksa yine ZXing
    setShouldUseZXing(iOS || !hasBarcodeDetector);
  }, [isOpen]);

  // Kamera açma / kapama
  useEffect(() => {
    if (!isOpen) {
      // Modal kapanınca stream’i temizle
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    const startCamera = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access camera. Please check permissions.");
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // 1) BarcodeDetector yolu (destekleyen, iOS olmayan tarayıcılarda)
  useEffect(() => {
    if (!isOpen || !videoRef.current || isLoading || error) return;
    if (shouldUseZXing) return; // Bu durumda ZXing fallback çalışacak

    let animationId: number;
    let detecting = false;

    const detectBarcode = async () => {
      if (detecting || !videoRef.current) return;

      if ("BarcodeDetector" in window) {
        detecting = true;
        try {
          // @ts-ignore - TS henüz tipini bilmiyor
          const barcodeDetector = new BarcodeDetector({
            formats: [
              "qr_code",
              "ean_13",
              "ean_8",
              "upc_a",
              "upc_e",
              "code_128",
              "code_39",
            ],
          });

          const barcodes = await barcodeDetector.detect(videoRef.current);

          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code && validateAndConfirmScan(code)) {
              handleScan(code);
              return;
            }
          }
        } catch (err) {
          // Sessizce devam et, UI çökmesin
          console.warn("BarcodeDetector error:", err);
        }
        detecting = false;
      }

      animationId = requestAnimationFrame(detectBarcode);
    };

    animationId = requestAnimationFrame(detectBarcode);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading, error, onScan, onClose, shouldUseZXing]);

  // 2) ZXing fallback – özellikle iOS için
  useEffect(() => {
    if (!isOpen || !videoRef.current || isLoading || error) return;
    if (!shouldUseZXing) return;

    let cancelled = false;

    const startZXing = async () => {
      try {
        // Eğer ZXing yüklenmemişse, CDN’den script ekle
        if (!(window as any).ZXing) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector(
              'script[data-zxing="1"]',
            ) as HTMLScriptElement | null;

            if (existing) {
              if ((existing as any).dataset.loaded === "true") {
                return resolve();
              }
              existing.addEventListener("load", () => resolve());
              existing.addEventListener("error", () =>
                reject(new Error("ZXing script failed to load")),
              );
              return;
            }

            const script = document.createElement("script");
            script.src =
              "https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js";
            script.async = true;
            script.dataset.zxing = "1";

            script.onload = () => {
              (script as any).dataset.loaded = "true";
              resolve();
            };
            script.onerror = () =>
              reject(new Error("ZXing script failed to load"));

            document.body.appendChild(script);
          });
        }

        if (cancelled) return;

        const ZX = (window as any).ZXing;
        if (!ZX || !ZX.BrowserMultiFormatReader) {
          console.error("ZXing not available on window");
          return;
        }

        const reader = new ZX.BrowserMultiFormatReader();
        zxingReaderRef.current = reader;

        await reader.decodeFromVideoDevice(
          null,
          videoRef.current!,
          (result: any, err: any) => {
            if (cancelled) return;
            if (result) {
              const text = result.getText();
              if (text && validateAndConfirmScan(text)) {
                handleScan(text);
              }
            }
          },
        );
      } catch (e) {
        // ZXing tamamen patlasa bile uygulama çökmesin, sadece console’a loglansın
        console.error("ZXing fallback error:", e);
      }
    };

    startZXing();

    return () => {
      cancelled = true;
      if (zxingReaderRef.current) {
        try {
          zxingReaderRef.current.reset();
        } catch {
          // ignore
        }
        zxingReaderRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading, error, shouldUseZXing]);

  const stopScanner = () => {
    if (zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
      } catch {
        // ignore
      }
      zxingReaderRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleScan = (code: string) => {
    stopScanner();
    onScan(code);
    onClose();
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleManualEntry = () => {
    const code = prompt("Enter barcode or product name:");
    if (code) {
      handleScan(code);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md bg-black/80 backdrop-blur-[16px] rounded-xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#E4FF3A]" />
            <h2 className="text-lg font-bold text-white">Scan Product</h2>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="relative z-10 p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 hover:border-[#E4FF3A]/30 transition-all duration-300 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/70 hover:text-[#E4FF3A]" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative aspect-square bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#E4FF3A] animate-spin" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={handleManualEntry}
                className="px-4 py-2 bg-[#E4FF3A] text-black font-semibold rounded-lg hover:bg-[#D5FF3F] transition-colors"
              >
                Enter Manually
              </button>
            </div>
          )}

          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${
              isLoading || error ? "hidden" : ""
            }`}
            playsInline
            muted
          />

          <canvas ref={canvasRef} className="hidden" />

          {/* Scan overlay */}
          {!isLoading && !error && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-[#E4FF3A]/50 rounded-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#E4FF3A] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#E4FF3A] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#E4FF3A] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#E4FF3A] rounded-br-lg" />
              </div>
              {/* Scanning line animation */}
              <div
                className="absolute left-8 right-8 h-0.5 bg-[#E4FF3A]/70 animate-pulse"
                style={{ top: "50%" }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-white/60 text-sm text-center mb-3">
            Point your camera at a barcode or QR code
          </p>
          <button
            onClick={handleManualEntry}
            className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors"
          >
            Enter Product Name Manually
          </button>
        </div>
      </div>
    </div>
  );
}
