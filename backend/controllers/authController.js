import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT Token — 1 hour expiry with lastActivity for inactivity tracking
const generateToken = (id) => {
  return jwt.sign({ id, lastActivity: Date.now() }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // SECURITY: Never accept isAdmin from client input — roles are assigned server-side only
    const { name, email, password } = req.body;

    // SECURITY: Ensure all inputs are strings (blocks NoSQL operator injection)
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input types",
      });
    }

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Input length limits to prevent oversized payloads reaching the DB
    if (name.length > 50 || email.length > 100 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed maximum allowed length",
      });
    }

    // Check if user already exists
    // NOTE: We acknowledge this reveals email existence — acceptable for this platform's UX
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists. Please login or use a different email.",
      });
    }

    // Create user — isAdmin is always false on self-registration (server-controlled)
    const user = await User.create({
      name,
      email,
      password,
      lastActivity: new Date(),
      isAdmin: false,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Registration error:", error.message);
    }
    // SECURITY: Never expose internal error.message in production
    res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again.",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // SECURITY: Ensure inputs are strings (blocks NoSQL operator injection)
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input types",
      });
    }

    // Input size limits — prevent oversized payloads reaching bcrypt/DB
    if (email.length > 100 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last activity on successful login
    user.lastActivity = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      message: "Login successful",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email isAdmin createdAt",
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting admin users
    if (userToDelete.isAdmin === true) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Delete user error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Logout user (stateless — client clears token)
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
