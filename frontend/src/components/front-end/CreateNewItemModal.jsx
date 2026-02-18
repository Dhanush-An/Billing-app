import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardList,
  ChevronDown,
  Plus,
} from 'lucide-react';


const DEFAULT_CATEGORIES = ['Grocery', 'Beverage', 'Snacks', 'Bakery', 'Dairy', 'Electronics', 'Other'];
const CATEGORIES_STORAGE_KEY = 'productCategories';

function loadCategories() {
  try {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (_) { }
  return DEFAULT_CATEGORIES;
}

function saveCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (_) { }
}
const GST_OPTIONS = ['None', '0%', '5%', '12%', '18%', '28%'];
const UNIT_OPTIONS = [
  { value: 'PCS', label: 'Pieces (PCS)' },
  { value: 'Kg', label: 'Kilogram (Kg)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'Packet', label: 'Packet' },
  { value: 'Box', label: 'Box' },
];
const PRICE_WITH_TAX_OPTIONS = ['Inclusive', 'Exclusive'];

const getInitialForm = () => ({
  itemType: 'product',
  category: '',
  itemName: '',
  showInOnlineStore: false,
  salesPrice: '',
  priceWithTax: 'Exclusive',
  gstRate: 'None',
  discount: '',
  measuringUnit: 'PCS',
  openingStock: '',
});

export default function CreateNewItemModal({ onClose, onSave, products = [] }) {
  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [gstOpen, setGstOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [priceTaxOpen, setPriceTaxOpen] = useState(false);
  const [categories, setCategories] = useState(loadCategories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const closeAllDropdowns = () => {
    setCategoryOpen(false);
    setGstOpen(false);
    setUnitOpen(false);
    setPriceTaxOpen(false);
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const exists = categories.some((c) => c.toLowerCase() === name.toLowerCase());
    if (exists) {
      update('category', name);
      setCategoryOpen(false);
      setShowAddCategory(false);
      setNewCategoryName('');
      return;
    }
    const next = [...categories, name];
    setCategories(next);
    saveCategories(next);
    update('category', name);
    setShowAddCategory(false);
    setNewCategoryName('');
    setCategoryOpen(false);
  };

  useEffect(() => {
    const handleClick = () => closeAllDropdowns();
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.itemName?.trim()) next.itemName = 'Please enter the item name';
    if (!form.category) next.category = 'Please select a category';
    if (form.salesPrice !== '' && (isNaN(parseFloat(form.salesPrice)) || parseFloat(form.salesPrice) < 0))
      next.salesPrice = 'Enter a valid price';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const generateProductCode = (category) => {
    if (!category) return `ITM${Date.now().toString().slice(-4)}`;
    const prefix = category.slice(0, 3).toUpperCase().padEnd(3, 'X');

    const existingCodes = products
      .filter(p => {
        const code = p.product_code || p.sku || '';
        return code.startsWith(prefix);
      })
      .map(p => {
        const code = p.product_code || p.sku || '';
        const numPart = parseInt(code.replace(prefix, ''), 10);
        return isNaN(numPart) ? 0 : numPart;
      });

    const nextNum = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  };

  const handleSave = () => {
    if (!validate()) return;
    const gstNum = form.gstRate === 'None' ? 0 : parseFloat(form.gstRate) || 0;
    const newProductCode = generateProductCode(form.category);

    onSave({
      id: Date.now(),
      name: form.itemName.trim(),
      category: form.category,
      product_code: newProductCode,
      price: parseFloat(form.salesPrice) || 0,
      stock: parseInt(form.openingStock, 10) || 0,
      unit: form.measuringUnit,
      itemType: form.itemType,
      gstRate: gstNum,
      discount: parseFloat(form.discount) || 0,
      showInOnlineStore: form.showInOnlineStore,
      priceWithTax: form.priceWithTax,
    });
    onClose();
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-item-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 id="create-item-title" className="text-xl font-bold text-gray-800">
            Create New Item
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Main - Form content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-xl space-y-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h3>


              {/* Category */}
              <div>
                <label className={`${labelClass} flex items-center gap-1`}>
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { const wasOpen = categoryOpen; closeAllDropdowns(); if (!wasOpen) setCategoryOpen(true); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`${inputClass} flex items-center justify-between pr-10`}
                  >
                    <span className={form.category ? 'text-gray-800' : 'text-gray-400'}>
                      {form.category || 'Select Category'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                  {categoryOpen && (
                    <ul
                      className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto py-1"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {categories.map((cat) => (
                        <li key={cat}>
                          <button
                            type="button"
                            onClick={() => { update('category', cat); setCategoryOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-violet-50"
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                      {showAddCategory ? (
                        <li className="border-t border-gray-100 pt-2 px-2 mt-1" onMouseDown={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') { setShowAddCategory(false); setNewCategoryName(''); } }}
                              placeholder="New category name"
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              className="px-3 py-1.5 bg-violet-500 text-white text-sm font-medium rounded-md hover:bg-violet-600 shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        </li>
                      ) : (
                        <li className="border-t border-gray-100 mt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddCategory(true)}
                            className="w-full px-4 py-2 text-left text-sm text-violet-600 hover:bg-violet-50 flex items-center gap-2 font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Add category
                          </button>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>

              {/* Item Name */}
              <div>
                <label className={`${labelClass} flex items-center gap-1`}>
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.itemName}
                  onChange={(e) => update('itemName', e.target.value)}
                  placeholder="ex: Maggie 20gm"
                  className={`${inputClass} ${errors.itemName ? 'border-red-500' : ''}`}
                />
                {errors.itemName && <p className="mt-1 text-sm text-red-500">{errors.itemName}</p>}
              </div>

              {/* Show Item in Online Store */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show Item in Online Store</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.showInOnlineStore}
                  onClick={() => update('showInOnlineStore', !form.showInOnlineStore)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${form.showInOnlineStore ? 'bg-violet-500' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${form.showInOnlineStore ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </div>

              {/* Sales Price + With Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sales Price</label>
                  <div className="relative flex">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.salesPrice}
                      onChange={(e) => update('salesPrice', e.target.value)}
                      placeholder="ex: 200"
                      className={`${inputClass} pl-8 ${errors.salesPrice ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.salesPrice && <p className="mt-1 text-sm text-red-500">{errors.salesPrice}</p>}
                </div>
                <div>
                  <label className={labelClass}>With Tax</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { const wasOpen = priceTaxOpen; closeAllDropdowns(); if (!wasOpen) setPriceTaxOpen(true); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`${inputClass} flex items-center justify-between`}
                    >
                      <span>{form.priceWithTax}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {priceTaxOpen && (
                      <ul
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {PRICE_WITH_TAX_OPTIONS.map((opt) => (
                          <li key={opt}>
                            <button
                              type="button"
                              onClick={() => { update('priceWithTax', opt); setPriceTaxOpen(false); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-violet-50"
                            >
                              {opt}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* GST Tax Rate and Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>GST Tax Rate (%)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { const wasOpen = gstOpen; closeAllDropdowns(); if (!wasOpen) setGstOpen(true); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`${inputClass} flex items-center justify-between`}
                    >
                      <span>{form.gstRate}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {gstOpen && (
                      <ul
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {GST_OPTIONS.map((opt) => (
                          <li key={opt}>
                            <button
                              type="button"
                              onClick={() => { update('gstRate', opt); setGstOpen(false); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-violet-50"
                            >
                              {opt}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(e) => update('discount', e.target.value)}
                    placeholder="ex: 10"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Measuring Unit */}
              <div>
                <label className={labelClass}>Measuring Unit</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { const wasOpen = unitOpen; closeAllDropdowns(); if (!wasOpen) setUnitOpen(true); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`${inputClass} flex items-center justify-between`}
                  >
                    <span>{UNIT_OPTIONS.find((u) => u.value === form.measuringUnit)?.label ?? form.measuringUnit}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {unitOpen && (
                    <ul
                      className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <li key={u.value}>
                          <button
                            type="button"
                            onClick={() => { update('measuringUnit', u.value); setUnitOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-violet-50"
                          >
                            {u.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Opening Stock */}
              <div>
                <label className={labelClass}>Opening Stock</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={form.openingStock}
                    onChange={(e) => update('openingStock', e.target.value)}
                    placeholder="ex: 150 PCS"
                    className={inputClass}
                  />
                  <span className="text-sm font-medium text-gray-500 shrink-0">{form.measuringUnit}</span>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
