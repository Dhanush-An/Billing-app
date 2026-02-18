import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, Plus, X, FileText
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { PageLoader } from '../ui/LoadingSpinner';

const EMPTY_ROW = (idx) => ({
  id: `empty-${idx}`,
  code: '',
  itemName: '',
  unit: '',
  qty: '',
  price: '',
  disc: '',
  tax: '',
  value: 0,
  isEmpty: true,
});

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { products, setProducts, addSale, nextInvoiceNumber, setNextInvoiceNumber, customers } = useAppData();
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedAccount, setSelectedAccount] = useState({ id: 'choose', name: 'Please Choose', customerId: '' });
  const [customerIdInput, setCustomerIdInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartItems, setCartItems] = useState(() =>
    Array.from({ length: 100 }, (_, idx) => EMPTY_ROW(idx))
  );
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [activeItemRowIndex, setActiveItemRowIndex] = useState(-1);
  const [activeItemField, setActiveItemField] = useState('');

  useEffect(() => {
    if (currentUser === null) navigate('/', { replace: true });
    else if (currentUser && currentUser.role !== 'user') navigate('/', { replace: true });
  }, [currentUser, navigate]);

  const handleProductSearch = useCallback(
    (rowIndex, field, value) => {
      if (field !== 'code' && field !== 'itemName') return;
      const product = products.find(
        (p) =>
          (p.product_code && p.product_code.toLowerCase() === value.toLowerCase()) ||
          p.name.toLowerCase() === value.toLowerCase()
      );
      if (!product) return;
      setCartItems((prev) => {
        const next = [...prev];
        const row = {
          ...next[rowIndex],
          id: product.id,
          code: product.product_code,
          itemName: product.name,
          unit: product.unit || 'Piece',
          price: product.price,
          qty: next[rowIndex].qty || 1,
          disc: product.discount ?? 0,
          tax: product.gstRate ?? 0,
          isEmpty: false
        };
        const qty = parseFloat(row.qty) || 0;
        const price = parseFloat(row.price) || 0;
        const disc = parseFloat(row.disc) || 0;
        const tax = parseFloat(row.tax) || 0;
        const subtotal = qty * price;
        row.value = subtotal - (subtotal * disc) / 100 + ((subtotal - (subtotal * disc) / 100) * tax) / 100;
        next[rowIndex] = row;
        return next;
      });
    },
    [products]
  );

  const handleFieldChange = useCallback((rowIndex, field, value) => {
    setCartItems((prev) => {
      const next = prev.map((item, i) => (i !== rowIndex ? item : { ...item, [field]: value }));
      if (['qty', 'price', 'disc', 'tax'].includes(field)) {
        const r = next[rowIndex];
        const qty = parseFloat(r.qty) || 0;
        const price = parseFloat(r.price) || 0;
        const disc = parseFloat(r.disc) || 0;
        const tax = parseFloat(r.tax) || 0;
        const subtotal = qty * price;
        next[rowIndex].value = subtotal - (subtotal * disc) / 100 + ((subtotal - (subtotal * disc) / 100) * tax) / 100;
      }
      return next;
    });

    if (field === 'code' || field === 'itemName') {
      if (value.trim() === '') {
        setProductSuggestions([]);
        setShowProductSuggestions(false);
        setActiveItemRowIndex(-1);
        setActiveItemField('');
      } else {
        const filtered = products.filter((p) =>
          (p.product_code && p.product_code.toLowerCase().includes(value.toLowerCase())) ||
          (p.sku && p.sku.toLowerCase().includes(value.toLowerCase())) ||
          p.name.toLowerCase().includes(value.toLowerCase())
        );
        setProductSuggestions(filtered);
        setShowProductSuggestions(true);
        setActiveItemRowIndex(rowIndex);
        setActiveItemField(field);
      }
    }
  }, [products]);

  const selectProduct = useCallback((rowIndex, product) => {
    setCartItems((prev) => {
      const next = [...prev];
      const row = {
        ...next[rowIndex],
        id: product.id,
        code: product.product_code || product.sku || '',
        itemName: product.name,
        unit: product.unit || 'Piece',
        price: product.price,
        qty: next[rowIndex].qty || 1,
        disc: product.discount ?? 0,
        tax: product.gstRate ?? 0,
        isEmpty: false
      };
      const qty = parseFloat(row.qty) || 0;
      const price = parseFloat(row.price) || 0;
      const disc = parseFloat(row.disc) || 0;
      const tax = parseFloat(row.tax) || 0;
      const subtotal = qty * price;
      row.value = subtotal - (subtotal * disc) / 100 + ((subtotal - (subtotal * disc) / 100) * tax) / 100;
      next[rowIndex] = row;
      return next;
    });
    setProductSuggestions([]);
    setShowProductSuggestions(false);
    setActiveItemRowIndex(-1);
    setActiveItemField('');
  }, []);

  const removeRow = useCallback((rowIndex) => {
    setCartItems((prev) => prev.map((item, i) => (i !== rowIndex ? item : EMPTY_ROW(rowIndex))));
  }, []);

  const totals = useMemo(() => {
    const nonEmpty = cartItems.filter((item) => !item.isEmpty);

    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;
    let subTotalBeforeTaxAndDisc = 0;

    nonEmpty.forEach(item => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      const discRate = parseFloat(item.disc) || 0;
      const taxRate = parseFloat(item.tax) || 0;

      const lineSubtotal = qty * price;
      const lineDiscount = (lineSubtotal * discRate) / 100;
      const afterDisc = lineSubtotal - lineDiscount;
      const lineTax = (afterDisc * taxRate) / 100;

      subTotalBeforeTaxAndDisc += lineSubtotal;
      totalDiscountAmount += lineDiscount;
      totalTaxAmount += lineTax;
    });

    const netAmount = subTotalBeforeTaxAndDisc - totalDiscountAmount + totalTaxAmount;

    return {
      totalItems: nonEmpty.length,
      totalQty: nonEmpty.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0),
      subTotal: subTotalBeforeTaxAndDisc,
      discount: totalDiscountAmount,
      freightCharges: 0,
      packageValue: subTotalBeforeTaxAndDisc - totalDiscountAmount,
      cgst: totalTaxAmount / 2,
      sgst: totalTaxAmount / 2,
      igst: 0,
      cessOff: 0,
      netAmount: netAmount,
    };
  }, [cartItems]);

  const clearForm = useCallback(() => {
    setCartItems(Array.from({ length: 100 }, (_, idx) => EMPTY_ROW(idx)));
    setSelectedAccount({ id: 'choose', name: 'Please Choose', customerId: '' });
    setPaymentMode('Cash');
    setReceivedAmount(0);
  }, []);

  // Sync receivedAmount with netAmount unless manually changed
  useEffect(() => {
    setReceivedAmount(totals.netAmount);
  }, [totals.netAmount]);

  const handleSave = useCallback((showInvoice = true) => {
    const nonEmptyItems = cartItems.filter((item) => !item.isEmpty);
    if (nonEmptyItems.length === 0) {
      alert('Please add at least one item');
      return;
    }
    if (!selectedAccount || selectedAccount.id === 'choose') {
      alert('Please select an account');
      return;
    }

    const currentInvoiceNo = `INV-${String(nextInvoiceNumber).padStart(3, '0')}`;

    const sale = {
      id: Date.now(),
      invoiceNo: currentInvoiceNo,
      date: new Date().toISOString(),
      billDate,
      dueDate,
      account: selectedAccount.name,
      customerId: selectedAccount.customerId,
      customerEmail: selectedAccount.email,
      cashier: currentUser?.name ?? 'Cashier',
      items: nonEmptyItems.map((item) => ({
        code: item.code,
        name: item.itemName,
        unit: item.unit,
        quantity: parseFloat(item.qty),
        price: parseFloat(item.price),
        discount: parseFloat(item.disc) || 0,
        tax: parseFloat(item.tax) || 0,
        total: item.value,
      })),
      total: totals.netAmount,
      receivedAmount: parseFloat(receivedAmount) || 0,
      paymentMode,
      additionalInfo: {},
    };
    setProducts((prev) =>
      prev.map((p) => {
        const sold = nonEmptyItems.find((item) => item.id === p.id);
        return sold ? { ...p, stock: p.stock - parseFloat(sold.qty) } : p;
      })
    );
    addSale(sale);
    setNextInvoiceNumber(prev => prev + 1);
    localStorage.setItem('lastInvoice', JSON.stringify(sale));

    if (showInvoice === 'thermal') {
      navigate('/thermal-receipt', { state: { invoiceData: sale } });
    } else if (showInvoice) {
      navigate('/invoice', { state: { invoiceData: sale } });
    } else {
      alert(`Sale saved successfully! (Bill No: ${currentInvoiceNo})`);
      clearForm();
    }
  }, [cartItems, selectedAccount, billDate, dueDate, currentUser, totals, setProducts, addSale, navigate, clearForm, paymentMode, nextInvoiceNumber, setNextInvoiceNumber]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);

  if (currentUser === null || (currentUser && currentUser.role !== 'user')) return <PageLoader />;
  if (!currentUser) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold">B</div>
                  <div className="w-8 h-8 rounded-full bg-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                </div>
                <span className="text-sm font-semibold text-gray-700">BillMaster · Retail Sales</span>
              </div>
              <div className="flex items-center gap-2 text-violet-600">
                <ShoppingCart className="w-5 h-5" aria-hidden />
                <span className="font-semibold">Retail Sales</span>
              </div>
            </div>

            {/* Top Menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/invoice')}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Invoice
              </button>


              <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded">
                <span className="text-sm text-gray-700">{currentUser.name}</span>
                <button type="button" onClick={handleLogout} className="text-violet-600 text-sm font-medium hover:underline">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Form Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Retail Sales Entry</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Top Form Fields */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Customer Search (ID or Name)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerIdInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomerIdInput(val);
                      if (val === '') {
                        setSelectedAccount({ id: 'choose', name: 'Please Choose', customerId: '' });
                        setSuggestions([]);
                        setShowSuggestions(false);
                      } else {
                        const filtered = customers.filter(c =>
                          String(c.customerId).includes(val) ||
                          c.name.toLowerCase().includes(val.toLowerCase())
                        );
                        setSuggestions(filtered);
                        setShowSuggestions(true);

                        // If exact ID match or exact name match (case insensitive)
                        const exact = customers.find(c => String(c.customerId) === val) ||
                          customers.find(c => c.name.toLowerCase() === val.toLowerCase());
                        if (exact) setSelectedAccount(exact);
                        else setSelectedAccount({ id: 'choose', name: 'Searching...', customerId: '' });
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => customerIdInput && setShowSuggestions(true)}
                    placeholder="Type ID or Name..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                      {suggestions.map((cust) => (
                        <button
                          key={cust.id}
                          onClick={() => {
                            setSelectedAccount(cust);
                            setCustomerIdInput(cust.name);
                            setSuggestions([]);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-violet-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                        >
                          <span className="font-medium text-gray-800">{cust.name}</span>
                          <span className="text-xs text-violet-500 font-bold bg-violet-50 px-2 py-0.5 rounded">ID: {cust.customerId}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedAccount.id !== 'choose' && !showSuggestions && (
                    <div className="absolute left-0 top-full mt-1 w-full p-2 bg-emerald-50 text-[10px] font-bold text-emerald-700 rounded border border-emerald-100 z-10 flex items-center justify-between">
                      <span>✓ Matched: {selectedAccount.name}</span>
                      <span>ID: {selectedAccount.customerId}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bill No</label>
                <input
                  type="text"
                  value={`INV-${String(nextInvoiceNumber).padStart(3, '0')}`}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bill Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Inclusive of Tax</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="taxInclusive" className="text-violet-600" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="taxInclusive" defaultChecked className="text-violet-600" />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar relative">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-8">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-32">Code</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Item Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-20">Unit</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-20">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-24">Price</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-20">Disc %</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-20">Tax %</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-28">Value</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-1">
                      <div className="flex items-center gap-1 relative">
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) => handleFieldChange(idx, 'code', e.target.value)}
                          onBlur={() => setTimeout(() => setShowProductSuggestions(false), 200)}
                          onFocus={() => {
                            if (item.code) {
                              const filtered = products.filter(p =>
                                (p.product_code && p.product_code.toLowerCase().includes(item.code.toLowerCase())) ||
                                (p.sku && p.sku.toLowerCase().includes(item.code.toLowerCase()))
                              );
                              setProductSuggestions(filtered);
                              setShowProductSuggestions(true);
                              setActiveItemRowIndex(idx);
                              setActiveItemField('code');
                            }
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="product_code"
                        />
                        {showProductSuggestions && activeItemRowIndex === idx && activeItemField === 'code' && productSuggestions.length > 0 && (
                          <div className="absolute left-0 top-full mt-1 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-[100]">
                            {productSuggestions.map((p) => (
                              <button
                                key={p.id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectProduct(idx, p);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-violet-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800">{p.name}</span>
                                  <span className="text-[10px] text-gray-400">{p.product_code || p.sku}</span>
                                </div>
                                <span className="text-xs text-violet-500 font-bold bg-violet-50 px-2 py-0.5 rounded">₹{p.price}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Search className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-1">
                      <div className="flex items-center gap-1 relative">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleFieldChange(idx, 'itemName', e.target.value)}
                          onBlur={() => setTimeout(() => setShowProductSuggestions(false), 200)}
                          onFocus={() => {
                            if (item.itemName) {
                              const filtered = products.filter(p => p.name.toLowerCase().includes(item.itemName.toLowerCase()));
                              setProductSuggestions(filtered);
                              setShowProductSuggestions(true);
                              setActiveItemRowIndex(idx);
                              setActiveItemField('itemName');
                            }
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="Item name"
                        />
                        {showProductSuggestions && activeItemRowIndex === idx && activeItemField === 'itemName' && productSuggestions.length > 0 && (
                          <div className="absolute left-0 top-full mt-1 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-[100]">
                            {productSuggestions.map((p) => (
                              <button
                                key={p.id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectProduct(idx, p);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-violet-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800">{p.name}</span>
                                  <span className="text-[10px] text-gray-400">{p.product_code || p.sku}</span>
                                </div>
                                <span className="text-xs text-violet-500 font-bold bg-violet-50 px-2 py-0.5 rounded">₹{p.price}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Search className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-1">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </td>
                    <td className="px-3 py-1">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleFieldChange(idx, 'qty', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        min="0"
                        step="1"
                      />
                    </td>
                    <td className="px-3 py-1">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleFieldChange(idx, 'price', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-1">
                      <input
                        type="number"
                        value={item.disc}
                        onChange={(e) => handleFieldChange(idx, 'disc', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-1">
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleFieldChange(idx, 'tax', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-1">
                      <input
                        type="text"
                        value={item.value.toFixed(2)}
                        disabled
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-right font-medium"
                      />
                    </td>
                    <td className="px-3 py-1">
                      {!item.isEmpty && (
                        <button
                          onClick={() => removeRow(idx)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional Fields */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Total Item:</span>
                <span className="font-bold">{totals.totalItems}</span>
                <span className="ml-4 font-medium">Total Qty:</span>
                <span className="font-bold">{totals.totalQty}</span>
              </div>
            </div>
          </div>

          {/* Footer - Totals and Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex justify-between items-start">
              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Payment Mode:</span>
                  <div className="flex gap-2">
                    {['Cash', 'UPI', 'Online Payment', 'Cards'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${paymentMode === mode
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-violet-300 hover:text-violet-600'
                          }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearForm}
                    className="px-6 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Clear
                  </button>
                  <button
                    onClick={() => handleSave('thermal')}
                    className="px-6 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition flex items-center gap-2 shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Normal Billing
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    className="px-6 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 transition flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-semibold">{totals.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold">{totals.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Freight Charges</span>
                  <span className="font-semibold">{totals.freightCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Package Value</span>
                  <span className="font-semibold">{totals.packageValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CGST</span>
                  <span className="font-semibold">{totals.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SGST</span>
                  <span className="font-semibold">{totals.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST</span>
                  <span className="font-semibold">{totals.igst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cess off</span>
                  <span className="font-semibold">{totals.cessOff.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-bold text-gray-800">Net Amount</span>
                  <span className="font-bold text-lg">{totals.netAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600 font-medium">Received Amt</span>
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="w-24 px-2 py-1 text-right text-sm border border-violet-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 font-bold text-violet-700 bg-violet-50"
                  />
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 text-xs italic">Balance</span>
                  <span className="text-gray-500 text-xs italic font-semibold">{(totals.netAmount - (parseFloat(receivedAmount) || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;