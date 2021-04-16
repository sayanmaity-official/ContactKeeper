const mongoose = require("mongoose");
const config = require("config");
require("dotenv").config();

const db = `mongodb+srv://${process.env.MongoDBUser}:${process.env.MongoDBPass}@contactkeeper.esqj1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
