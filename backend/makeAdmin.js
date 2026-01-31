import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find user by email and make them admin
    const email = process.argv[2] || "apurba@email.com";
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true },
    );

    if (user) {
      console.log(`✅ User ${email} is now an admin!`);
      console.log("User details:", {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      console.log(`❌ User with email ${email} not found`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

makeAdmin();
