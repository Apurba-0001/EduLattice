import mongoose from "mongoose";

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const cloneRegex = (pattern) =>
  pattern instanceof RegExp
    ? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""))
    : pattern;

export const validate = (schema = {}) => {
  return (req, res, next) => {
    const details = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      const isStringValue = typeof value === "string";
      const isArrayValue = Array.isArray(value);

      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        details.push({ field, message: "Field is required" });
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      if (rules.type === "string" && !isStringValue) {
        details.push({ field, message: "Must be a string" });
        continue;
      }

      if (rules.type === "array" && !isArrayValue) {
        details.push({ field, message: "Must be an array" });
        continue;
      }

      if (rules.type === "number" && typeof value !== "number") {
        details.push({ field, message: "Must be a number" });
        continue;
      }

      if (rules.type === "boolean" && typeof value !== "boolean") {
        details.push({ field, message: "Must be a boolean" });
        continue;
      }

      if (rules.minLength && isStringValue && value.length < rules.minLength) {
        details.push({
          field,
          message: `Minimum length is ${rules.minLength}`,
        });
      }

      if (rules.maxLength && isStringValue && value.length > rules.maxLength) {
        details.push({
          field,
          message: `Maximum length is ${rules.maxLength}`,
        });
      }

      if (
        rules.pattern &&
        isStringValue &&
        !cloneRegex(rules.pattern).test(value)
      ) {
        details.push({ field, message: "Invalid format" });
      }

      if (rules.enum && !rules.enum.includes(value)) {
        details.push({ field, message: "Invalid value" });
      }

      if (rules.maxItems && isArrayValue && value.length > rules.maxItems) {
        details.push({ field, message: `Maximum items is ${rules.maxItems}` });
      }

      if (rules.itemsMaxLength && isArrayValue) {
        const hasTooLongItem = value.some(
          (item) =>
            typeof item === "string" && item.length > rules.itemsMaxLength,
        );
        if (hasTooLongItem) {
          details.push({ field, message: "One or more items are too long" });
        }
      }
    }

    if (details.length > 0) {
      return res.status(400).json({ error: "Validation failed", details });
    }

    return next();
  };
};

export const validateIdParam = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    const isValid = mongoose.Types.ObjectId.isValid(value) || isUuid(value);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid identifier" });
    }

    return next();
  };
};
