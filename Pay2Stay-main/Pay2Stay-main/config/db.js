const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pay2stay", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoATLAS Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoATLAS Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
