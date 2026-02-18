import React, { createContext, useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { currentUser } = useAuth();
  const [products, setProductsState] = useState([]);
  const [sales, setSalesState] = useState([]);
  const [customers, setCustomersState] = useState([]);
  const [suppliers, setSuppliersState] = useState([]);
  const [purchases, setPurchasesState] = useState([]); // Currently local only as backend lacks purchase module
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [prodData, salesData, custData, suppData] = await Promise.all([
        api.products.getAll(),
        api.sales.getAll(),
        api.entities.getCustomers(),
        api.entities.getSuppliers()
      ]);

      setProductsState(prodData);
      setSalesState(salesData);
      setCustomersState(custData);
      setSuppliersState(suppData);
    } catch (error) {
      console.error('Error fetching data from backend:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Products
  const addProduct = useCallback(async (product) => {
    try {
      const saved = await api.products.create(product);
      setProductsState(prev => [...prev, saved]);
      return saved;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id, product) => {
    try {
      const updated = await api.products.update(id, product);
      setProductsState(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.products.delete(id);
      setProductsState(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }, []);

  // Customers
  const addCustomer = useCallback(async (customer) => {
    try {
      const saved = await api.entities.createCustomer(customer);
      setCustomersState(prev => [...prev, saved]);
      return saved;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (id, customer) => {
    try {
      const updated = await api.entities.updateCustomer(id, customer);
      setCustomersState(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }, []);

  const deleteCustomer = useCallback(async (id) => {
    try {
      await api.entities.deleteCustomer(id);
      setCustomersState(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }, []);

  // Suppliers
  const addSupplier = useCallback(async (supplier) => {
    try {
      const saved = await api.entities.createSupplier(supplier);
      setSuppliersState(prev => [...prev, saved]);
      return saved;
    } catch (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  }, []);

  const updateSupplier = useCallback(async (id, supplier) => {
    try {
      const updated = await api.entities.updateSupplier(id, supplier);
      setSuppliersState(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }, []);

  const deleteSupplier = useCallback(async (id) => {
    try {
      await api.entities.deleteSupplier(id);
      setSuppliersState(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }, []);

  const addSale = useCallback(async (sale) => {
    try {
      const savedSale = await api.sales.create(sale);
      setSalesState(prev => [savedSale, ...prev]);
      // Also refresh products to sync stock
      const updatedProducts = await api.products.getAll();
      setProductsState(updatedProducts);
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Failed to save sale to database.');
    }
  }, []);

  const updateProducts = useCallback((updater) => {
    setProductsState(updater);
  }, []);

  const resetProducts = useCallback(async () => {
    if (window.confirm('Are you sure you want to reset products? (This won\'t affect backend in this simplified version)')) {
      await fetchData();
    }
  }, [fetchData]);

  const nextInvoiceNumber = useMemo(() => {
    if (sales.length === 0) return 1;
    const lastInvoice = sales[0]; // Sales are sorted by date desc
    if (lastInvoice.invoiceNo) {
      const match = lastInvoice.invoiceNo.match(/INV-(\d+)/);
      if (match) return parseInt(match[1]) + 1;
    }
    return sales.length + 1;
  }, [sales]);

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    sales,
    addSale,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    purchases,
    setPurchases: setPurchasesState,
    loading,
    refreshData: fetchData,
    updateProducts,
    resetProducts,
    nextInvoiceNumber
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
