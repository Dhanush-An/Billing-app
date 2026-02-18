const { readData, writeData } = require('../utils/storage');

const SALES_FILE = 'sales.json';
const PRODUCTS_FILE = 'products.json';

// Get all sales
exports.getAllSales = async (req, res) => {
    try {
        const sales = await readData(SALES_FILE);
        res.json(sales.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create sale (and update stock)
exports.createSale = async (req, res) => {
    try {
        const sales = await readData(SALES_FILE);
        const products = await readData(PRODUCTS_FILE);

        const newSale = {
            id: sales.length > 0 ? Math.max(...sales.map(s => s.id || 0)) + 1 : 1,
            ...req.body,
            date: req.body.date || new Date().toISOString()
        };

        // Update Stock
        newSale.items.forEach(saleItem => {
            const productIndex = products.findIndex(p => p.id === saleItem.id);
            if (productIndex !== -1) {
                products[productIndex].stock -= saleItem.quantity;
                if (products[productIndex].stock < 0) products[productIndex].stock = 0;
            }
        });

        sales.push(newSale);

        await writeData(SALES_FILE, sales);
        await writeData(PRODUCTS_FILE, products);

        res.status(201).json(newSale);
    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get sale by ID
exports.getSaleById = async (req, res) => {
    try {
        const sales = await readData(SALES_FILE);
        const sale = sales.find(s => s.id === parseInt(req.params.id));
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.json(sale);
    } catch (error) {
        console.error('Get sale error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
