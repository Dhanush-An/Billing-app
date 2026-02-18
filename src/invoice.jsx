import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceRef = useRef(null);
  const defaultInvoice = {
    id: 'new',
    invoiceNo: 'NEW',
    date: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    account: '',
    items: [],
    receivedAmount: 0,
    additionalInfo: {}
  };

  const [invoiceData, setInvoiceData] = useState(() => {
    if (location.state?.invoiceData) return location.state.invoiceData;
    const lastInvoice = localStorage.getItem('lastInvoice');
    return lastInvoice ? JSON.parse(lastInvoice) : defaultInvoice;
  });

  useEffect(() => {
    if (location.state?.invoiceData) {
      setInvoiceData(location.state.invoiceData);
    }
  }, [location]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoiceData.invoiceNo}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleEmail = () => {
    const email = invoiceData.customerEmail || '';
    const subject = encodeURIComponent(`Invoice from BillMaster - ${invoiceData.invoiceNo}`);
    const body = encodeURIComponent(`Dear ${invoiceData.account},\n\nPlease find the details for Invoice ${invoiceData.invoiceNo} below.\n\nTotal Amount: ₹ ${totalAmount.toLocaleString('en-IN')}\n\nThank you for choosing BillMaster!`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };



  // Calculate totals
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

  const taxableAmount = subtotal - totalTax;
  const totalAmount = subtotal;
  const receivedAmount = invoiceData.receivedAmount || 0;
  const balance = totalAmount - receivedAmount;

  // Convert number to words (simple implementation)
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const convertNumber = (n) => {
      if (n < 1000) return convertLessThanThousand(n);
      if (n < 100000) return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertLessThanThousand(n % 1000) : '');
      return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertNumber(n % 100000) : '');
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = convertNumber(rupees) + ' Rupees';
    if (paise > 0) result += ' and ' + convertNumber(paise) + ' Paise';
    return result + ' Only';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar - Hidden when printing */}
      <div className="bg-white border-b border-gray-200 p-4 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/user')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sales Entry
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-6xl mx-auto p-8 print:p-0" ref={invoiceRef}>
        <div className="bg-white shadow-lg print:shadow-none">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Tax Invoice</h1>
              <div className="inline-block">
                <span className="text-sm font-semibold mr-2">TAX INVOICE</span>
                <span className="text-xs text-gray-500 border border-gray-300 px-3 py-1 rounded">
                  ORIGINAL FOR RECIPIENT
                </span>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-1">BillMaster</h2>
              <p className="text-sm text-gray-600">Mobile: 6379068721</p>
            </div>

            {/* Invoice Details Bar */}
            <div className="bg-gray-100 border-t-4 border-black p-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-semibold">Invoice No.:</span>
                  <span className="ml-2">{invoiceData.invoiceNo || 'AABBCCDD/202'}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold">Invoice Date:</span>
                  <span className="ml-2">{new Date(invoiceData.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold">Due Date:</span>
                  <span className="ml-2">{new Date(invoiceData.dueDate).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-bold mb-2">BILL TO</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{invoiceData.account || 'Sample Party'}</p>
                  <p className="text-xs font-medium text-gray-500">Customer ID: {invoiceData.customerId || 'N/A'}</p>
                  <p>No F2, Outer Circle, Connaught Circus, New Delhi, DELHI, 110001</p>
                  <p>Mobile: 7400417400</p>
                  <p>GSTIN: 07ABCCH2702H4ZZ</p>
                  <p>Consultant: Consultant</p>
                </div>
              </div>
              <div>
                <div className="text-sm">
                  <p>{invoiceData.additionalInfo?.address || '1234123 324324234, Bengaluru,'}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-t-2 border-b-2 border-black">
                  <th className="text-left py-3 text-sm font-semibold">ITEMS</th>
                  <th className="text-right py-3 text-sm font-semibold">HSN</th>
                  <th className="text-right py-3 text-sm font-semibold">QTY.</th>
                  <th className="text-right py-3 text-sm font-semibold">RATE</th>
                  <th className="text-right py-3 text-sm font-semibold">TAX</th>
                  <th className="text-right py-3 text-sm font-semibold">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="border-b border-gray-200">
                      <td className="py-3">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description || 'product description'}</div>
                      </td>
                      <td className="text-right">{item.code || '1234'}</td>
                      <td className="text-right">{item.quantity} {item.unit || 'PCS'}</td>
                      <td className="text-right">{item.price.toLocaleString('en-IN')}</td>
                      <td className="text-right">
                        <div>{(item.price * item.quantity * item.tax / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div className="text-xs text-gray-500">({item.tax}%)</div>
                      </td>
                      <td className="text-right font-semibold">{item.total.toLocaleString('en-IN')}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Footer Section */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left Side - Notes and Terms */}
              <div className="space-y-6">
                <div className="border-t-2 border-black pt-4">
                  <h4 className="font-bold mb-2">SUBTOTAL</h4>
                  <div className="flex justify-between">
                    <span>-</span>
                    <span>₹ {totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="font-semibold">₹ {subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">NOTES</h4>
                  <p className="text-sm text-gray-700">{invoiceData.additionalInfo?.notes || 'Sample Note'}</p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">TERMS AND CONDITIONS</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Goods once sold will not be taken back or exchanged</li>
                    <li>All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only</li>
                  </ol>
                </div>
              </div>

              {/* Right Side - Calculations */}
              <div>
                <div className="border-t-2 border-black pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Taxable Amount</span>
                    <span className="font-semibold">₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST</span>
                    <span className="font-semibold">₹ {(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST</span>
                    <span className="font-semibold">₹ {(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-base">
                    <span>Total Amount</span>
                    <span>₹ {totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Received Amount</span>
                    <span className="font-semibold">₹ {receivedAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Balance</span>
                    <span>₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300 text-right">
                  <p className="font-bold mb-1">Total Amount (in words)</p>
                  <p className="text-sm">{numberToWords(totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;