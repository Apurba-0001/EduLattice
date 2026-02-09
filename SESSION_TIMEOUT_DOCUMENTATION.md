# Session Timeout Implementation

## Overview

EduLattice implements automatic session timeout after **20 minutes of inactivity**. The session timeout is enforced entirely on the **backend** with no frontend warning modal. Users will be silently logged out when inactive.

## How It Works

### Timeline

- **0-20 minutes:** User can interact normally
- **20 minutes:** Session automatically expires (backend JWT validation fails)
- **Next API Request:** User receives 401 Unauthorized and is logged out
- **Silent logout:** No warning modal displayed

### Architecture: Backend-Only Timeout

The timeout is enforced at the server level:

1. **Backend tracks last activity timestamp** for each authenticated session
2. **JWT token validation includes inactivity check:** If current time minus last activity > 20 minutes, token is invalid
3. **Frontend makes API request** → Backend validates token
4. **Token expired due to inactivity** → Backend returns 401 Unauthorized
5. **Frontend receives 401** → Automatic logout, redirect to login
6. **User sees login page** without warning

## Backend Implementation

### Session Timeout Logic

The backend authentication middleware should:

```javascript
// In your JWT verification middleware:
1. Extract JWT token from httpOnly cookie
2. Decode and verify token signature
3. Check if token has lastActivity field:
   - If (now - lastActivity) > 20 minutes:
     - Return 401 Unauthorized
   - Else:
     - Update lastActivity = now
     - Continue to route handler
```

### Database Schema Update

Add last activity tracking to User or Session model:

```javascript
// Example MongoDB schema update
const userSchema = {
  email: String,
  password: String,
  isAdmin: Boolean,
  lastActivity: Date, // NEW: Track when user was last active
  createdAt: Date,
  updatedAt: Date,
};
```

### JWT Token Structure

Token should include inactivity tracking:

```javascript
// Token payload
{
  userId: "123",
  email: "user@example.com",
  isAdmin: false,
  lastActivity: 1739194234000,  // Timestamp when token was issued/refreshed
  iat: 1739194234,              // Issued at
  exp: 1739280634               // 1 hour expiration
}
```

### Implementation Example

