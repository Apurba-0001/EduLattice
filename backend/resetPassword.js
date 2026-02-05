import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log("Usage: node resetPassword.js <email> <newPassword>");
      console.log(
        "Example: node resetPassword.js admin@email.com newpassword123",
      );
      process.exit(1);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password directly (bypassing the pre-save hook since we're using findOneAndUpdate)
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true },
    );

    if (user) {
      console.log(`✅ Password reset successfully for ${email}`);
      console.log("You can now login with the new password.");
    } else {
      console.log(`❌ User with email ${email} not found`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

resetPassword();
