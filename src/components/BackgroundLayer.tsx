"use client";

import { useEffect, useRef, useState } from "react";
import { Theme, BackgroundMode } from "@/types";
import { videoPaths } from "@/lib/videoPaths";

interface BackgroundLayerProps {
  theme: Theme;
  sliderPosition: number;
  backgroundMode: BackgroundMode;
  brandScore?: number;
  onDynamicVideoEnded?: () => void;
}

const muteVideo = (video: HTMLVideoElement | null) => {
  if (!video) return;
  video.muted = true;
  video.volume = 0;
  video.setAttribute("muted", "true");
  video.setAttribute("playsinline", "true");
};

const getVideoPair = (theme: Theme) => {
  const themeKey = theme.name.toLowerCase();

  if (themeKey === "city") return videoPaths.city;
  if (themeKey === "earth") return videoPaths.earth;
  if (themeKey === "underwater") return videoPaths.underwater;

  return {
    clean: theme.cleanVideo,
    polluted: theme.pollutedVideo,
  };
};

export default function BackgroundLayer({
  theme,
  sliderPosition,
  backgroundMode,
  brandScore = 50,
  onDynamicVideoEnded,
}: BackgroundLayerProps) {
  const cleanVideoRef = useRef<HTMLVideoElement>(null);
  const pollutedVideoRef = useRef<HTMLVideoElement>(null);

  const [cleanVideoFailed, setCleanVideoFailed] = useState(false);
  const [pollutedVideoFailed, setPollutedVideoFailed] = useState(false);

  const videoPair = getVideoPair(theme);

  useEffect(() => {
    setCleanVideoFailed(false);
    setPollutedVideoFailed(false);
  }, [theme.id]);

  useEffect(() => {
    muteVideo(cleanVideoRef.current);
    muteVideo(pollutedVideoRef.current);

    cleanVideoRef.current?.play().catch(() => {});
    pollutedVideoRef.current?.play().catch(() => {});
  }, [theme.id, backgroundMode, brandScore]);

  if (backgroundMode === "brand") {
    const cleanWidth = Math.max(0, Math.min(100, brandScore));

    return (
      <>
        <div className="fixed inset-0 w-full h-full z-[1] animate-in fade-in duration-500">
          <img
            src={theme.cleanImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div
            className="absolute top-0 right-0 bottom-0 overflow-hidden"
            style={{ width: `${100 - cleanWidth}%` }}
          >
            <img
              src={theme.pollutedImage}
              alt=""
              className="absolute top-0 right-0 h-full object-cover"
              style={{
                width:
                  cleanWidth >= 100
                    ? "100vw"
                    : `${100 / ((100 - cleanWidth) / 100)}%`,
                minWidth: "100vw",
              }}
            />
          </div>
        </div>

        <div className="fixed inset-0 z-[10] bg-gradient-to-b from-black/60 to-black/80" />
      </>
    );
  }

  const cleanWidth = Math.max(0, Math.min(100, sliderPosition));

  return (
    <>
      <div className="fixed inset-0 w-full h-full z-[1]">
        <img
          src={theme.cleanImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {!cleanVideoFailed && (
          <video
            ref={cleanVideoRef}
            key={videoPair.clean}
            src={videoPair.clean}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onLoadedMetadata={(e) => muteVideo(e.currentTarget)}
            onEnded={onDynamicVideoEnded}
            onError={() => setCleanVideoFailed(true)}
          />
        )}

        <div
          className="absolute top-0 right-0 bottom-0 overflow-hidden z-[15]"
          style={{ width: `${100 - cleanWidth}%` }}
        >
          <img
            src={theme.pollutedImage}
            alt=""
            className="absolute top-0 right-0 h-full object-cover"
            style={{
              width:
                cleanWidth >= 100
                  ? "100vw"
                  : `${100 / ((100 - cleanWidth) / 100)}%`,
              minWidth: "100vw",
            }}
          />

          {!pollutedVideoFailed && (
            <video
              ref={pollutedVideoRef}
              key={videoPair.polluted}
              src={videoPair.polluted}
              autoPlay
              muted
              playsInline
              className="absolute top-0 right-0 h-full object-cover"
              style={{
                width:
                  cleanWidth >= 100
                    ? "100vw"
                    : `${100 / ((100 - cleanWidth) / 100)}%`,
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
