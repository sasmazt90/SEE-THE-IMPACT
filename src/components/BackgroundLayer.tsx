"use client";

import { useEffect, useRef, useState } from "react";
import { Theme, BackgroundMode } from "@/types";
import { videoPaths } from "@/lib/videoPaths";

interface BackgroundLayerProps {
  theme: Theme;
  sliderPosition: number;
  backgroundMode: BackgroundMode;
  brandScore?: number;
}

// Ensure the video is muted
const muteVideo = (video: HTMLVideoElement | null) => {
  if (!video) return;
  video.muted = true;
  video.volume = 0;
  video.setAttribute("muted", "true");
  video.setAttribute("playsinline", "true");
};

export default function BackgroundLayer({
  theme,
  sliderPosition,
  backgroundMode,
  brandScore = 50,
}: BackgroundLayerProps) {
  /** ---------------------------------------------------------
   *  🔥 OVERRIDE LOCAL VIDEO PATHS WITH SUPABASE VIDEO URLS
   *  -------------------------------------------------------- */
  let cleanVideoUrl = theme.cleanVideo;
  let pollutedVideoUrl = theme.pollutedVideo;

  const themeKey = theme.name.toLowerCase(); // "city" | "earth" | "underwater"

  if (themeKey === "city") {
    cleanVideoUrl = videoPaths.city.clean;
    pollutedVideoUrl = videoPaths.city.polluted;
  }

  if (themeKey === "earth") {
    cleanVideoUrl = videoPaths.earth.clean;
    pollutedVideoUrl = videoPaths.earth.polluted;
  }

  if (themeKey === "underwater") {
    cleanVideoUrl = videoPaths.underwater.clean;
    pollutedVideoUrl = videoPaths.underwater.polluted;
  }

  // ----------------------------------------------------------

  const brandCleanVideoRef = useRef<HTMLVideoElement>(null);
  const brandPollutedVideoRef = useRef<HTMLVideoElement>(null);
  const cleanVideoRef = useRef<HTMLVideoElement>(null);
  const pollutedVideoRef = useRef<HTMLVideoElement>(null);

  // Track video load failures to show image fallback
  const [cleanVideoFailed, setCleanVideoFailed] = useState(false);
  const [pollutedVideoFailed, setPollutedVideoFailed] = useState(false);
  const [brandCleanVideoFailed, setBrandCleanVideoFailed] = useState(false);
  const [brandPollutedVideoFailed, setBrandPollutedVideoFailed] =
    useState(false);

  // Reset failure states when theme changes
  useEffect(() => {
    setCleanVideoFailed(false);
    setPollutedVideoFailed(false);
    setBrandCleanVideoFailed(false);
    setBrandPollutedVideoFailed(false);
  }, [theme.id]);

  useEffect(() => {
    muteVideo(brandCleanVideoRef.current);
    muteVideo(brandPollutedVideoRef.current);
    muteVideo(cleanVideoRef.current);
    muteVideo(pollutedVideoRef.current);

    // Attempt to play videos programmatically (needed for some browsers)
    const playVideo = (ref: React.RefObject<HTMLVideoElement | null>) => {
      if (ref.current) {
        ref.current.play().catch(() => {
          // Autoplay blocked or video failed — image fallback will show
        });
      }
    };

    playVideo(brandCleanVideoRef);
    playVideo(brandPollutedVideoRef);
    playVideo(cleanVideoRef);
    playVideo(pollutedVideoRef);
  }, [theme, backgroundMode, brandScore]);

  /** ---------------------------------------------------------
   *  ⭐ BRAND MODE — Brand score slider split background
   *  -------------------------------------------------------- */
  if (backgroundMode === "brand") {
    const cleanWidth = brandScore;

    return (
      <>
        <div className="fixed inset-0 w-full h-full z-[1] animate-in fade-in duration-500">
          {/* Clean image fallback (always behind video) */}
          <img
            src={theme.cleanImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Clean video on LEFT (overlays image when loaded) */}
          {!brandCleanVideoFailed && (
            <video
              ref={brandCleanVideoRef}
              key={`brand-clean-${theme.id}`}
              src={cleanVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              onLoadedMetadata={(e) => muteVideo(e.currentTarget)}
              onError={() => setBrandCleanVideoFailed(true)}
            />
          )}

          {/* Polluted overlay on RIGHT */}
          <div
            className="absolute top-0 right-0 bottom-0 overflow-hidden"
            style={{ width: `${100 - cleanWidth}%` }}
          >
            {/* Polluted image fallback */}
            <img
              src={theme.pollutedImage}
              alt=""
              className="absolute top-0 right-0 h-full object-cover"
              style={{
                width: `${100 / ((100 - cleanWidth) / 100)}%`,
                minWidth: "100vw",
              }}
            />

            {/* Polluted video (overlays image when loaded) */}
            {!brandPollutedVideoFailed && (
              <video
                ref={brandPollutedVideoRef}
                key={`brand-polluted-${theme.id}`}
                src={pollutedVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 right-0 h-full object-cover"
                style={{
                  width: `${100 / ((100 - cleanWidth) / 100)}%`,
                  minWidth: "100vw",
                }}
                onLoadedMetadata={(e) => muteVideo(e.currentTarget)}
                onError={() => setBrandPollutedVideoFailed(true)}
              />
            )}
          </div>
        </div>

        <div className="fixed inset-0 z-[10] bg-gradient-to-b from-black/60 to-black/80" />
      </>
    );
  }

  /** ---------------------------------------------------------
   *  ⭐ DYNAMIC SLIDER MODE (default)
   *  -------------------------------------------------------- */
  const cleanWidth = sliderPosition;

  return (
    <>
      <div className="fixed inset-0 w-full h-full z-[1]">
        {/* Clean image fallback (always behind video) */}
        <img
          src={theme.cleanImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Clean video base layer (overlays image when loaded) */}
        {!cleanVideoFailed && (
          <video
            ref={cleanVideoRef}
            key={cleanVideoUrl}
            src={cleanVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onLoadedMetadata={(e) => muteVideo(e.currentTarget)}
            onError={() => setCleanVideoFailed(true)}
          />
        )}

        {/* Polluted overlay */}
        <div
          className="absolute top-0 right-0 bottom-0 overflow-hidden z-[15]"
          style={{ width: `${100 - cleanWidth}%` }}
        >
          {/* Polluted image fallback */}
          <img
            src={theme.pollutedImage}
            alt=""
            className="absolute top-0 right-0 h-full object-cover"
            style={{
              width: `${100 / ((100 - cleanWidth) / 100)}%`,
              minWidth: "100vw",
            }}
          />

          {/* Polluted video (overlays image when loaded) */}
          {!pollutedVideoFailed && (
            <video
              ref={pollutedVideoRef}
              key={pollutedVideoUrl}
              src={pollutedVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 right-0 h-full object-cover"
              style={{
                width: `${100 / ((100 - cleanWidth) / 100)}%`,
                minWidth: "100vw",
              }}
              onLoadedMetadata={(e) => muteVideo(e.currentTarget)}
              onError={() => setPollutedVideoFailed(true)}
            />
          )}
        </div>
      </div>

      <div className="fixed inset-0 z-[10] bg-gradient-to-b from-black/55 to-black/75" />
    </>
  );
}
