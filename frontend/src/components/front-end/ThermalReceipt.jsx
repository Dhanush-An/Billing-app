import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';

const ThermalReceipt = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const invoiceData = location.state?.invoiceData;
    const receiptRef = useRef();

    if (!invoiceData) {
        return (
            <div className="p-8 text-center text-gray-500">
                No invoice data found. Please go back and try again.
                <button onClick={() => navigate('/user')} className="block mx-auto mt-4 text-violet-600 underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const totalDiscount = invoiceData.items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.price;
        return sum + (itemSubtotal * (item.discount || 0) / 100);
    }, 0);
    const totalTax = invoiceData.items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.price;
        const afterDisc = itemSubtotal - (itemSubtotal * (item.discount || 0) / 100);
        return sum + (afterDisc * (item.tax || 0) / 100);
    }, 0);

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const totalAmount = subtotal; // subtotal in invoiceData already includes tax and discount logic per line
    const roundedTotal = Math.round(totalAmount);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            {/* Action Bar */}
            <div className="max-w-[400px] mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate('/user')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition"
                >
                    <Printer className="w-4 h-4" />
                    Print Receipt
                </button>
            </div>

            {/* Outer Paper Container */}
            <div
                ref={receiptRef}
                className="mx-auto bg-white shadow-lg p-4 font-mono text-sm leading-tight text-gray-900 overflow-hidden"
                style={{ width: '80mm', minHeight: '100px', maxWidth: '100%' }}
            >
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold uppercase tracking-wider mb-1">BillMaster</h1>
                    <p className="text-[10px] text-gray-600">Retail Sales Entry</p>
                    <p className="text-[10px] text-gray-600 mt-1">Source: API #{invoiceData.id || 'N/A'}</p>
                    <div className="border-b border-dashed border-gray-400 my-2"></div>
                    <div className="flex justify-between text-[10px] px-1">
                        <span>Open (Reprint) {invoiceData.invoiceNo}</span>
                        <span>Cust ID: {invoiceData.customerId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] px-1">
                        <span>Items: {invoiceData.items.length}</span>
                        <span>Qty: {invoiceData.items.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] px-1">
                        <span>{new Date(invoiceData.date).toLocaleDateString()} {new Date(invoiceData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{invoiceData.account || 'N/A'}</span>
                    </div>
                </div>

                <div className="border-b border-dashed border-gray-400 mb-2"></div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                    {invoiceData.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                            <div className="flex justify-between font-bold">
                                <span className="uppercase text-[12px] flex-1 pr-2">{item.name}</span>
                                <span>{item.total.toFixed(2)}</span>
                            </div>
                            <div className="text-[11px] text-gray-600">
                                {item.quantity} @ {item.price.toFixed(2)}/ea
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-b border-dashed border-gray-400 mb-2"></div>

                {/* Totals */}
                <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[13px]">
                        <span>Sub Total</span>
                        <span>{(subtotal - totalTax + totalDiscount).toFixed(2)}</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="flex justify-between text-[11px] text-red-600">
                            <span>Total Discount</span>
                            <span>-{totalDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[11px]">
                        <span>CGST</span>
                        <span>{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span>SGST</span>
                        <span>{sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[14px] mt-1 border-t border-dashed border-gray-400 pt-1">
                        <span>Bill Total</span>
                        <span>{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="border-b border-dashed border-gray-400 mb-2"></div>

                {/* Grand Total */}
                <div className="flex justify-between items-baseline font-bold py-2">
                    <span className="text-[18px]">Bill Total (rounded)</span>
                    <span className="text-[22px]">{roundedTotal.toFixed(2)}</span>
                </div>

                <div className="border-b border-dashed border-gray-400 mb-2"></div>

                <div className="flex justify-between text-[12px] font-bold">
                    <span>Payment Mode</span>
                    <span>{invoiceData.paymentMode || 'Cash'}</span>
                </div>

                <div className="text-center mt-6 text-[10px] text-gray-500">
                    <p>Powered by www.dotpe.in</p>
                </div>
            </div>

            <style>{`
        @media print {
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0;
            size: 80mm auto;
          }
          div {
            box-shadow: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default ThermalReceipt;
