const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, saleController.getAllSales);
router.get('/:id', authMiddleware, saleController.getSaleById);
router.post('/', authMiddleware, saleController.createSale);

module.exports = router;
