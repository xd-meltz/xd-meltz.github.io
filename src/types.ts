/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PricingPlan {
  id: string;
  category: 'weekends' | 'weekdays';
  title: string;
  subtitle?: string;
  priceText: string;
  features: string[];
  notes?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  altText: string;
}

export interface BookingFormState {
  name: string;
  bookingType: 'weekday' | 'weekend';
  packageName: '30min' | '60min' | '4hour' | 'weekend-rental' | 'weekend-own-bike';
  bikesCount: 5 | 10;
  riderType?: 'PitBike' | 'QuadBike';
  date: string;
  time: string;
}