```javascript
// middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = Date.now();
    const lastActivity = decoded.lastActivity;
    const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes

    // Check if session has expired due to inactivity
    if (now - lastActivity > SESSION_TIMEOUT) {
      return res.status(401).json({
        message: "Session expired due to inactivity",
      });
    }

    // Update last activity for next request
    decoded.lastActivity = now;

    // Optionally issue new token with updated lastActivity
    // const newToken = jwt.sign(decoded, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.cookie('authToken', newToken, { httpOnly: true });

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

## Frontend Implementation

The frontend does not track or display session timeout. Instead:

### How Frontend Handles 401 Responses

When backend returns 401 Unauthorized for any reason (including session timeout):

1. API interceptor catches the 401 error in `frontend/src/utils/api.js`
2. Auto-logout is triggered (clears user data, redirects to /login)
3. User sees login page
4. No warning modal appears

### Frontend Changes Made

- ✅ Removed session timeout constants from AuthContext
- ✅ Removed frontend event listeners and timers
- ✅ Removed SessionWarning component
- ✅ Kept basic login/logout/register functions
- ✅ Backend 401 handling remains in place

## User Experience

### Scenario: Active User

1. User logs in → Backend issues JWT with lastActivity = now
2. User interacts with site → Makes API requests
3. Each API request → Backend updates lastActivity timestamp
4. Session continues indefinitely as long as user is active

### Scenario: Idle User

1. User logs in → Leaves site without activity
2. 20 minutes pass without any API requests
3. User returns and tries to interact
4. Next API request is made → Backend checks lastActivity
5. Backend rejects with 401 → Frontend auto-logs out
6. User redirected to login page silently
7. No warning was shown

## Security Benefits

1. **Protects Unattended Sessions**
   - Prevents unauthorized access to left-open browsers
   - Common security requirement in shared/public environments

2. **Reduces Token Theft Impact**
   - Even if JWT is compromised, it's only valid for 20 minutes
   - Server-side JWT still expires in 1 hour

3. **Server Resource Management**
   - Automatic logout reduces active sessions
   - Frees up server memory

4. **Compliance**
   - Meets security best practices for user data protection
   - Helpful for GDPR/privacy compliance

5. **Silent Logout**
   - No race condition between client timeout and server expiration
   - Server is source of truth for session validity

## Configuration

### Change Timeout Duration

Edit the backend authentication middleware to change timeout (example):

```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes instead of 20
```

Update in:

- `backend/middleware/auth.js` (or your authentication middleware)
- Environment variable: `SESSION_TIMEOUT=1800000` (milliseconds)

### Disable Session Timeout

Remove the inactivity check from your JWT verification middleware:

```javascript
// Comment out or remove this block:
// if (now - lastActivity > SESSION_TIMEOUT) {
//   return res.status(401).json({ message: "Session expired" });
// }
```

**Warning:** Disabling this removes the security feature.

## Testing

### Test Case 1: Active User Session

1. Authenticate user
2. Make API request immediately → Should succeed (200/2xx)
3. Make another request within 20 minutes → Should succeed
4. Verify lastActivity is updated on backend

### Test Case 2: Idle Session Timeout

1. Authenticate user
2. Wait 20+ minutes without making any API request
3. Make API request → Should fail with 401
4. Frontend should redirect to login
5. Check backend logs for "Session expired due to inactivity"

### Test Case 3: Token Validation

1. Manually edit JWT token to set `lastActivity` to 25 minutes ago
2. Send request with modified token
3. Backend should reject with 401
4. Frontend should handle gracefully

## Troubleshooting

### User gets logged out unexpectedly

- **Possible Cause:** SESSION_TIMEOUT value is too short
- **Fix:** Verify timeout duration in backend middleware

### Backend not tracking lastActivity

- **Possible Cause:** Middleware not updating lastActivity on each request
- **Fix:** Ensure your JWT verification middleware updates lastActivity timestamp

### User can stay logged in indefinitely

- **Possible Cause:** Inactivity check is disabled or commented out
- **Fix:** Verify the timeout validation code is active in auth middleware

### 401 errors aren't handled properly

- **Possible Cause:** API interceptor not catching 401 responses
- **Fix:** Check `frontend/src/utils/api.js` for proper error handling

## Monitoring

### Log Session Timeouts

Add logging to track when users are logged out due to inactivity:

```javascript
// In backend authentication middleware
if (now - lastActivity > SESSION_TIMEOUT) {
  console.log(`Session expired for user: ${decoded.userId}`);
  // Optional: Log to database/analytics
  return res.status(401).json({ message: "Session expired due to inactivity" });
}
```

## Future Enhancements

1. **Activity Tracking Logs**
   - Log when users timeout
   - Analytics on user session lengths

2. **Configurable Per-Role Timeout**
   - Different timeout for admins vs students
   - Longer sessions for teachers, shorter for students

3. **Remember Me Feature**
   - Allow users to opt-out of timeout
   - Extended session duration for trusted devices

4. **Session Dashboard**
   - Show users their remaining session time
   - Display last activity timestamp
   - Option to manually logout

5. **Token Refresh Endpoint**
   - Allow frontend to refresh token before expiration
   - Better UX for long operations (uploads, downloads)

## Implementation Checklist

- [ ] Backend: Add `lastActivity` field to user/session model
- [ ] Backend: Update JWT token generation to include `lastActivity`
- [ ] Backend: Add inactivity check to JWT verification middleware
- [ ] Backend: Update `lastActivity` on each authenticated request
- [ ] Backend: Test timeout behavior with 20+ minute wait
- [ ] Frontend: Verify 401 errors are handled by redirecting to login
- [ ] Frontend: Test that no warning modal appears
- [ ] Deploy: Update both backend and frontend together
- [ ] Verify: Test in production environment
- [ ] Monitor: Check logs for session timeout occurrences

---

**Session Timeout Status:** ✅ Backend-Only (No Frontend Modal)  
**Timeout Duration:** 20 minutes of inactivity  
**Implementation Type:** Silent logout via backend JWT validation  
**Updated:** February 10, 2026
