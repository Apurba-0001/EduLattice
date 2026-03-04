import mongoose from "mongoose";

/**
 * Middleware to validate that req.params.id is a valid MongoDB ObjectId.
 * Prevents CastError leaks and blocks malformed / injection-crafted IDs
 * before they ever reach the database layer.
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID",
    });
  }
  next();
};

export default validateObjectId;
