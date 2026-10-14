const User = require('../models/userModel'); // Assuming you have a User model
const Event = require('../models/eventModel');
const Booking = require('../models/Booking');

// Get All Users (excluding admins)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Organizers
exports.getAllOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' }).select('-password');
    res.json(organizers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Pending Events
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: false }).populate('organizer', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve Event
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ message: "Event Approved", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Approved Events
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: true }).populate('organizer', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unapprove Event
exports.unapproveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
    res.json({ message: "Event Unapproved", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get payment details for the admin dashboard
exports.getPaymentDetails = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title location')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching payment details:', error);

    res.status(500).json({
      message: 'Failed to fetch payment details',
    });
  }
};