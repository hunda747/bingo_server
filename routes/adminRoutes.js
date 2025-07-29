
routes/shopOwners.js
const express = require('express');
const adminController = require('../controllers/AdminController');
const { authenticateToken } = require('../middleware/authHandler');

const router = express.Router();

router.get('/', adminController.getAll);
router.get('/:id', adminController.getById);
router.post('/', adminController.create);
router.post('/login', adminController.login);
router.post('/changePassword/:id', adminController.changePassword);
router.post('/refresh', adminController.refreshToken);
router.put('/:id', adminController.update);
router.delete('/:id', adminController.delete);

module.exports = router;








// const express = require('express');
// const adminController = require('../controllers/admin_controller');
// const { authenticateToken } = require('../middleware/authHandler');

// const router = express.Router();

// router.post('/login', adminController.login);
// router.post('/refresh', authenticateToken, adminController.refreshToken);
// router.get('/', authenticateToken, adminController.getAll);
// router.get('/:id', authenticateToken, adminController.getById);
// router.post('/', authenticateToken, adminController.create);
// router.post('/changePassword/:id', authenticateToken, adminController.changePassword);
// router.put('/:id', authenticateToken, adminController.update);
// router.delete('/:id', authenticateToken, adminController.delete);

// module.exports = router;


