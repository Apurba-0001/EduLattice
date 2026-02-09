# Security Fixes Deployment Guide

## Quick Start - Step by Step

### Step 1: Backend Dependencies Update

```bash
cd backend
npm install
```

**New packages installed:**

- `helmet` - Security headers middleware
- `express-rate-limit` - Rate limiting for brute force protection
- `csurf` - CSRF token support
- `express-mongo-sanitize` - NoSQL injection prevention
- `file-type` - Deep file type validation
- `express-validator` - Input validation helpers
- `cookie-parser` - Cookie parsing and management

### Step 2: Review Environment Variables

Check your `.env` file contains:

```
NODE_ENV=production          # Must be "production" in production
JWT_SECRET=your-secret-key   # Keep this secret!
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MONGODB_URI=...
FRONTEND_URL=https://your-frontend.render.com
```

### Step 3: Test Locally (Development)

Test all security fixes locally before deploying:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### Test Cases:

**1. Weak Password Test**

- Try registering with password "test123" (too short/weak)
- Should fail with message about complexity requirements
- Must have: 12+ chars, uppercase, lowercase, number, special char

**2. Rate Limiting Test**

- Try logging in 6 times with wrong password quickly
- Should block requests after 5 attempts for 15 minutes

**3. Token Expiration Test**

- Register and login
- Wait 1+ hour (or modify JWT_SECRET and restart for testing)
- Should redirect to login when token expires

**4. XSS Prevention Test**

- Open DevTools > Application > Cookies
- Should see `authToken` marked as `HttpOnly` and `Secure`
- Cannot access token via JavaScript (console.log(document.cookie) should be empty)

**5. Search Injection Test**

- Try searching with regex characters: `.* + ? $ { } | [ ] \`
- Should return normal results or 0 results (not error)

**6. Pagination Test**

- Test URLs: `/api/resources?page=-1&limit=999999`
- Should default to page 1 and maximum 100 items

### Step 4: Backend Deployment to Render

#### Update Render Settings:

1. **Go to your backend service on Render**
2. **Environment Variables:**
   - Ensure `NODE_ENV=production` is set
   - Other secrets already configured

3. **Redeploy:**

   ```bash
   git push origin main  # Trigger auto-deploy
   ```

   OR manually redeploy through Render dashboard

4. **Verify Deployment:**
   - Service should show "Live ✓"
   - Check logs for any errors

### Step 5: Frontend Deployment to Render

No code changes needed if using relative API paths. The frontend will automatically:

- Use the correct backend URL
- Send cookies with requests
- Handle httpOnly cookies properly

**To redeploy:**

```bash
git push origin main  # Trigger auto-deploy
```

### Step 6: Post-Deployment Verification

**1. Test Login Flow**

```bash
# From browser, go to: https://your-app.render.com/login

# Register new account
- Email: test@example.com
- Password: SecurePass123!  (valid)
- Should succeed

# Try weak password
- Password: weak123  (invalid)
- Should fail
```

**2. Test Rate Limiting**

```bash
# Try logging in 6+ times with wrong password
# After 5 attempts, should get 429 error
```

**3. Verify Cookies in Production**

```bash
# In browser DevTools > Application > Cookies
# Should see:
# - authToken (HttpOnly ✓, Secure ✓, SameSite=Strict ✓)
# - No sensitive data visible in console
```

**4. Monitor Logs**

```bash
# In Render dashboard > Logs
# Should see no sensitive data (API keys, passwords, tokens)
# In dev mode: detailed logs appear
# In production mode: only critical errors logged
```

## Troubleshooting

### Issue: "Cookie not being sent with requests"

**Solution:**

- Frontend must use `withCredentials: true` in axios
- Check CORS configuration allows credentials
- Set `SameSite=Lax` temporarily for testing (change to Strict in production)

### Issue: "Users can't login after deployment"

**Solution:**

- Clear browser cookies
- Clear localStorage
- Hard refresh (Ctrl+Shift+R)
- Check backend logs for JWT/auth errors

### Issue: "Getting 429 Too Many Requests"

**Cause:** Rate limiting activated
**Solution:**

- Wait 15 minutes OR
- Clear browser data and retry OR
- Test from different device/IP

### Issue: "Cloudinary errors not showing"

**Expected Behavior:** In production, errors are hidden for security
**Solution:**

- Set `NODE_ENV=development` temporarily to see details
- Check Render logs for actual error
- Don't expose error details to users

### Issue: "Cannot read property 'authToken' of undefined"

**Cause:** Cookie parser not working
**Solution:**

- Verify `cookie-parser` is installed: `npm list cookie-parser`
- Verify middleware is loaded in server.js
- Restart backend service

## Security Headers Verification

To verify security headers are being sent, use:

```bash
# Terminal
curl -I https://your-api.render.com/api/auth/me

# Should see headers like:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
# Strict-Transport-Security: ...
```

Or in browser DevTools > Network > Click any request:

- Check Response Headers for the security headers above

## Rollback Plan

If issues occur after deployment:

### Quick Rollback

1. Git revert the security commits
2. Deploy again using `git push`
3. Verify old version is live

### Issue Investigation

1. Check logs in Render dashboard
2. Look for error messages in console
3. Verify environment variables are correct
4. Check database connection status

### Contact Support

- Check Render status page
- Review MongoDB Atlas status
- Check Cloudinary status

## Monitoring & Maintenance

### Weekly Checks

```bash
# Check for new npm vulnerabilities
npm audit

# Check for updates
npm outdated
```

### Monthly Security Audits

- Review error logs for SQL/NoSQL injection attempts
- Check login patterns for brute force attempts
- Verify no sensitive data in logs
- Update dependencies if critical fixes released

### Rate Limiting Metrics

If implementing monitoring, track:

- Failed login attempts
- Rate limit hits per IP
- API error rates
- Response times

## Key Security Points to Remember

1. **Never commit `.env` or secrets to Git**
2. **Always use `NODE_ENV=production` in production**
3. **Keep dependencies updated**: `npm audit fix`
4. **Monitor logs for sensitive data exposure**
5. **Test authentication flow after deployment**
6. **Use HTTPS only in production** (Render handles this)
7. **Clear user data on logout** (backend now does this)
8. **Rate limiting helps prevent brute force** (5 attempts/15min)
9. **Short JWT expiration is more secure** (1 hour vs 30 days)
10. **httpOnly cookies prevent XSS token theft** (most important!)

## Success Checklist

After deployment, verify:

- [ ] User can register with strong password
- [ ] User can login successfully
- [ ] Rate limiting blocks after 5 failed attempts
- [ ] Logout clears authToken cookie
- [ ] authToken marked as HttpOnly in DevTools
- [ ] No sensitive data in browser console
- [ ] No sensitive data in server logs
- [ ] Search works with special characters
- [ ] Pagination validates input correctly
- [ ] Security headers present in responses
- [ ] No errors in Render logs

## Next: Add Refresh Tokens (Optional Enhancement)

For users to stay logged in longer without passwords:

1. Create `refreshToken` endpoint that validates and returns new access token
2. Store `refreshToken` in database with expiration
3. When access token expires (401), automatically refresh it
4. Users won't notice token renewal

See SECURITY_IMPLEMENTATION_SUMMARY.md for implementation details.

---

**Questions? Issues?** Check the SECURITY_IMPLEMENTATION_SUMMARY.md for detailed technical documentation.
