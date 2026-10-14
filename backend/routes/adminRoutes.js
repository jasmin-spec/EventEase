const express = require('express');
const router = express.Router();

const { auth } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

const {
  getAllUsers,
  getAllOrganizers,
  getPendingEvents,
  approveEvent,
  getApprovedEvents,
  unapproveEvent,
  getPaymentDetails,
} = require('../controllers/adminController');

// Get all users
router.get('/users', auth, roleCheck(['admin']), getAllUsers);

// Get all organizers
router.get('/organizers', auth, roleCheck(['admin']), getAllOrganizers);

// Get pending events
router.get('/events/pending', auth, roleCheck(['admin']), getPendingEvents);

// Get approved events
router.get('/events/approved', auth, roleCheck(['admin']), getApprovedEvents);

// Approve an event
router.put('/approve-event/:id', auth, roleCheck(['admin']), approveEvent);

// Unapprove an event
router.put('/unapprove-event/:id', auth, roleCheck(['admin']), unapproveEvent);

// Get payment and booking details
router.get('/bookings', auth, roleCheck(['admin']), getPaymentDetails);

module.exports = router;