const Booking = require("../models/Booking");
const Event = require("../models/eventModel");
const User = require("../models/userModel");
const { sendBookingConfirmation } = require("../services/emailService");

exports.createBooking = async (req, res) => {
  try {
    const { eventId, ticketType } = req.body;
    const booking = await Booking.create({
      event: eventId,
      user: req.user.id,
      ticketType,
    });

    // Fetch user and event details for email
    try {
      const user = await User.findById(req.user.id);
      const event = await Event.findById(eventId);

      if (user && event) {
        // Send booking confirmation email
        await sendBookingConfirmation({
          userEmail: user.email,
          userName: user.fullName || user.name || 'User',
          eventName: event.title,
          eventDate: new Date(event.eventDate || event.date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          eventLocation: event.location,
          ticketType: event.ticketType || ticketType || 'General Admission',
          quantity: 1,
          amount: event.price || 0,
          orderId: booking._id.toString(),
          bookingId: booking._id.toString(),
        }).catch(emailError => {
          console.error('Email sending failed:', emailError);
          // Don't fail the booking if email fails
        });
      }
    } catch (emailError) {
      console.error('Error preparing email:', emailError);
      // Don't fail the booking if email preparation fails
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'title location date eventDate coverImage price ticketType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Booking.countDocuments({ user: req.user.id });

    res.status(200).json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

exports.verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const organizerId = req.user.id;

    // Find the booking by ID
    const booking = await Booking.findById(ticketId)
      .populate('user')
      .populate('event');

    if (!booking) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Verify that the organizer owns this event
    if (booking.event.organizer.toString() !== organizerId) {
      return res.status(403).json({ message: "Unauthorized to verify this ticket" });
    }

    // Check if ticket status is valid
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: "Ticket is not confirmed" });
    }

    // Return booking details for validation
    res.json({
      booking: {
        _id: booking._id,
        guestName: booking.user.fullName || booking.user.name || 'Guest',
        eventName: booking.event.title,
        quantity: booking.quantity,
        isVip: booking.isVip,
        status: booking.status,
        amount: booking.amount,
        orderId: booking.orderId
      }
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};
