const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  coverImage: { type: String }, 
  
  totalTickets: { type: Number, required: true },

  availableTickets: { type: Number, required: true },
  
  isApproved: { type: Boolean, default: false },
  
  category: { 
    type: String, 
    required: true, 
    enum: ['Events', 'Plays', 'Sports','Music','Workshop','Activities'], 
    default: 'Events'
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);