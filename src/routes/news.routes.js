const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorization.middleware');

// Public: View News
router.get('/', newsController.getAllNews);

// User or Admin: Create, Update Status, Delete
router.post('/', verifyToken, authorize(['admin', 'user']), newsController.createNews);
router.put('/:id/status', verifyToken, authorize(['admin', 'user']), newsController.updateNewsStatus);
router.delete('/:id', verifyToken, authorize(['admin', 'user']), newsController.deleteNews);

module.exports = router;