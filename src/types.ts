export interface MenuItem {
  id: string;
  name: string;
  priceM?: number;
  priceL?: number;
  description?: string;
  popular?: boolean;
}

export interface AddonItem {
  name: string;
  priceM: number;
  priceL?: number;
}

export interface SpecialCombo {
  id: string;
  name: string;
  price: number;
  description: string;
  includes: string;
}

export interface TrayItem {
  uniqueId: string;
  itemId: string;
  name: string;
  size: 'M' | 'L' | 'Single' | 'Double' | 'Standard';
  basePrice: number;
  quantity: number;
  selectedMilk?: string;
  selectedMilkPrice?: number;
  extraEspressoShot?: boolean;
  extraEspressoPrice?: number;
  whippedCream?: boolean;
  whippedCreamPrice?: number;
  selectedSyrup?: 'None' | 'Vanilla' | 'Hazelnut' | 'Caramel';
  selectedSyrupPrice?: number;
  finalItemPrice: number; // Price of individual item with upgrades
  finalTotalItemPrice: number; // calculated as finalItemPrice * quantity
  itemNotes?: string;
}

export interface FeedbackFormInput {
  name: string;
  email: string;
  rating: number;
  message: string;
}
