const express = require('express');
const router = express.Router();
const { sendSupportMessage, getAllSupport } = require('../controllers/supportController');
const { auth } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

// POST /api/support - Submit a new ticket
router.post('/', sendSupportMessage);

// GET /api/support - View all tickets (Admin only)
router.get('/', auth, roleCheck(['admin']), getAllSupport);

module.exports = router;