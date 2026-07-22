export interface Photo {
  id: string;
  title: string;
  category: 'automotive' | 'street' | 'monochrome' | 'landscape';
  tagline: string;
  date: string;
  location: string;
  imageUrl: string;
  specs: {
    camera: string;
    lens: string;
    shutter: string;
    aperture: string;
    iso: string;
  };
  story: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  photoChoice?: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface GearItem {
  name: string;
  type: string;
  description: string;
}

export interface InstagramMetadata {
  handle: string;
  isMocked: boolean;
  followers: string;
  following: string;
  posts: number;
  hasActiveStory: boolean;
  lastPostTime: string;
  fetchedAt: string;
}

export interface Album {
  id: string;
  title: string;
  folderCode: string;
  coverImageUrl: string;
  date: string;
  location: string;
  photos: Photo[];
  driveUrl?: string;
}


