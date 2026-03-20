import { body, validationResult, param } from "express-validator";

// Email validation
export const validateEmail = body("email")
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage("Invalid email format")
  .normalizeEmail();

// Password validation (8+ chars, complexity)
export const validatePassword = body("password")
  .trim()
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Must contain uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Must contain lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Must contain number");

// Resource title validation
export const validateTitle = body("title")
  .trim()
  .isLength({ min: 3, max: 200 })
  .withMessage("Title must be 3-200 characters")
  .escape();

// Resource description validation
export const validateDescription = body("description")
  .trim()
  .isLength({ min: 5, max: 5000 })
  .withMessage("Description must be 5-5000 characters")
  .escape();

// Subject validation
export const validateSubject = body("subject")
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage("Subject must be 2-100 characters")
  .matches(/^[a-zA-Z0-9\s\-]+$/)
  .withMessage("Subject can only contain letters, numbers, and hyphens");

// Semester validation (optional, for future use)
export const validateSemester = body("semester")
  .trim()
  .isLength({ min: 1, max: 50 })
  .withMessage("Semester must be 1-50 characters")
  .optional();

// MongoDB ObjectId validation
export const validateObjectId = param("id")
  .matches(/^[0-9a-fA-F]{24}$/)
  .withMessage("Invalid resource ID");

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.param,
        message: e.msg,
      })),
    });
  }
  next();
};
