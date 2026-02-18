const { readData, writeData } = require('../utils/storage');

const FILE_NAME = 'products.json';

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await readData(FILE_NAME);
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const products = await readData(FILE_NAME);
        const product = products.find(p => p.id === parseInt(req.params.id));
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const products = await readData(FILE_NAME);
        const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

        const newProduct = {
            id: nextId,
            ...req.body,
            created_at: new Date().toISOString()
        };

        products.push(newProduct);
        await writeData(FILE_NAME, products);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const products = await readData(FILE_NAME);
        const index = products.findIndex(p => p.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        products[index] = {
            ...products[index],
            ...req.body,
            updated_at: new Date().toISOString()
        };

        await writeData(FILE_NAME, products);
        res.json(products[index]);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const products = await readData(FILE_NAME);
        const filteredProducts = products.filter(p => p.id !== parseInt(req.params.id));

        if (products.length === filteredProducts.length) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await writeData(FILE_NAME, filteredProducts);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
