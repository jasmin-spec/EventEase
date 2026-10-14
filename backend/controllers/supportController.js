const Support = require("../models/supportModel");

// 1. Send Message (Public)
const sendSupportMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const newTicket = new Support({
      name,
      email,
      subject,
      message
    });

    await newTicket.save();
    res.status(201).json({ message: "Ticket submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get All Messages (Admin Protected)
const getAllSupport = async (req, res) => {
  try {
    // Sort by newest first
    const tickets = await Support.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { sendSupportMessage, getAllSupport };