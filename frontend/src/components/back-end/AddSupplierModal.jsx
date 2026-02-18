import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddSupplierModal = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        name: '',
        contactPerson: '',
        mobile: '',
        email: '',
        address: '',
        gstin: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            alert('Please enter a supplier name');
            return;
        }
        onSave(form);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'mobile') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setForm((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Add New Supplier</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            placeholder="Supplier Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                            type="text"
                            name="contactPerson"
                            value={form.contactPerson}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            placeholder="Contact Person Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            type="text"
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            maxLength={10}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            placeholder="Enter 10-digit mobile number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mail ID</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            placeholder="example@mail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                        <input
                            type="text"
                            name="gstin"
                            value={form.gstin}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            placeholder="GSTIN Number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition min-h-[100px]"
                            placeholder="Supplier Address"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition shadow-lg mt-4"
                    >
                        Save Supplier
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSupplierModal;
