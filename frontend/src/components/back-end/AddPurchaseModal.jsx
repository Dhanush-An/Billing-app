import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const AddPurchaseModal = ({ onClose, onSave, suppliers, products }) => {
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNo, setInvoiceNo] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1, costPrice: 0 }]);

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    }, [items]);

    const handleAddItem = () => {
        setItems([...items, { productId: '', quantity: 1, costPrice: 0 }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-fill cost price from product if it exists and costPrice is 0
        if (field === 'productId' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product && newItems[index].costPrice === 0) {
                // Using generic logic: usually cost price is lower than selling price. 
                // For now, let's keep it as 0 or let the user enter it.
            }
        }

        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedSupplier) {
            alert('Please select a supplier');
            return;
        }

        if (items.some(item => !item.productId || item.quantity <= 0)) {
            alert('Please fill in all item details correctly');
            return;
        }

        const purchaseData = {
            id: Date.now(),
            date: purchaseDate,
            invoiceNo,
            supplierId: parseInt(selectedSupplier),
            supplierName: suppliers.find(s => s.id === parseInt(selectedSupplier))?.name || 'Unknown',
            items: items.map(item => {
                const product = products.find(p => p.id === parseInt(item.productId));
                return {
                    ...item,
                    productId: parseInt(item.productId),
                    productName: product?.name || 'Unknown',
                    total: item.quantity * item.costPrice
                };
            }),
            totalAmount
        };

        onSave(purchaseData);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-6">New Purchase Record</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                            <input
                                type="date"
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                            <input
                                type="text"
                                value={invoiceNo}
                                onChange={(e) => setInvoiceNo(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                placeholder="P-INV-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                            <select
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-700">Purchase Items</h4>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl relative group">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product</label>
                                        <select
                                            value={item.productId}
                                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.sku || p.product_code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Qty</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cost Price (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.costPrice}
                                            onChange={(e) => handleItemChange(index, 'costPrice', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total (₹)</label>
                                        <div className="px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-sm font-bold text-gray-700">
                                            {(item.quantity * item.costPrice).toFixed(2)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-red-400 hover:text-red-600 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 pt-6 gap-4">
                        <div className="text-2xl font-bold text-gray-800">
                            Total Amount: <span className="text-violet-600">₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 md:flex-none px-8 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 md:flex-none px-12 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition shadow-lg"
                            >
                                Save Purchase
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPurchaseModal;
