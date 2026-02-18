const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Customers
router.get('/customers', authMiddleware, customerController.getAllCustomers);
router.post('/customers', authMiddleware, customerController.createCustomer);
router.put('/customers/:id', authMiddleware, customerController.updateCustomer);
router.delete('/customers/:id', authMiddleware, customerController.deleteCustomer);

// Suppliers
router.get('/suppliers', authMiddleware, customerController.getAllSuppliers);
router.post('/suppliers', authMiddleware, customerController.createSupplier);
router.put('/suppliers/:id', authMiddleware, customerController.updateSupplier);
router.delete('/suppliers/:id', authMiddleware, customerController.deleteSupplier);

module.exports = router;
