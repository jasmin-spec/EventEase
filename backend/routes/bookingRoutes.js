const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { verifyTicket } = require("../controllers/bookingController");

const Booking = require("../models/Booking"); 

router.get('/my-bookings', auth, async (req, res) => {
  try {
    // Add pagination for better performance
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.user.id })
                                  .populate('event', 'title location date eventDate coverImage price ticketType')
                                  .sort({ createdAt: -1 })
                                  .skip(skip)
                                  .limit(limit)
                                  .lean(); 
                                  
    // Get total count for pagination info
    const total = await Booking.countDocuments({ user: req.user.id });
    
    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Verify ticket by ID (for organizer ticket validation)
router.get('/verify/:ticketId', auth, verifyTicket);

module.exports = router;