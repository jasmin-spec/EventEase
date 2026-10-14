const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const { sendBookingConfirmation } = require('../services/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    console.log("📝 Creating order for amount:", req.body.amount);
    console.log("👤 User ID:", req.user?.id);
    
    const options = {
      amount: req.body.amount * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    console.log("✅ Order created:", order.id);
    res.status(200).json(order);
  } catch (err) {
    console.log("❌ Order creation error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, amount, quantity, isVip } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const newBooking = new Booking({
        user: req.user.id,
        event: eventId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: amount,
        quantity: quantity || 1,
        isVip: isVip || false
      });
      await newBooking.save();
      await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: -(quantity || 1) } });

      // Fetch user and event details for email
      const user = await User.findById(req.user.id);
      const event = await Event.findById(eventId);

      // Send booking confirmation email
      try {
        await sendBookingConfirmation({
          userEmail: user.email,
          userName: user.fullName || user.name || 'User',
          eventName: event.title,
          eventDate: new Date(event.eventDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          eventLocation: event.location,
          ticketType: event.ticketType || 'General Admission',
          quantity: quantity || 1,
          amount: amount,
          orderId: razorpay_order_id,
          bookingId: newBooking._id.toString(),
        });
      } catch (emailError) {
        console.error('Email sending failed, but booking was successful:', emailError);
        // Don't fail the payment verification if email fails
      }

      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};