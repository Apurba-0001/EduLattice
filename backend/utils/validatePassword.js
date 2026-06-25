const hasUppercase = (value) => /[A-Z]/.test(value);
const hasLowercase = (value) => /[a-z]/.test(value);
const hasDigit = (value) => /\d/.test(value);
const hasSpecial = (value) => /[@$!%*?&]/.test(value);

const containsSubstring = (value, candidate) => {
  if (!candidate) return false;
  return value.toLowerCase().includes(candidate.toLowerCase());
};

export const validatePassword = (password, email, displayName) => {
  if (typeof password !== "string") {
    return { valid: false, reason: "Password must be a string" };
  }

  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters" };
  }

  if (!hasUppercase(password)) {
    return {
      valid: false,
      reason: "Password must include an uppercase letter",
    };
  }

  if (!hasLowercase(password)) {
    return { valid: false, reason: "Password must include a lowercase letter" };
  }

  if (!hasDigit(password)) {
    return { valid: false, reason: "Password must include a digit" };
  }

  if (!hasSpecial(password)) {
    return {
      valid: false,
      reason: "Password must include a special character",
    };
  }

  const emailLocal = typeof email === "string" ? email.split("@")[0] : "";
  if (emailLocal && containsSubstring(password, emailLocal)) {
    return {
      valid: false,
      reason: "Password must not contain your email name",
    };
  }

  if (displayName && containsSubstring(password, displayName)) {
    return {
      valid: false,
      reason: "Password must not contain your display name",
    };
  }

  return { valid: true, reason: "" };
};
