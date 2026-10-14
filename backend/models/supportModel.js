const mongoose = require("mongoose");

const supportSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "open" }, // open, closed
}, { timestamps: true });

module.exports = mongoose.model("Support", supportSchema);