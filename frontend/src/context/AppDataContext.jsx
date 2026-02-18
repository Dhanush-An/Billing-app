import React, { createContext, useContext, useCallback } from 'react';
import { useStorage } from '../hooks/useStorage';

const defaultProducts = [
  // Grocery - Dal & Pulses
  // Grocery - Dal & Pulses
  { id: 1, name: 'Toor Dal (1kg)', price: 140, stock: 100, category: 'Grocery', sku: 'GRO001', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 2, name: 'Moong Dal (1kg)', price: 120, stock: 80, category: 'Grocery', sku: 'GRO002', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 3, name: 'Masoor Dal (1kg)', price: 110, stock: 90, category: 'Grocery', sku: 'GRO003', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 4, name: 'Chana Dal (1kg)', price: 90, stock: 100, category: 'Grocery', sku: 'GRO004', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 5, name: 'Urad Dal (1kg)', price: 130, stock: 70, category: 'Grocery', sku: 'GRO005', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 6, name: 'Rajma (Red) (500g)', price: 80, stock: 60, category: 'Grocery', sku: 'GRO006', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 7, name: 'Kabuli Chana (500g)', price: 75, stock: 60, category: 'Grocery', sku: 'GRO007', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 8, name: 'Green Moong (500g)', price: 85, stock: 70, category: 'Grocery', sku: 'GRO008', unit: 'Packet', discount: 0, gstRate: 0 },

  // Grocery - Flours (Atta)
  { id: 9, name: 'Wheat Flour (Atta) (5kg)', price: 220, stock: 150, category: 'Grocery', sku: 'GRO009', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 10, name: 'Wheat Flour (Atta) (10kg)', price: 420, stock: 100, category: 'Grocery', sku: 'GRO010', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 11, name: 'Maida (1kg)', price: 45, stock: 80, category: 'Grocery', sku: 'GRO011', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 12, name: 'Besan (1kg)', price: 80, stock: 90, category: 'Grocery', sku: 'GRO012', unit: 'Kg', discount: 0, gstRate: 5 },
  { id: 13, name: 'Sooji / Rava (1kg)', price: 50, stock: 100, category: 'Grocery', sku: 'GRO013', unit: 'Kg', discount: 0, gstRate: 5 },
  { id: 14, name: 'Rice Flour (500g)', price: 40, stock: 60, category: 'Grocery', sku: 'GRO014', unit: 'Packet', discount: 0, gstRate: 5 },

  // Grocery - Rice & Rice Products
  { id: 15, name: 'Basmati Rice (Premium) (1kg)', price: 180, stock: 120, category: 'Grocery', sku: 'GRO015', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 16, name: 'Basmati Rice (Regular) (1kg)', price: 120, stock: 150, category: 'Grocery', sku: 'GRO016', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 17, name: 'Sona Masoori Rice (5kg)', price: 350, stock: 100, category: 'Grocery', sku: 'GRO017', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 18, name: 'Idli Rice (1kg)', price: 60, stock: 80, category: 'Grocery', sku: 'GRO018', unit: 'Kg', discount: 0, gstRate: 0 },
  { id: 19, name: 'Poha (Thick) (500g)', price: 40, stock: 90, category: 'Grocery', sku: 'GRO019', unit: 'Packet', discount: 0, gstRate: 5 },

  // Grocery - Edible Oils & Ghee
  { id: 20, name: 'Sunflower Oil (1L)', price: 150, stock: 200, category: 'Grocery', sku: 'GRO020', unit: 'L', discount: 0, gstRate: 5 },
  { id: 21, name: 'Mustard Oil (1L)', price: 170, stock: 150, category: 'Grocery', sku: 'GRO021', unit: 'L', discount: 0, gstRate: 5 },
  { id: 22, name: 'Groundnut Oil (1L)', price: 190, stock: 80, category: 'Grocery', sku: 'GRO022', unit: 'L', discount: 0, gstRate: 5 },
  { id: 23, name: 'Olive Oil (500ml)', price: 450, stock: 40, category: 'Grocery', sku: 'GRO023', unit: 'Bottle', discount: 0, gstRate: 5 },
  { id: 24, name: 'Cow Ghee (500ml)', price: 380, stock: 100, category: 'Grocery', sku: 'GRO024', unit: 'Bottle', discount: 0, gstRate: 5 },

  // Grocery - Spices (Powder)
  { id: 25, name: 'Turmeric Powder (200g)', price: 60, stock: 150, category: 'Grocery', sku: 'GRO025', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 26, name: 'Red Chilli Powder (200g)', price: 80, stock: 150, category: 'Grocery', sku: 'GRO026', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 27, name: 'Coriander Powder (200g)', price: 50, stock: 120, category: 'Grocery', sku: 'GRO027', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 28, name: 'Cumin (Jeera) Powder (100g)', price: 70, stock: 100, category: 'Grocery', sku: 'GRO028', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 29, name: 'Garam Masala (100g)', price: 90, stock: 100, category: 'Grocery', sku: 'GRO029', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 30, name: 'Chicken Masala (100g)', price: 85, stock: 80, category: 'Grocery', sku: 'GRO030', unit: 'Packet', discount: 0, gstRate: 5 },

  // Grocery - Whole Spices
  { id: 31, name: 'Mustard Seeds (100g)', price: 40, stock: 100, category: 'Grocery', sku: 'GRO031', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 32, name: 'Cumin Seeds (Jeera) (100g)', price: 60, stock: 100, category: 'Grocery', sku: 'GRO032', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 33, name: 'Methi Seeds (100g)', price: 30, stock: 80, category: 'Grocery', sku: 'GRO033', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 34, name: 'Green Cardamom (50g)', price: 150, stock: 50, category: 'Grocery', sku: 'GRO034', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 35, name: 'Cloves (50g)', price: 80, stock: 60, category: 'Grocery', sku: 'GRO035', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 36, name: 'Black Pepper (50g)', price: 70, stock: 70, category: 'Grocery', sku: 'GRO036', unit: 'Packet', discount: 0, gstRate: 5 },

  // Grocery - Salt, Sugar & Jaggery
  { id: 37, name: 'Iodized Salt (1kg)', price: 25, stock: 250, category: 'Grocery', sku: 'GRO037', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 38, name: 'Rock Salt (Pink) (1kg)', price: 80, stock: 100, category: 'Grocery', sku: 'GRO038', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 39, name: 'Sugar (1kg)', price: 45, stock: 300, category: 'Grocery', sku: 'GRO039', unit: 'Kg', discount: 0, gstRate: 5 },
  { id: 40, name: 'Jaggery Block (1kg)', price: 60, stock: 120, category: 'Grocery', sku: 'GRO040', unit: 'Kg', discount: 0, gstRate: 5 },

  // Grocery - Dry Fruits & Nuts
  { id: 41, name: 'Almonds (250g)', price: 250, stock: 80, category: 'Grocery', sku: 'GRO041', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 42, name: 'Cashews (250g)', price: 300, stock: 80, category: 'Grocery', sku: 'GRO042', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 43, name: 'Raisins (250g)', price: 150, stock: 100, category: 'Grocery', sku: 'GRO043', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 44, name: 'Dates (500g)', price: 120, stock: 100, category: 'Grocery', sku: 'GRO044', unit: 'Packet', discount: 0, gstRate: 5 },

  // Grocery - Others
  { id: 45, name: 'Tamarind (250g)', price: 50, stock: 100, category: 'Grocery', sku: 'GRO045', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 46, name: 'Soya Chunks (200g)', price: 45, stock: 150, category: 'Grocery', sku: 'GRO046', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 47, name: 'Macaroni (500g)', price: 60, stock: 80, category: 'Grocery', sku: 'GRO047', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 48, name: 'Maggi Noodles (Pack of 4)', price: 56, stock: 200, category: 'Grocery', sku: 'GRO048', unit: 'Packet', discount: 0, gstRate: 18 },

  // Dairy
  { id: 49, name: 'Toned Milk (500ml)', price: 30, stock: 100, category: 'Dairy', sku: 'DAI001', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 50, name: 'Curd (500g)', price: 40, stock: 50, category: 'Dairy', sku: 'DAI002', unit: 'Packet', discount: 0, gstRate: 0 },
  { id: 51, name: 'Butter (100g)', price: 60, stock: 60, category: 'Dairy', sku: 'DAI003', unit: 'Piece', discount: 0, gstRate: 12 },
  { id: 52, name: 'Paneer (200g)', price: 90, stock: 40, category: 'Dairy', sku: 'DAI004', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 53, name: 'Cheese Slices (200g)', price: 140, stock: 30, category: 'Dairy', sku: 'DAI005', unit: 'Packet', discount: 0, gstRate: 12 },

  // Personal Care
  { id: 54, name: 'Bathing Soap (100g)', price: 45, stock: 120, category: 'Personal Care', sku: 'PER001', unit: 'Piece', discount: 0, gstRate: 18 },
  { id: 55, name: 'Shampoo (180ml)', price: 180, stock: 60, category: 'Personal Care', sku: 'PER002', unit: 'Bottle', discount: 0, gstRate: 18 },
  { id: 56, name: 'Toothpaste (150g)', price: 95, stock: 100, category: 'Personal Care', sku: 'PER003', unit: 'Tube', discount: 0, gstRate: 18 },
  { id: 57, name: 'Face Wash (100ml)', price: 150, stock: 50, category: 'Personal Care', sku: 'PER004', unit: 'Tube', discount: 0, gstRate: 18 },

  // Beverages
  { id: 58, name: 'Tea Powder (500g)', price: 250, stock: 80, category: 'Beverages', sku: 'BEV001', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 59, name: 'Instant Coffee (50g)', price: 190, stock: 60, category: 'Beverages', sku: 'BEV002', unit: 'Jar', discount: 0, gstRate: 5 },
  { id: 60, name: 'Fruit Juice (1L)', price: 110, stock: 70, category: 'Beverages', sku: 'BEV003', unit: 'Tetra Pack', discount: 0, gstRate: 12 },
  { id: 61, name: 'Cola Drink (2L)', price: 90, stock: 100, category: 'Beverages', sku: 'BEV004', unit: 'Bottle', discount: 0, gstRate: 18 },

  // Household
  { id: 62, name: 'Detergent Powder (1kg)', price: 110, stock: 80, category: 'Household', sku: 'HOU001', unit: 'Packet', discount: 0, gstRate: 18 },
  { id: 63, name: 'Dish Wash Bar (250g)', price: 20, stock: 150, category: 'Household', sku: 'HOU002', unit: 'Piece', discount: 0, gstRate: 18 },
  { id: 64, name: 'Floor Cleaner (1L)', price: 180, stock: 50, category: 'Household', sku: 'HOU003', unit: 'Bottle', discount: 0, gstRate: 18 },
  { id: 65, name: 'Toilet Cleaner (500ml)', price: 95, stock: 60, category: 'Household', sku: 'HOU004', unit: 'Bottle', discount: 0, gstRate: 18 },

  // Snacks
  { id: 66, name: 'Glucose Biscuits', price: 10, stock: 200, category: 'Snacks', sku: 'SNK001', unit: 'Packet', discount: 0, gstRate: 18 },
  { id: 67, name: 'Cream Biscuits', price: 30, stock: 150, category: 'Snacks', sku: 'SNK002', unit: 'Packet', discount: 0, gstRate: 18 },
  { id: 68, name: 'Potato Chips (Large)', price: 50, stock: 100, category: 'Snacks', sku: 'SNK003', unit: 'Packet', discount: 0, gstRate: 18 },
  { id: 69, name: 'Namkeen Mix (200g)', price: 60, stock: 80, category: 'Snacks', sku: 'SNK004', unit: 'Packet', discount: 0, gstRate: 5 },
  { id: 70, name: 'Chocolate Bar (50g)', price: 40, stock: 150, category: 'Snacks', sku: 'SNK005', unit: 'Piece', discount: 0, gstRate: 18 },
];

const AppDataContext = createContext(null);

const defaultCustomers = [];

export function AppDataProvider({ children }) {
  const [products, setProducts] = useStorage('products', defaultProducts);
  const [sales, setSales] = useStorage('sales', []);
  const [customers, setCustomers] = useStorage('customers', defaultCustomers);
  const [suppliers, setSuppliers] = useStorage('suppliers', []);
  const [purchases, setPurchases] = useStorage('purchases', []);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useStorage('nextInvoiceNumber', 1);

  const addSale = useCallback((sale) => {
    setSales((prev) => [...prev, sale]);
  }, [setSales]);

  const updateProducts = useCallback((updater) => {
    setProducts(updater);
  }, [setProducts]);

  const resetProducts = useCallback(() => {
    if (window.confirm('This will replace all current products with the default list. Are you sure?')) {
      setProducts(defaultProducts);
    }
  }, [setProducts]);

  const value = {
    products,
    setProducts,
    sales,
    setSales,
    customers,
    setCustomers,
    suppliers,
    setSuppliers,
    purchases,
    setPurchases,
    nextInvoiceNumber,
    setNextInvoiceNumber,
    addSale,
    updateProducts,
    resetProducts,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
