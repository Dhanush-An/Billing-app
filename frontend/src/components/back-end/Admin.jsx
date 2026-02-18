import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Package, LogOut, Plus, Search, Edit2, Trash2, X,
  FileText, ShoppingBag, CreditCard, Wallet, TrendingUp
} from 'lucide-react';
import { useAuth } from '../front-end/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { PageLoader } from '../ui/LoadingSpinner';
import CreateNewItemModal from './CreateNewItemModal';
import AddCustomerModal from './AddCustomerModal';
import AddSupplierModal from './AddSupplierModal';
import AddPurchaseModal from './AddPurchaseModal';



const CHART_COLORS = ['#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#ec4899'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { products, setProducts, sales, customers, setCustomers, suppliers, setSuppliers, purchases, setPurchases, resetProducts } = useAppData();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockSearchTerm, setStockSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (currentUser === null) {
      navigate('/', { replace: true });
    } else if (currentUser && currentUser.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const categories = useMemo(
    () => ['all', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (selectedCategory === 'all' || p.category === selectedCategory) &&
          (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.product_code && p.product_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())))
      ),
    [products, selectedCategory, searchTerm]
  );

  const filteredStock = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
          (p.product_code && p.product_code.toLowerCase().includes(stockSearchTerm.toLowerCase())) ||
          (p.sku && p.sku.toLowerCase().includes(stockSearchTerm.toLowerCase()))
      ),
    [products, stockSearchTerm]
  );

  const movements = useMemo(() => {
    const allMovements = [];

    sales.forEach(sale => {
      (sale.items || []).forEach((item, idx) => {
        allMovements.push({
          id: `sale-${sale.id}-${idx}`,
          date: sale.date,
          productName: item.name,
          productCode: item.code,
          type: 'Sale',
          quantity: -item.quantity,
          reference: sale.invoiceNo || sale.id,
          entity: sale.account || 'Walk-in Customer'
        });
      });
    });

    purchases.forEach(purchase => {
      (purchase.items || []).forEach((item, idx) => {
        allMovements.push({
          id: `purchase-${purchase.id}-${idx}`,
          date: purchase.date,
          productName: item.productName,
          productCode: item.productCode || '',
          type: 'Purchase',
          quantity: item.quantity,
          reference: purchase.invoiceNo || purchase.id,
          entity: purchase.supplierName
        });
      });
    });

    return allMovements.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales, purchases]);

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    const totalSalesVal = sales.reduce((sum, sale) => sum + sale.total, 0);
    const todaySalesVal = sales
      .filter(s => new Date(s.date).toDateString() === todayStr)
      .reduce((sum, s) => sum + s.total, 0);
    const yesterdaySalesVal = sales
      .filter(s => new Date(s.date).toDateString() === yesterdayStr)
      .reduce((sum, s) => sum + s.total, 0);

    const totalPurchasesVal = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const paymentReceivedVal = sales.reduce((sum, s) => sum + (s.receivedAmount || 0), 0);
    const balanceVal = sales.reduce((sum, s) => sum + (s.total - (s.receivedAmount || 0)), 0);
    const totalItemsVal = products.reduce((sum, p) => sum + p.stock, 0);

    return {
      totalSales: totalSalesVal,
      todaySales: todaySalesVal,
      yesterdaySales: yesterdaySalesVal,
      totalPurchases: totalPurchasesVal,
      paymentReceived: paymentReceivedVal,
      balanceByCustomers: balanceVal,
      totalExpenses: 0, // Placeholder for future expense management
      totalItems: totalItemsVal,
    };
  }, [products, sales]);

  const salesByDay = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.getDate();
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
      const daySales = sales.filter(
        (s) => new Date(s.date).toDateString() === date.toDateString()
      );
      const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
      last30Days.push({ day: dayStr, month: monthStr, revenue });
    }
    return last30Days;
  }, [sales]);

  const salesByProduct = useMemo(() => {
    const productSales = {};
    const totalSalesVal = sales.reduce((sum, s) => sum + s.total, 0);
    sales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        productSales[item.name] = (productSales[item.name] || 0) + item.total;
      });
    });
    return Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], idx) => ({
        name,
        value,
        color: CHART_COLORS[idx],
        percentage: totalSalesVal ? ((value / totalSalesVal) * 100).toFixed(1) : '0',
      }));
  }, [sales]);

  const maxRevenue = useMemo(
    () => Math.max(...salesByDay.map((d) => d.revenue), 1),
    [salesByDay]
  );

  const dailyReportData = useMemo(() => {
    const dailySales = sales.filter(s => {
      try {
        return s.date && new Date(s.date).toISOString().split('T')[0] === reportDate;
      } catch (e) {
        return false;
      }
    });
    const dailyPurchases = purchases.filter(p => {
      try {
        return p.date && new Date(p.date).toISOString().split('T')[0] === reportDate;
      } catch (e) {
        return false;
      }
    });

    const totalSalesAmount = dailySales.reduce((sum, s) => sum + s.total, 0);
    const totalPurchasesAmount = dailyPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

    return {
      sales: dailySales,
      purchases: dailyPurchases,
      totalSalesAmount,
      totalPurchasesAmount
    };
  }, [sales, purchases, reportDate]);

  const handleSaveNewItem = useCallback(
    (item) => {
      setProducts((prev) => [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          stock: item.stock,
          category: item.category,
          product_code: item.product_code,
          unit: item.unit || 'PCS',
          discount: item.discount || 0,
          gstRate: item.gstRate || 0,
        },
      ]);
      setShowAddProduct(false);
    },
    [setProducts]
  );

  const handleUpdateProduct = useCallback(() => {
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setEditingProduct(null);
  }, [editingProduct, setProducts]);

  const handleUpdateCustomer = useCallback(() => {
    if (!editingCustomer) return;
    setCustomers((prev) =>
      prev.map((c) => (c.id === editingCustomer.id ? editingCustomer : c))
    );
    setEditingCustomer(null);
  }, [editingCustomer, setCustomers]);

  const handleSaveNewCustomer = useCallback(
    (customer) => {
      setCustomers((prev) => [
        ...prev,
        {
          ...customer,
          id: Date.now(),
          customerId: prev.length > 0 ? Math.max(...prev.map(c => c.customerId || 0)) + 1 : 1,
          purchases: 0
        },
      ]);
      setShowAddCustomer(false);
    },
    [setCustomers]
  );

  const handleDeleteCustomer = useCallback(
    (id) => {
      if (window.confirm('Are you sure you want to delete this customer?')) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      }
    },
    [setCustomers]
  );

  const handleDeleteProduct = useCallback(
    (id) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [setProducts]
  );

  const handleSaveNewSupplier = useCallback(
    (supplier) => {
      setSuppliers((prev) => [
        ...prev,
        {
          ...supplier,
          id: Date.now(),
          products: 0
        },
      ]);
      setShowAddSupplier(false);
    },
    [setSuppliers]
  );

  const handleUpdateSupplier = useCallback(() => {
    if (!editingSupplier) return;
    setSuppliers((prev) =>
      prev.map((s) => (s.id === editingSupplier.id ? editingSupplier : s))
    );
    setEditingSupplier(null);
  }, [editingSupplier, setSuppliers]);

  const handleSaveNewPurchase = useCallback(
    (purchase) => {
      // 1. Save purchase record
      setPurchases((prev) => [...prev, purchase]);

      // 2. Update stock for each product in the purchase
      setProducts((prevProducts) => {
        return prevProducts.map((product) => {
          const purchaseItem = purchase.items.find((item) => item.productId === product.id);
          if (purchaseItem) {
            return {
              ...product,
              stock: product.stock + purchaseItem.quantity
            };
          }
          return product;
        });
      });

      setShowAddPurchase(false);
    },
    [setPurchases, setProducts]
  );

  const handleDeleteSupplier = useCallback(
    (id) => {
      if (window.confirm('Are you sure you want to delete this supplier?')) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      }
    },
    [setSuppliers]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);

  if (currentUser === null || (currentUser && currentUser.role !== 'admin')) {
    return <PageLoader />;
  }
  if (!currentUser) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white rounded-tr-3xl rounded-br-3xl shadow-xl flex flex-col shrink-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-xs text-gray-500">Company ID: 924923</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-6 px-4 overflow-y-auto">
            <div className="space-y-1">
              {[
                { name: 'Dashboard', label: 'Dashboard!!!' },
                { name: 'Sales', label: 'Sales' },
                { name: 'Purchase', label: 'Purchase' },
                { name: 'Reports', label: 'Reports' },
                { name: 'Product', label: 'Product' },
                { name: 'Customer', label: 'Customer' },
                { name: 'Supplier', label: 'Supplier' },
                { name: 'Stock', label: 'Stock' }
              ].map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${activeTab === tab.name
                    ? 'bg-violet-50 text-violet-600'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{activeTab}</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/50 rounded-lg transition">
                <FileText className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard
                  icon={TrendingUp}
                  label="Total sales"
                  value={`₹${stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-violet-50"
                  iconBg="bg-violet-100"
                  iconColor="text-violet-600"
                  borderColor="border-violet-100"
                />
                <StatCard
                  icon={ShoppingCart}
                  label="Total purchases"
                  value={`₹${stats.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-emerald-50"
                  iconBg="bg-emerald-100"
                  iconColor="text-emerald-600"
                  borderColor="border-emerald-100"
                />
                <StatCard
                  icon={CreditCard}
                  label="Payment Received"
                  value={`₹${stats.paymentReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-amber-50"
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  borderColor="border-amber-100"
                />
                <StatCard
                  icon={Wallet}
                  label="Balance by Customer"
                  value={`₹${stats.balanceByCustomers.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-rose-50"
                  iconBg="bg-rose-100"
                  iconColor="text-rose-600"
                  borderColor="border-rose-100"
                />
                <StatCard
                  icon={FileText}
                  label="Total Expenses"
                  value={`₹${stats.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-sky-50"
                  iconBg="bg-sky-100"
                  iconColor="text-sky-600"
                  borderColor="border-sky-100"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Day Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Sales by Day</h3>
                  <div className="relative h-80">
                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                      <span>₹60000</span>
                      <span>₹50000</span>
                      <span>₹40000</span>
                      <span>₹30000</span>
                      <span>₹20000</span>
                      <span>₹10000</span>
                      <span>₹0</span>
                    </div>

                    <div className="ml-12 h-full flex items-end gap-1 pb-8">
                      {salesByDay.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative">
                          <div className="w-full flex items-end justify-center h-full">
                            <div
                              className="w-full bg-gradient-to-t from-fuchsia-400 to-fuchsia-300 rounded-t-lg hover:from-fuchsia-500 hover:to-fuchsia-400 transition-all cursor-pointer"
                              style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                            >
                              {day.revenue > 0 && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                  ₹{day.revenue.toFixed(0)}
                                </div>
                              )}
                            </div>
                          </div>
                          {idx % 5 === 0 && (
                            <div className="text-xs text-gray-500 mt-2">
                              {day.day} {day.month}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sales by Product Pie Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Sales by Product</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <svg viewBox="0 0 200 200" className="transform -rotate-90">
                        {salesByProduct.length > 0 ? (
                          (() => {
                            let currentAngle = 0;
                            return salesByProduct.map((product, idx) => {
                              const percentage = parseFloat(product.percentage);
                              const angle = (percentage / 100) * 360;
                              const startAngle = currentAngle;
                              currentAngle += angle;

                              const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180);
                              const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180);
                              const x2 = 100 + 90 * Math.cos((currentAngle * Math.PI) / 180);
                              const y2 = 100 + 90 * Math.sin((currentAngle * Math.PI) / 180);

                              const largeArc = angle > 180 ? 1 : 0;

                              return (
                                <path
                                  key={idx}
                                  d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                  fill={product.color}
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                              );
                            });
                          })()
                        ) : (
                          <circle cx="100" cy="100" r="90" fill="#e5e7eb" />
                        )}
                      </svg>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {salesByProduct.map((product, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }}></div>
                        <span className="text-xs text-gray-600 truncate">{product.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{product.percentage}%</span>
                      </div>
                    ))}
                    {salesByProduct.length === 0 && (
                      <div className="col-span-2 text-center text-gray-400 text-sm py-4">
                        No sales data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock History */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Stock History</h3>
                <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Total Items in Stock</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalItems.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Product Tab */}
          {activeTab === 'Product' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetProducts}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium"
                    title="Load default products from context"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Reset to Defaults
                  </button>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                {Object.entries(
                  filteredProducts.reduce((acc, product) => {
                    const cat = product.category || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(product);
                    return acc;
                  }, {})
                ).map(([category, categoryProducts]) => (
                  <div key={category} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-lg font-bold text-gray-700">{category}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">product_code</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Discount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tax</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {categoryProducts.map(product => (
                            <tr key={product.id} className="hover:bg-violet-50/50 transition">
                              <td className="px-6 py-4 text-sm text-gray-600">{product.product_code || product.sku}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-800">{product.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{product.price}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${product.stock < 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                  {product.stock} units
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{product.discount || 0}%</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{product.gstRate || 0}%</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingProduct({ ...product })}
                                    className="p-2 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-200 transition"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'Sales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={TrendingUp}
                  label="Today Sales"
                  value={`₹${stats.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-violet-50"
                  iconBg="bg-violet-100"
                  iconColor="text-violet-600"
                  borderColor="border-violet-100"
                />

                <StatCard
                  icon={ShoppingBag}
                  label="Yesterday Sales"
                  value={`₹${stats.yesterdaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-emerald-50"
                  iconBg="bg-emerald-100"
                  iconColor="text-emerald-600"
                  borderColor="border-emerald-100"
                />

                <StatCard
                  icon={CreditCard}
                  label="Total Sales"
                  value={`₹${stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-sky-50"
                  iconBg="bg-sky-100"
                  iconColor="text-sky-600"
                  borderColor="border-sky-100"
                />

                <StatCard
                  icon={Wallet}
                  label="Active Balance"
                  value={`₹${stats.balanceByCustomers.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  bgColor="bg-rose-50"
                  iconBg="bg-rose-100"
                  iconColor="text-rose-600"
                  borderColor="border-rose-100"
                />
              </div>

              <div className="flex items-center justify-between mt-8 mb-4">
                <h3 className="text-xl font-bold text-gray-800">Recent Sales History</h3>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-3">
                  {sales.slice(-10).reverse().map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800">Sale #{sale.invoiceNo || sale.id}</p>
                        <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Cashier: {sale.cashier}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">₹{sale.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{sale.items.length} items</p>
                      </div>
                    </div>
                  ))}
                  {sales.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No sales records yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Tab */}
          {activeTab === 'Customer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Customer
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Customer List</h3>
                <div className="grid gap-4">
                  {customers.map(customer => (
                    <div key={customer.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-full flex items-center justify-center text-white font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{customer.name}</p>
                          <p className="text-sm text-gray-600">ID: {customer.customerId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCustomer({ ...customer })}
                          className="p-3 bg-violet-100 text-violet-600 rounded-xl hover:bg-violet-200 transition shadow-sm"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Supplier Tab */}
          {activeTab === 'Supplier' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowAddSupplier(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Supplier
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Supplier List</h3>
                <div className="grid gap-4">
                  {suppliers.map(supplier => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                          {supplier.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{supplier.name}</p>
                          <p className="text-xs text-gray-500">{supplier.contactPerson} | {supplier.mobile}</p>
                          {supplier.gstin && <p className="text-xs text-gray-500">GSTIN: {supplier.gstin}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingSupplier({ ...supplier })}
                          className="p-3 bg-violet-100 text-violet-600 rounded-xl hover:bg-violet-200 transition shadow-sm"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {suppliers.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No suppliers found. Add a new supplier to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stock Tab */}
          {activeTab === 'Stock' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={stockSearchTerm}
                    onChange={(e) => setStockSearchTerm(e.target.value)}
                    placeholder="Search stock by name or code..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Current Stock</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStock.map(product => (
                        <tr key={product.id} className="hover:bg-violet-50/50 transition">
                          <td className="px-6 py-4 text-sm text-gray-600">{product.product_code || product.sku}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{product.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-gray-800">
                            {product.stock} {product.unit || 'PCS'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {product.stock <= 0 ? (
                              <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">Out of Stock</span>
                            ) : product.stock < 10 ? (
                              <span className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full uppercase tracking-wider">Low Stock</span>
                            ) : (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-wider">Good</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredStock.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            No products found match your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-700">Recent Stock Movements</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Movement</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ref No</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Entity</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {movements.slice(0, 15).map(m => (
                        <tr key={m.id} className="hover:bg-violet-50/50 transition">
                          <td className="px-6 py-4 text-xs text-gray-600">
                            {new Date(m.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">{m.productName}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{m.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono">{m.reference}</td>
                          <td className="px-6 py-4 text-xs text-gray-600 truncate max-w-[150px]">{m.entity}</td>
                          <td className={`px-6 py-4 text-right text-sm font-bold ${m.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {m.quantity > 0 ? '+' : ''}{m.quantity}
                          </td>
                        </tr>
                      ))}
                      {movements.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm italic">
                            No stock movements recorded yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'Reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Select Date:</span>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="px-6 py-3 bg-violet-50 rounded-xl border border-violet-100">
                    <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-800">₹{dailyReportData.totalSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="px-6 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Total Purchases</p>
                    <p className="text-2xl font-bold text-gray-800">₹{dailyReportData.totalPurchasesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-violet-600" />
                    <h3 className="text-lg font-bold text-gray-700">Daily Sales Details</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-violet-50/50 text-left">
                        <tr>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {dailyReportData.sales.map(sale => (
                          <tr key={sale.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">#{sale.invoiceNo || sale.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{sale.account || 'Walk-in'}</td>
                            <td className="px-6 py-4 text-sm text-right font-bold text-gray-800">₹{sale.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                        {dailyReportData.sales.length === 0 && (
                          <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-gray-400 text-sm">No sales for this date</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Daily Purchases Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-gray-700">Daily Purchase Details</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-emerald-50/50 text-left">
                        <tr>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {dailyReportData.purchases.map(purchase => (
                          <tr key={purchase.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">#{purchase.invoiceNo || purchase.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{purchase.supplierName}</td>
                            <td className="px-6 py-4 text-sm text-right font-bold text-gray-800">₹{purchase.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                        {dailyReportData.purchases.length === 0 && (
                          <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-gray-400 text-sm">No purchases for this date</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Purchase Tab */}
          {activeTab === 'Purchase' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowAddPurchase(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Purchase
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Purchase History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice No</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Supplier</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {purchases.slice().reverse().map(purchase => (
                        <tr key={purchase.id} className="hover:bg-violet-50/50 transition">
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(purchase.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{purchase.invoiceNo || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{purchase.supplierName}</td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-gray-800">₹{purchase.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">{purchase.items.length} products</td>
                        </tr>
                      ))}
                      {purchases.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            No purchase records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Unit Tab */}
          {activeTab === 'Unit' && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{activeTab} Management</h3>
              <p className="text-gray-600">This section is under development</p>
            </div>
          )}
        </main>
      </div>

      {/* Create New Item modal (Add Product) */}
      {showAddProduct && (
        <CreateNewItemModal
          onClose={() => setShowAddProduct(false)}
          onSave={handleSaveNewItem}
          products={products}
        />
      )}

      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onSave={handleSaveNewCustomer}
        />
      )}

      {showAddSupplier && (
        <AddSupplierModal
          onClose={() => setShowAddSupplier(false)}
          onSave={handleSaveNewSupplier}
        />
      )}

      {showAddPurchase && (
        <AddPurchaseModal
          onClose={() => setShowAddPurchase(false)}
          onSave={handleSaveNewPurchase}
          suppliers={suppliers}
          products={products}
        />
      )}

      {editingSupplier && (
        <Modal onClose={() => setEditingSupplier(null)}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Supplier</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={editingSupplier.name}
              onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="Supplier Name"
            />
            <input
              type="text"
              value={editingSupplier.contactPerson || ''}
              onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="Contact Person"
            />
            <input
              type="text"
              value={editingSupplier.mobile || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setEditingSupplier({ ...editingSupplier, mobile: val });
              }}
              maxLength={10}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="Enter 10-digit mobile number"
            />
            <input
              type="email"
              value={editingSupplier.email || ''}
              onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="Email"
            />
            <input
              type="text"
              value={editingSupplier.gstin || ''}
              onChange={(e) => setEditingSupplier({ ...editingSupplier, gstin: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="GSTIN"
            />
            <textarea
              value={editingSupplier.address || ''}
              onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[100px]"
              placeholder="Address"
            />
            <button
              onClick={handleUpdateSupplier}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition"
            >
              Update Supplier
            </button>
          </div>
        </Modal>
      )}

      {editingProduct && (
        <Modal onClose={() => setEditingProduct(null)}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Product</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="text"
              value={editingProduct.product_code}
              onChange={(e) => setEditingProduct({ ...editingProduct, product_code: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="text"
              value={editingProduct.category}
              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="number"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="Stock"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">Discount (%)</label>
                <input
                  type="number"
                  value={editingProduct.discount ?? 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Discount %"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">Tax (%)</label>
                <input
                  type="number"
                  value={editingProduct.gstRate ?? 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, gstRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Tax %"
                />
              </div>
            </div>
            <button
              onClick={handleUpdateProduct}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition"
            >
              Update Product
            </button>
          </div>
        </Modal>
      )}

      {editingCustomer && (
        <Modal onClose={() => setEditingCustomer(null)}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Customer</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <input
                type="text"
                value={editingCustomer.customerId}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={editingCustomer.name}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={editingCustomer.mobile || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setEditingCustomer({ ...editingCustomer, mobile: val });
                }}
                maxLength={10}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                placeholder="Enter 10-digit mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={editingCustomer.address || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[80px]"
                placeholder="Enter address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mail ID</label>
              <input
                type="email"
                value={editingCustomer.email || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                placeholder="Enter email address"
              />
            </div>
            <button
              onClick={handleUpdateCustomer}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition shadow-lg mt-2"
            >
              Update Customer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Stat Card Component (memoized)
const StatCard = React.memo(({ icon: Icon, label, value, bgColor, iconBg, iconColor, borderColor }) => (
  <div className={`${bgColor} ${borderColor} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-1`}>
    <div className={`${iconBg} w-12 h-12 rounded-2xl flex items-center justify-center ${iconColor} mb-2`}>
      {typeof Icon === 'string' ? <span className="text-2xl">{Icon}</span> : <Icon className="w-6 h-6" />}
    </div>
    <p className={`text-sm font-medium ${iconColor}`}>{label}</p>
    <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
  </div>
));
StatCard.displayName = 'StatCard';

// Modal Component (memoized)
const Modal = React.memo(({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>
      {children}
    </div>
  </div>
));
Modal.displayName = 'Modal';

export default AdminDashboard;