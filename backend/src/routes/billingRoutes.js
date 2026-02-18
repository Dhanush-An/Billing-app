const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, billingController.getAllPayroll);
router.post('/generate', authMiddleware, adminOnly, billingController.generatePayroll);
router.put('/:id', authMiddleware, adminOnly, billingController.updatePayroll);
router.get('/employee/:employeeId', authMiddleware, billingController.getEmployeePayroll);

module.exports = router;
