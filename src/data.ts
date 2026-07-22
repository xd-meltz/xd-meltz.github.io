import { Photo, GearItem, Album } from './types';
import greenCarImg from './assets/images/green_car_misty_1782210470106.jpg';
import cockpitImg from './assets/images/driver_cockpit_view_1782210484649.jpg';
import igorImg from './assets/images/igor_photographer_1782210450713.jpg';

export const samplePhotos: Photo[] = [
  {
    id: 'porsche_gt3_1',
    title: 'PORSCHE 911 GT3 RS',
    category: 'automotive',
    tagline: 'HIGH SPEED APEX',
    date: 'OCTOBER 2025',
    location: 'PHILLIP ISLAND CIRCUIT',
    imageUrl: greenCarImg,
    specs: { camera: 'Sony Alpha 7R V', lens: '70-200mm f/2.8 GM', shutter: '1/2000s', aperture: 'f/2.8', iso: '100' },
    story: 'Captured mid-corner at 180km/h through the misty morning track fog.'
  },
  {
    id: 'cockpit_night_1',
    title: 'TOKYO COCKPIT PERSPECTIVE',
    category: 'automotive',
    tagline: 'LIFE THROUGH OPTICS',
    date: 'DECEMBER 2025',
    location: 'SHIBUYA EXPRESSWAY',
    imageUrl: cockpitImg,
    specs: { camera: 'Leica M11', lens: 'Summicron-M 35mm f/2', shutter: '1/60s', aperture: 'f/2.0', iso: '800' },
    story: 'First person perspective steering through the neon lit tollways of midnight Tokyo.'
  },
  {
    id: 'hero_igor_1',
    title: 'LEAD DIRECTOR PORTRAIT',
    category: 'automotive',
    tagline: 'CREATIVE DIRECTION',
    date: 'JANUARY 2026',
    location: 'MELBOURNE STUDIO',
    imageUrl: igorImg,
    specs: { camera: 'Hasselblad 907X', lens: 'XCD 80mm f/1.9', shutter: '1/250s', aperture: 'f/1.9', iso: '100' },
    story: 'Behind the scenes at Rixvisuals headquarters.'
  }
];

export const photosData: Photo[] = samplePhotos;

export const albumsData: Album[] = [
  {
    id: 'album_porsche',
    title: 'PORSCHE CIRCUIT ARCHIVES',
    folderCode: 'DIR_PORSCHE_CIRCUIT',
    coverImageUrl: greenCarImg,
    date: 'OCT 2025',
    location: 'PHILLIP ISLAND',
    photos: [samplePhotos[0]]
  },
  {
    id: 'album_tokyo',
    title: 'MIDNIGHT EXPRESSWAY',
    folderCode: 'DIR_TOKYO_NIGHTS',
    coverImageUrl: cockpitImg,
    date: 'DEC 2025',
    location: 'TOKYO, JAPAN',
    photos: [samplePhotos[1]]
  },
  {
    id: 'album_studio',
    title: 'BESPOKE STUDIO SESSIONS',
    folderCode: 'DIR_STUDIO_WORKS',
    coverImageUrl: igorImg,
    date: 'JAN 2026',
    location: 'MELBOURNE, AUS',
    photos: [samplePhotos[2]]
  }
];

export const gearBag: GearItem[] = [
  { name: 'Leica M11 Rangefinder', type: 'Camera Body', description: '61MP full-frame color sensor. Simple rangefinder focusing for slow, deliberate, masterpiece framing.' },
  { name: 'Leica M11 Monochrom', type: 'Camera Body', description: 'Dedicated monochrome sensor captures raw lightness values, organic detail, and unparalleled high-ISO performance.' },
  { name: 'Sony Alpha 7R V', type: 'Camera Body', description: 'Superb 61MP workhorse with rapid deep-learning AI tracking. Used for dynamic, fast-speed car-to-car motion shots.' },
  { name: 'Hasselblad 907X 50C', type: 'Medium Format', description: 'Retro medium-format aesthetic. Offers extraordinary latitude, rich natural colors, and iconic square compositions.' },
  { name: 'Noctilux-M 50mm f/0.95 ASPH', type: 'Leica Lens', description: 'The absolute king of depth of field. Soft organic falloff with razor-sharp center details.' },
  { name: 'Apo-Summicron-M 50mm f/2 ASPH', type: 'Leica Lens', description: 'The sharpest standard lens ever made. Clinical precision, superb micro-contrast, zero chromatic aberration.' },
  { name: 'Sony FE 24-70mm f/2.8 GM II', type: 'Sony Lens', description: 'Extremely sharp zoom lens, essential for composition adjustability from support car tracking boots.' },
  { name: 'Sony FE 85mm f/1.4 GM', type: 'Sony Lens', description: 'Dreamy portrait and compression lens. Flattens race cars beautifully into dramatic landscapes.' }
];

export const aboutContent = {
  heroHeading: "Hi, I'm Igor - a photographer and content creator with a huge passion for cars.",
  storyTitle: "Who Is RixVisuals?",
  paragraphs: [
    "Igor, aka RixVisuals is an automotive photographer and content creator from Stellenbosch, South Africa.",
    "But this wasn't always the case.",
    "Igor was stuck at the age of 29 in a career that he hated. And that's when he discovered photography.",
    "Over the following two years, Igor documented his journey as a photographer everyday, doing his very best to share his knowledge and provide value to everyone around him.",
    "And after amassing a combined audience of over 800,000 people and building a six-figure photography business, he was able to quit his job in 2023 and live his dream."
  ],
  avatarUrl: igorImg,
  portfolioOwnerPhotoLeft: greenCarImg,
  portfolioOwnerPhotoRight: cockpitImg
};
