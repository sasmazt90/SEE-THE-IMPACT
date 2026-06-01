import { Theme } from "@/types";

export const EarthTheme: Theme = {
  id: 1,
  name: "Earth",
  cleanVideo: "/videos/Earth-Clean.mp4",
  pollutedVideo: "/videos/Earth-Polluted.mp4",
  cleanImage: "/images/Earth-Clean.png",
  pollutedImage: "/images/Earth-Polluted.png",
};

export const UnderwaterTheme: Theme = {
  id: 2,
  name: "Underwater",
  cleanVideo: "/videos/Underwater-Clean.mp4",
  pollutedVideo: "/videos/Underwater-Polluted.mp4",
  cleanImage: "/images/Underwater-Clean.png",
  pollutedImage: "/images/Underwater-Polluted.png",
};

export const CityTheme: Theme = {
  id: 3,
  name: "City",
  cleanVideo: "/videos/City-Clean.mp4",
  pollutedVideo: "/videos/City-Polluted.mp4",
  cleanImage: "/images/City-Clean.png",
  pollutedImage: "/images/City-Polluted.png",
};

export const themes: Theme[] = [EarthTheme, UnderwaterTheme, CityTheme];

export const getThemeByIndex = (index: number): Theme => {
  switch (index) {
    case 1:
      return EarthTheme;
    case 2:
      return UnderwaterTheme;
    case 3:
      return CityTheme;
    default:
      return EarthTheme;
  }
};

export const getRandomThemeIndex = (): number => {
  return Math.floor(Math.random() * 3) + 1;
};

export const getNextThemeIndex = (index: number): number => {
  if (index === CityTheme.id) return EarthTheme.id;
  if (index === EarthTheme.id) return UnderwaterTheme.id;
  return CityTheme.id;
};

// Alias for getRandomThemeIndex
export const getRandomTheme = (): Theme => {
  const index = getRandomThemeIndex();
  return getThemeByIndex(index);
};
