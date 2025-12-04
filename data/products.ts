
import { Product } from '../types';

export const PRODUCTS: Product[] = [
  // 1. Starter Plan (Restricted: One Active Only)
  { 
    id: '1', 
    name: "Make Up Remover", 
    price: 299, 
    dailyIncome: 45, 
    totalRevenue: 675, 
    duration: 15, 
    image: "https://i.supaimg.com/504b825f-bda1-4768-819e-849d0d4739fc.jpg"
  },

  // 2. Growth Plan (Restricted: One Active Only)
  { 
    id: '2', 
    name: "Hair Growth Oil", 
    price: 499, 
    dailyIncome: 90, 
    totalRevenue: 1350, 
    duration: 15, 
    image: "https://i.supaimg.com/387069a2-ebff-4278-92fb-f20afb413602.jpg"
  },

  // 3. Standard Tier
  { 
    id: '3', 
    name: "Peeling Solution", 
    price: 799, 
    dailyIncome: 160, 
    totalRevenue: 2400, 
    duration: 15, 
    image: "https://i.supaimg.com/e81bddce-815a-4c24-bd33-0666c9d4d9c6.jpg"
  },

  // 4. Premium Boost
  { 
    id: '4', 
    name: "TexoVera 10000 mAh Wireless Powerbank", 
    price: 999, 
    dailyIncome: 220, 
    totalRevenue: 3300, 
    duration: 15, 
    image: "https://i.supaimg.com/9195bf1a-2930-4334-9f0a-56e02fc0713e.jpg"
  },

  // 5. Silver Invest
  { 
    id: '5', 
    name: "Room Heater", 
    price: 2000, 
    dailyIncome: 480, 
    totalRevenue: 9600, 
    duration: 20, 
    image: "https://i.supaimg.com/decb6d63-0784-46ab-a9c3-00deff115730.webp"
  },

  // 6. Gold Partner
  { 
    id: '6', 
    name: "Black 24 Inch HD LED TV", 
    price: 3500, 
    dailyIncome: 900, 
    totalRevenue: 22500, 
    duration: 25, 
    image: "https://i.supaimg.com/14fac2f5-f6e6-49a0-af16-2326517d72c3.jpg"
  },

  // 7. Platinum Pro
  { 
    id: '7', 
    name: "Noise Scout Kids Smartwatch", 
    price: 5000, 
    dailyIncome: 1400, 
    totalRevenue: 35000, 
    duration: 25, 
    image: "https://i.supaimg.com/2f1fea32-9b64-4f77-9e58-2f496b4806cf.png"
  },

  // 8. Diamond Club
  { 
    id: '8', 
    name: "Tecno Pop 9 5G", 
    price: 10000, 
    dailyIncome: 3000, 
    totalRevenue: 90000, 
    duration: 30, 
    image: "https://i.supaimg.com/44221f15-fe27-46ad-8ff2-9cd22375790c.jpg"
  }
];
