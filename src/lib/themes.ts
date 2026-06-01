import { Theme } from "@/types";

export const EarthTheme: Theme = {
  id: 1,
  name: "Earth",
  cleanVideo:
    "https://cdn.pixabay.com/video/2021/08/18/85790-589840517_large.mp4",
  pollutedVideo:
    "https://cdn.pixabay.com/video/2020/07/30/45790-445004958_large.mp4",
  cleanImage:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
  pollutedImage: "/images/Earth-Polluted.png",
};

export const UnderwaterTheme: Theme = {
  id: 2,
  name: "Underwater",
  cleanVideo:
    "https://cdn.pixabay.com/video/2020/07/10/43639-438988690_large.mp4",
  pollutedVideo:
    "https://cdn.pixabay.com/video/2021/11/05/95361-642865851_large.mp4",
  cleanImage: "/images/Underwater-Clean.png",
  pollutedImage: "/images/Underwater-Polluted.png",
};

export const CityTheme: Theme = {
  id: 3,
  name: "City",
  cleanVideo:
    "https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4",
  pollutedVideo:
    "https://cdn.pixabay.com/video/2019/06/21/24584-343960332_large.mp4",
  cleanImage: "/images/City-Clean.png",
  pollutedImage:
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1920&q=80",
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

// Alias for getRandomThemeIndex
export const getRandomTheme = (): Theme => {
  const index = getRandomThemeIndex();
  return getThemeByIndex(index);
};
