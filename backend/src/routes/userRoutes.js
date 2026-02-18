const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminOnly, adminOrSelf } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, userController.getAllEmployees);
router.get('/:id', authMiddleware, userController.getEmployeeById);
router.post('/', authMiddleware, adminOnly, userController.createEmployee);
router.put('/:id', authMiddleware, adminOrSelf, userController.updateEmployee);
router.delete('/:id', authMiddleware, adminOnly, userController.deleteEmployee);

module.exports = router;
