const { readData, writeData } = require('../utils/storage');

const CUSTOMERS_FILE = 'customers.json';
const SUPPLIERS_FILE = 'suppliers.json';

// Customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await readData(CUSTOMERS_FILE);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customers = await readData(CUSTOMERS_FILE);
        const newCustomer = {
            id: Date.now(),
            customerId: customers.length > 0 ? Math.max(...customers.map(c => c.customerId || 0)) + 1 : 1,
            ...req.body
        };
        customers.push(newCustomer);
        await writeData(CUSTOMERS_FILE, customers);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customers = await readData(CUSTOMERS_FILE);
        const index = customers.findIndex(c => c.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Customer not found' });

        customers[index] = { ...customers[index], ...req.body };
        await writeData(CUSTOMERS_FILE, customers);
        res.json(customers[index]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customers = await readData(CUSTOMERS_FILE);
        const filtered = customers.filter(c => c.id !== parseInt(req.params.id));
        await writeData(CUSTOMERS_FILE, filtered);
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await readData(SUPPLIERS_FILE);
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const suppliers = await readData(SUPPLIERS_FILE);
        const newSupplier = { id: Date.now(), ...req.body };
        suppliers.push(newSupplier);
        await writeData(SUPPLIERS_FILE, suppliers);
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const suppliers = await readData(SUPPLIERS_FILE);
        const index = suppliers.findIndex(s => s.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ message: 'Supplier not found' });

        suppliers[index] = { ...suppliers[index], ...req.body };
        await writeData(SUPPLIERS_FILE, suppliers);
        res.json(suppliers[index]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const suppliers = await readData(SUPPLIERS_FILE);
        const filtered = suppliers.filter(s => s.id !== parseInt(req.params.id));
        await writeData(SUPPLIERS_FILE, filtered);
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
