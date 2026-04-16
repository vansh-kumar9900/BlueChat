const mongoose = require("mongoose");

async function connectDB(mongoUri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

module.exports = { connectDB };

