export interface MenuItem {
  id: string;
  name: string;
  priceM?: number; // Medium size price
  priceL?: number; // Large size price
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

export const HOT_DRINKS: MenuItem[] = [
  { id: "hd-americano", name: "Americano", priceM: 33, priceL: 36, description: "Smooth espresso diluted with hot water for a classic, clean taste." },
  { id: "hd-cappuccino", name: "Cappuccino", priceM: 36, priceL: 41, description: "Perfectly balanced shot of espresso with steamed milk and luxurious foam.", popular: true },
  { id: "hd-flat-white", name: "Flat White", priceM: 36, priceL: 41, description: "Stronger espresso taste with a velvety, thin layer of microfoam." },
  { id: "hd-latte", name: "Latte", priceM: 36, priceL: 41, description: "Milky and mild. Rich espresso poured with plenty of steamed milk." },
  { id: "hd-single-espresso", name: "Single Shot Espresso", priceM: 16, description: "Pure, intense shot of our premium signature espresso blend." },
  { id: "hd-double-espresso", name: "Double Shot Espresso", priceM: 21, description: "Two shots of rich espresso for double the smooth kick." },
  { id: "hd-red-cappuccino", name: "Red Cappuccino", priceM: 36, priceL: 41, description: "A naturally caffeine-free herbal option made from premium Rooibos tea." },
  { id: "hd-chai-latte", name: "Chai Latte", priceM: 38, priceL: 41, description: "A comforting blend of aromatic spices, black tea, and steamed milk." },
  { id: "hd-hot-chocolate", name: "Hot Chocolate", priceM: 41, priceL: 46, description: "Rich, creamy, classic sweet hot chocolate." },
  { id: "hd-lindt-hot-chocolate", name: "Lindt Hot Chocolate", priceM: 48, priceL: 51, description: "Decadent melted Lindt chocolate whisked with hot steamed milk.", popular: true },
  { id: "hd-lindt-cappuccino", name: "Lindt Cappuccino", priceM: 46, priceL: 51, description: "Our legendary cappuccino enhanced with rich, smooth Lindt chocolate." },
  { id: "hd-tea", name: "Tea", priceM: 23, priceL: 28, description: "Your choice of classic teas including Five Roses, Rooibos, or English Breakfast." },
  { id: "hd-mocha", name: "Mocha", priceM: 41, priceL: 46, description: "Decadent combination of bold espresso, creamy milk, and rich chocolate." },
  { id: "hd-breve", name: "Breve", priceM: 36, priceL: 41, description: "An American variation of a latte, made with steamed half-and-half milk." },
  { id: "hd-dirty-chai", name: "Dirty Chai", priceM: 46, priceL: 51, description: "Spiced Chai Latte fortified with a bold double shot of espresso." },
  { id: "hd-baby-chino", name: "Baby Chino", priceM: 11, description: "A warm, frothy milk treat for our little clients, topped with cocoa powder." },
  { id: "hd-cortado", name: "Cortado", priceM: 36, description: "Equal parts espresso and warm silky milk to reduce the acidity." },
  { id: "hd-macchiato", name: "Macchiato", priceM: 33, description: "Bold espresso marked with just a dollop of velvety milk foam." },
];

export const STELLOS_FREEZE: MenuItem[] = [
  { id: "sz-original", name: "Original Coffee Freeze", priceM: 41, priceL: 46, description: "Ice-blended signature coffee shake, frosty and refreshing." },
  { id: "sz-vanilla", name: "Vanilla Freeze", priceM: 41, priceL: 46, description: "Sweet, creamy frozen gourmet vanilla blend." },
  { id: "sz-strawberry", name: "Strawberry Freeze", priceM: 41, priceL: 46, description: "Frigid, sweet, real fruit-infused strawberry slush freeze." },
  { id: "sz-caramel", name: "Caramel Freeze", priceM: 41, priceL: 46, description: "Blended ice with hints of deep, buttery, caramelized sweetness.", popular: true },
  { id: "sz-cherry", name: "Cherry Freeze", priceM: 41, priceL: 46, description: "A unique, delightful fruity frozen cherry refreshment." },
  { id: "sz-chocolate", name: "Chocolate Freeze", priceM: 41, priceL: 46, description: "Deeply chocolatey frosted milkshake for chocolate enthusiasts." },
];

export const ICE_COFFEE: MenuItem[] = [
  { id: "ic-classic", name: "Ice Coffee", priceM: 41, priceL: 46, description: "Classic chilled espresso poured over fresh ice and cold milk." },
  { id: "ic-condensed", name: "Ice Coffee w/ Condensed Milk", priceM: 44, priceL: 49, description: "Decadent Vietnamese-style sweet ice coffee, highly rich and energizing.", popular: true },
];

export const MUFFINS: MenuItem[] = [
  { id: "mf-barista", name: "Barista's Muffin of the Day", priceM: 35, description: "Freshly baked daily selection. Ask your barista about today's flavor (Blueberry, Choc Chip, Lemon Poppy, etc.)" }
];

export const CROISSANTS: MenuItem[] = [
  { id: "cr-plain", name: "Plain Croissant", priceM: 25, description: "Flaky, buttery classic French-style pastry baked fresh every morning." },
  { id: "cr-chocolate", name: "Chocolate Croissant", priceM: 39, description: "Decadent croissant rolled around smooth chocolate baton inserts." },
  { id: "cr-ham-cheese", name: "Ham & Cheese Croissant", priceM: 50, description: "Savoury breakfast favourite stuffed with sliced premium ham and melted cheddar cheese." },
  { id: "cr-crookie", name: "Classic Crookie", priceM: 60, description: "The ultimate trend: standard flaky croissant stuffed and topped with chocolate chip cookie dough." },
  { id: "cr-biscoff-crookie", name: "Biscoff Crookie", priceM: 75, description: "Delicious crookie variant loaded with creamy Lotus Biscoff spread and cookie crumbs.", popular: true },
  { id: "cr-nutella-crookie", name: "Nutella Crookie", priceM: 80, description: "Dripping with rich Nutella hazelnut spread, baked inside a warm chocolate chip cookie croissant." },
  { id: "cr-almond", name: "Almond Croissant", priceM: 38, description: "Sweet croissant topped with almond frangipane, toasted flaked almonds, and icing sugar." },
];

export const OTHER_TREATS: MenuItem[] = [
  { id: "ot-brownie", name: "Gourmet Chocolate Brownie", priceM: 35, description: "Ultra-fudgy Belgian chocolate square with a perfect crinkle top." },
  { id: "ot-nata", name: "Pastéis de Nata", priceM: 35, description: "Traditional Portuguese custard tart with caramelized puff pastry shell.", popular: true },
];

export const SPECIALS: SpecialCombo[] = [
  { id: "sp-ham-cheese", name: "Ham & Cheese Toastie Combo", price: 75, description: "Toasted classic ham and cheddar cheese sandwich paired with your choice of beverage.", includes: "Medium Cappuccino OR Medium Ice Coffee" },
  { id: "sp-chicken-mayo", name: "Chicken Mayo Toastie Combo", price: 65, description: "Creamy pulling shredded chicken breast mixed with tangy mayonnaise, toasted to golden.", includes: "Medium Cappuccino OR any Hot Coffee" },
  { id: "sp-croissant", name: "Croissant Combo", price: 45, description: "Your choice of plain or sweet chocolate croissant, served hot and crisp.", includes: "Medium Cappuccino OR any Hot Coffee" },
  { id: "sp-muffin", name: "Muffin Combo", price: 45, description: "A premium muffin of your choice plus an iced caffeine fix.", includes: "Medium Cappuccino OR Medium Ice Coffee" },
  { id: "sp-red-velvet", name: "Red Velvet Cake Slice", price: 45, description: "A moist, gorgeous slice of red velvet cake layered with velvety cream cheese frosting.", includes: "Solo premium treat (no drink included)" },
];

export const ADDONS = {
  espressoShot: { name: "Extra Espresso Shot", price: 9 },
  cream: { name: "Whipped Cream", price: 9 },
  syrups: { name: "Flavoured Syrups (Vanilla / Hazelnut / Caramel)", priceM: 10, priceL: 11 },
  milkAlternatives: [
    { name: "Oat Milk", priceM: 9, priceL: 11 },
    { name: "Soy Milk", priceM: 9, priceL: 11 },
    { name: "Almond Milk", priceM: 11, priceL: 13 },
    { name: "Macadamia Milk", priceM: 13, priceL: 15 },
  ],
};
