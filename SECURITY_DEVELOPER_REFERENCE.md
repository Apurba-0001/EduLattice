# Security Changes - Quick Reference for Developers

## Authentication Changes Summary

### What Changed

The JWT token is now stored in a **secure httpOnly cookie** instead of localStorage.

### Why This Matters

- **Before:** Token in localStorage → JavaScript can access it → XSS can steal it
- **After:** Token in httpOnly cookie → Browser-only storage → XSS cannot access it
- **Result:** Much more secure authentication

## Quick Code Changes You Need to Know

### Backend

#### 1. Auth Middleware (middleware/auth.js)

```js
// OLD: Read from Authorization header
const token = req.headers.authorization.split(" ")[1];

// NEW: Read from httpOnly cookie (primary), headers (fallback)
let token;
if (req.cookies && req.cookies.authToken) {
  token = req.cookies.authToken;
} else if (req.headers.authorization?.startsWith("Bearer")) {
  token = req.headers.authorization.split(" ")[1];
}
```

#### 2. Login/Register (controllers/authController.js)

```js
// OLD: Return token in response
res.json({ token, user: {...} });

// NEW: Set httpOnly cookie, return no token
res.cookie("authToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 3600000 // 1 hour
});
res.json({ user: {...} });
```

#### 3. Error Logging (ALL controllers)

```js
// OLD: Always log errors
console.error("Error:", error);

// NEW: Only log in development
if (process.env.NODE_ENV === "development") {
  console.error("Error:", error);
}
```

#### 4. Query Validation (controllers/resourceController.js)

```js
// OLD: Trust user input
const page = parseInt(page);
const limit = parseInt(limit);

// NEW: Validate and constrain
const page = Math.max(1, parseInt(page) || 1);
const limit = Math.min(100, Math.max(1, parseInt(limit) || 10));

// OLD: Dangerous regex with user input
const query = { keyword: { $regex: keyword, $options: "i" } };

// NEW: Escape regex special characters
const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const query = { keyword: { $regex: escaped, $options: "i" } };
```

### Frontend

#### 1. API Requests (utils/api.js)

```js
// OLD: Manually add token to header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// NEW: Browser sends cookie automatically
const api = axios.create({
  withCredentials: true, // This is all you need!
});
```

#### 2. Auth Context (context/AuthContext.jsx)

```js
// OLD: Extract and store token
const { token, ...userData } = response.data.data;
localStorage.setItem("token", token);

// NEW: Only store user data, token is in cookie
localStorage.setItem("user", response.data.data);

// OLD: Manual logout
const logout = () => {
  localStorage.removeItem("token");
};

// NEW: Call backend to clear cookie
const logout = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("user");
};
```

## New Dependencies

Added to `package.json`:

```json
{
  "helmet": "^7.1.0", // Security headers
  "express-rate-limit": "^7.1.0", // Rate limiting
  "cookie-parser": "^1.4.6", // Cookie parsing
  "express-mongo-sanitize": "^2.2.0", // NoSQL injection prevention
  "csurf": "^1.11.0", // CSRF token support
  "file-type": "^18.5.0", // File validation
  "express-validator": "^7.0.1" // Input validation
}
```

## Middleware Stack (server.js)

Old order:

1. CORS
2. JSON parser
3. Routes

New order:

1. Helmet (security headers)
2. CORS (with credentials)
3. Mongo sanitization (NoSQL injection prevention)
4. Cookie parser (httpOnly cookie support)
5. JSON parser (10MB limit)
6. Routes

## Password Requirements Change

### Old

- Minimum 6 characters
- No complexity requirements

### New

- Minimum 12 characters
- Must have: UPPERCASE
- Must have: lowercase
- Must have: numbers
- Must have: special character (@$!%\*?&)

**Example valid passwords:**

- `SecurePass123!`
- `MyApp@2024`
- `Welcome#123abc`

**Example invalid passwords:**

- `password123` (no uppercase or special char)
- `Pass@99` (too short)
- `PASSWORD123!` (no lowercase)

## Rate Limiting

Applied to:

- `/auth/register` - 5 attempts per 15 minutes
- `/auth/login` - 5 attempts per 15 minutes

Returns `429 Too Many Requests` when exceeded.

## JWT Token Expiration

Changed from 30 days → 1 hour

**Why?** Even if someone steals a token, it's only valid for 1 hour.

**What about users staying logged in?**

- Option 1: Ask them to login again (simple)
- Option 2: Implement refresh tokens (more complex, better UX)

## Error Messages in Production

### Old

```
Error: Cannot connect to MongoDB: connection timeout
Error: API key invalid for Cloudinary
```

### New

```
Server error
```

**Why?** Prevents attackers from learning about your infrastructure.

## Sensitive Data Not Logged in Production

### No longer logged:

- API keys and secrets
- User passwords or email addresses
- File paths and URLs
- Database connection strings
- Cloudinary operation details
- Authorization check results

### Still logged:

- Generic error messages ("User not found", "Invalid credentials")
- Request counts and performance metrics

**To see full logs:** Set `NODE_ENV=development`

## Testing Checklist for Developers

When adding new endpoints, verify:

