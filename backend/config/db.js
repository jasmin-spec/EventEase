const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("connection success eventease");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); 
  }
};

module.exports = connectDB;