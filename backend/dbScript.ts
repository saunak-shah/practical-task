import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "./models/User"; // Ensure this path points to your User model

// const hashedPassword = await bcrypt.hash(password, 10);

// const mongoURI = "mongodb://localhost:27017/your_database_name"; // Update with your database name

// Connect to MongoDB and insert data
const insertSampleData = async () => {
  try {
    await mongoose
      .connect(
        `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}`
      )
      .then(() => console.log("MongoDb connected"))
      .catch((err) => console.log("MongoDb connection error", err));

    let password = await bcrypt.hash("Admin@123", 10);
    console.log(password);
    // Sample user data
    const sampleUsers = [
      {
        fullName: "Admin User",
        emailID: "admin@gmail.com",
        phoneNumber: "1234567890",
        contryCode: "+91",
        password: password,
        active: false,
      },
    ];

    console.log(sampleUsers);

    // Insert sample data
    await User.insertMany(sampleUsers);
    console.log("Sample users inserted successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting sample data:", error);
    mongoose.connection.close();
  }
};

insertSampleData();
