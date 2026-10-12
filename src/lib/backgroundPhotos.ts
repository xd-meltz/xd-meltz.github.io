// All 19 photos from the Google Drive folder:
// https://drive.google.com/drive/folders/1HoBkF-sewlJHj3VNwhlSqu2UlZjnPKlB

export interface DrivePhoto {
  id: string;
  title: string;
  url: string;
}

export const ALL_DRIVE_PHOTOS: DrivePhoto[] = [
  { id: "1DEE3VpvCCqIHlzJ7lKUVsAe1qKPFBHmT", title: "Track Winelands Vista", url: "https://lh3.googleusercontent.com/d/1DEE3VpvCCqIHlzJ7lKUVsAe1qKPFBHmT" },
  { id: "1me5q75KLzkO7XuvMCcBVeww1mderUZum", title: "Compound Arena View", url: "https://lh3.googleusercontent.com/d/1me5q75KLzkO7XuvMCcBVeww1mderUZum" },
  { id: "10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj", title: "Rental Fleet Lineup", url: "https://lh3.googleusercontent.com/d/10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj" },
  { id: "1qt1GEm1HvEUjEloCNnqsj6d3OcdNwy6V", title: "Bottelary Dirt Track", url: "https://lh3.googleusercontent.com/d/1qt1GEm1HvEUjEloCNnqsj6d3OcdNwy6V" },
  { id: "1-tqJvw9LAwmeMcwSNG6oUff_yCN3-I9a", title: "Track Dirt Obstacles", url: "https://lh3.googleusercontent.com/d/1-tqJvw9LAwmeMcwSNG6oUff_yCN3-I9a" },
  { id: "1vgj5Jv6519sz5ioIppFYFbOTXNqUWPJU", title: "Speed Slide Corner", url: "https://lh3.googleusercontent.com/d/1vgj5Jv6519sz5ioIppFYFbOTXNqUWPJU" },
  { id: "1R9OYQT8Oe161DYKUpb1xMiQ4bAjRUbWs", title: "Mud Riding Turn", url: "https://lh3.googleusercontent.com/d/1R9OYQT8Oe161DYKUpb1xMiQ4bAjRUbWs" },
  { id: "17oCnPzDF_N1YU2ZSbDoh-vTdvHcNi69Z", title: "Double Jump Action", url: "https://lh3.googleusercontent.com/d/17oCnPzDF_N1YU2ZSbDoh-vTdvHcNi69Z" },
  { id: "1opRk9DVra42yLuZUDqxuq9ijEWQURugE", title: "Track Overview", url: "https://lh3.googleusercontent.com/d/1opRk9DVra42yLuZUDqxuq9ijEWQURugE" },
  { id: "1jqdT4pedi3b5aaw2biEmFfxtVm5XpxSj", title: "Pit Bike Prep", url: "https://lh3.googleusercontent.com/d/1jqdT4pedi3b5aaw2biEmFfxtVm5XpxSj" },
  { id: "108-4wXp6z2yCSjZnLj-e2vuE-rr-WFeB", title: "Riders Group", url: "https://lh3.googleusercontent.com/d/108-4wXp6z2yCSjZnLj-e2vuE-rr-WFeB" },
  { id: "1ndv4CQUciUdf0E9QIDsASSNXYzoOMUY-", title: "Bottelary Hills", url: "https://lh3.googleusercontent.com/d/1ndv4CQUciUdf0E9QIDsASSNXYzoOMUY-" },
  { id: "1b5QTW9_Y3L3UyqpcldbhKDvg4A2CWcXf", title: "Stellenbosch Sunset", url: "https://lh3.googleusercontent.com/d/1b5QTW9_Y3L3UyqpcldbhKDvg4A2CWcXf" },
  { id: "1qx7fYGB2UaBKrlTKYHcAHsLCJrUBG5fk", title: "Stationary Fleet", url: "https://lh3.googleusercontent.com/d/1qx7fYGB2UaBKrlTKYHcAHsLCJrUBG5fk" },
  { id: "10thOzfiWVG8LI1O46EMbzud-zp24sXVr", title: "Track Berm Action", url: "https://lh3.googleusercontent.com/d/10thOzfiWVG8LI1O46EMbzud-zp24sXVr" },
  { id: "1nmxx3gEIrqZsjXMzUd55kKo0ZqrZCfps", title: "Compound Grounds", url: "https://lh3.googleusercontent.com/d/1nmxx3gEIrqZsjXMzUd55kKo0ZqrZCfps" },
  { id: "1GnjszyPZWAt6X6M1-2WABaF3omPt2JaM", title: "Riding Straight", url: "https://lh3.googleusercontent.com/d/1GnjszyPZWAt6X6M1-2WABaF3omPt2JaM" },
  { id: "1VY8iCidl6Ij9QgxUas2F15IsvlJaV6T_", title: "Action Corner", url: "https://lh3.googleusercontent.com/d/1VY8iCidl6Ij9QgxUas2F15IsvlJaV6T_" },
  { id: "1Lth22FNwL9_TppOXyIXtVHKMQwQgJE3Z", title: "Winelands Track Arena", url: "https://lh3.googleusercontent.com/d/1Lth22FNwL9_TppOXyIXtVHKMQwQgJE3Z" }
];

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// The permanent main landing page showcase image (Rental Fleet Lineup)
export const MAIN_LANDING_PHOTO: DrivePhoto = {
  id: "10_n-pJ86ublpNtRgZLvBqIemWYDWx-mj",
  title: "Rental Fleet Lineup",
  url: "/main-hero.jpg"
};

// Shuffled uniquely once per page refresh/session across background photos
const BACKGROUND_POOL = ALL_DRIVE_PHOTOS.filter(p => p.id !== MAIN_LANDING_PHOTO.id);
export const SHUFFLED_PHOTOS: DrivePhoto[] = shuffleArray(BACKGROUND_POOL);

// Helper to get a photo at an index with safe wrapping
export function getShuffledPhoto(index: number): DrivePhoto {
  return SHUFFLED_PHOTOS[index % SHUFFLED_PHOTOS.length];
}