1. ✅ Sensitive data not in error messages
2. ✅ All console.error/log wrapped in NODE_ENV check
3. ✅ Query parameters validated (no negative, no huge numbers)
4. ✅ Regex input escaped
5. ✅ Protected routes use middleware: `protect`
6. ✅ Admin routes use: `protect, adminOnly`
7. ✅ File uploads validate input

## Common Development Tasks

### Testing Rate Limiting Locally

```js
// Simulate limit by calling endpoint 6+ times quickly
fetch('/api/auth/login', { method: 'POST', ... })
// After 5 attempts: 429 Too Many Requests
```

### Testing Password Validation

```js
// Weak password (fails)
POST /api/auth/register
{ "password": "weak123" }
// Response: "must contain uppercase, lowercase, number, special char"

// Strong password (succeeds)
POST /api/auth/register
{ "password": "Strong@123" }
// Response: Success
```

### Testing httpOnly Cookie

```js
// In browser DevTools
// Application > Cookies > see authToken marked HttpOnly=✓

// In console, try to access:
document.cookie;
// Result: Empty (because httpOnly blocks JavaScript access)
```

### Adding New Query Parameters

```js
// ✅ DO THIS: Validate input
const page = Math.max(1, parseInt(req.query.page) || 1);
const limit = Math.min(100, parseInt(req.query.limit) || 10);

// ❌ DON'T DO THIS: Trust user input
const page = req.query.page;
const limit = req.query.limit;
```

### Adding New Search/Filter

```js
// ✅ DO THIS: Escape regex special characters
const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const query = { title: { $regex: term, $options: "i" } };

// ❌ DON'T DO THIS: Use unsanitized input
const query = { title: { $regex: req.query.search, $options: "i" } };
```

## Migration Notes for Future Features

### If Adding Refresh Tokens

```js
// 1. Generate refresh token with longer expiration (7 days)
// 2. Store in database linked to user
// 3. Create /auth/refresh endpoint
// 4. Frontend calls refresh before access token expires
```

### If Adding File Uploads

```js
// Use file-type package to validate actual content
const FileType = require("file-type");
const type = await FileType.fromBuffer(fileBuffer);
// Validate type matches allowed MIME types
```

### If Adding Audit Logging

```js
// Log to separate audit collection
await AuditLog.create({
  action: "user.login",
  userId: user._id,
  ip: req.ip,
  timestamp: new Date(),
  success: true,
});
```

## Debugging Secured Code

### To see full errors in production:

```bash
# Temporarily set development mode
NODE_ENV=development npm start
# Logs now show full error details
```

### To test security headers:

```bash
# Check headers are present
curl -I https://your-api.com/api/auth/me
# Look for: X-Frame-Options, Content-Security-Policy, etc.
```

### To verify httpOnly cookies are working:

```bash
# 1. Login in browser
# 2. Open DevTools > Application > Cookies
# 3. Find authToken
# 4. Should show: HttpOnly ✓, Secure ✓
# 5. In Console, type: document.cookie
# 6. Should show: empty (because httpOnly blocks JS)
```

## API Breaking Changes

### For Frontend

**Old request:**

```js
// No longer works
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { Authorization: `Bearer ${localStorage.token}` },
});
```

**New request:**

```js
// Use this instead
const response = await fetch("/api/auth/login", {
  method: "POST",
  credentials: "include", // Browser sends httpOnly cookie
});
```

### For Mobile/Standalone Apps

If you're building a mobile app or standalone client:

1. You CAN still use Bearer tokens via Authorization header
2. Backend middleware supports both (cookie primary, header fallback)
3. For httpOnly cookies, you must use `withCredentials: true` in axios

## Quick Decisions Reference

### "Should I log this?"

```
NO:  API keys, tokens, passwords, user IDs, emails, file paths
YES: "User not found", "Login success", "File deleted"

Or use:
if (process.env.NODE_ENV === "development") {
  console.log(detailedInfo);
}
```

### "How to validate query parameter?"

```
const value = Math.max(minValue, Math.min(maxValue, parseInt(param) || default));
```

### "How to prevent NoSQL injection in search?"

```
const escaped = userInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
```

### "Can users access the token?"

```
NO - it's in httpOnly cookie, JS cannot access it
YES - Bearer token method still works if needed
```

---

## Questions?

1. **How does httpOnly cookie auth work?**
   - Browser auto-sends httpOnly cookies with every request
   - No manual header injection needed
   - Much safer than localStorage

2. **Will old users' tokens stop working?**
   - Yes, they need to login again (tokens now expire in 1 hour instead of 30 days)
   - They'll be redirected to login automatically (401 response)

3. **Do I need to change my frontend requests?**
   - No if using axios with `withCredentials: true`
   - Yes if manually managing Authorization header (use credentials: 'include')

4. **What if someone has an old token in localStorage?**
   - They can still use it via Authorization header until it actually expires
   - After 1 hour: automatic logout and redirect to login

5. **How do I add more protected routes?**

   ```js
   router.get("/some-endpoint", protect, handler);
   router.delete("/admin-only", protect, adminOnly, handler);
   ```

6. **Can I disable logging in production?**
   - It's already disabled! All logs wrapped in NODE_ENV check
   - Set NODE_ENV=production (default on Render)

---

**Last Updated:** After comprehensive security hardening  
**Status:** Ready for production deployment  
**Review:** Check SECURITY_IMPLEMENTATION_SUMMARY.md for full details
