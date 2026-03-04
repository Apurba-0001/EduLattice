import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Support both SRV and standard connection strings
    let mongoUri = process.env.MONGODB_URI;

    // If SRV connection fails (common on Windows), fall back to direct connection
    const mongoOptions = {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    };

    try {
      const conn = await mongoose.connect(mongoUri, {
        ...mongoOptions,
        family: 4,
      });
      console.log("✅ MongoDB Connected");
    } catch (srvError) {
      // If SRV fails, try converting to standard format (bypass DNS issues)
      if (mongoUri.includes("+srv")) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "⚠️  SRV connection failed, trying standard connection...",
          );
        }

        // Remove +srv and add default ports
        const standardUri = mongoUri
          .replace("+srv://", "://")
          .replace(/\.mongodb\.net/, ".mongodb.net:27017");

        const conn = await mongoose.connect(standardUri, {
          ...mongoOptions,
          family: 4,
          ssl: true,
          authSource: "admin",
        });
        console.log("✅ MongoDB Connected (Standard)");
      } else {
        throw srvError;
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`❌ MongoDB Error: ${error.message}`);
      console.error("Please check your MONGODB_URI in .env file");
    } else {
      console.error("❌ MongoDB connection failed");
    }
    process.exit(1);
  }
};

export default connectDB;
