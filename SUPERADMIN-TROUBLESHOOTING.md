# 🔧 SUPERADMIN AUTHENTICATION TROUBLESHOOTING GUIDE

## 🚨 Common Issues & Solutions

### Issue 1: "Authentication service error" on login

**Symptoms:**
- Superadmin login shows "Authentication service error"
- Error occurs when trying to authenticate

**Root Causes:**
1. `authenticate_superadmin` function doesn't exist
2. `superadmins` or `superadmin_sessions` tables don't exist
3. RLS policies blocking service role access
4. Default superadmin user not created

**Solution:**
1. Run `FIX-SUPERADMIN-AUTH.sql` in Supabase SQL Editor
2. Verify setup with `node verify-superadmin-db.js`
3. Check Supabase logs for detailed errors

---

### Issue 2: "Invalid username or password"

**Symptoms:**
- Login shows "Invalid username or password"
- Authentication function works but credentials rejected

**Root Causes:**
1. Wrong username/password
2. Superadmin user not active (`is_active = false`)
3. Password hash mismatch

**Solution:**
1. Verify credentials: `superadmin` / `superadmin123`
2. Check if user is active:
   ```sql
   SELECT username, is_active FROM superadmins WHERE username = 'superadmin';
   ```
3. Reset password if needed (see Password Reset section)

---

### Issue 3: "Session validation error"

**Symptoms:**
- Login works but dashboard access fails
- "Session validation error" in API calls

**Root Causes:**
1. `validate_superadmin_session` function doesn't exist
2. Session token not stored properly
3. Session expired

**Solution:**
1. Ensure `FIX-SUPERADMIN-AUTH.sql` was run completely
2. Check session table:
   ```sql
   SELECT * FROM superadmin_sessions ORDER BY created_at DESC LIMIT 5;
   ```
3. Clear expired sessions:
   ```sql
   DELETE FROM superadmin_sessions WHERE expires_at < NOW();
   ```

---

### Issue 4: Database connection errors

**Symptoms:**
- "Database connection failed" in verification script
- API calls fail with connection errors

**Root Causes:**
1. Wrong Supabase URL or service key
2. Network connectivity issues
3. Supabase project paused or deleted

**Solution:**
1. Check `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
2. Verify Supabase project is active
3. Test connection in Supabase dashboard

---

## 🔍 Diagnostic Steps

### Step 1: Run Verification Script

```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run verification
node verify-superadmin-db.js
```

This will check:
- ✅ Database connectivity
- ✅ Table existence
- ✅ Function existence
- ✅ Default user
- ✅ Authentication test

### Step 2: Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to Logs → Database
3. Look for errors related to:
   - `authenticate_superadmin`
   - `validate_superadmin_session`
   - `superadmins` table access

### Step 3: Manual Database Checks

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('superadmins', 'superadmin_sessions');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('authenticate_superadmin', 'validate_superadmin_session');

-- Check superadmin user
SELECT username, email, is_active, created_at, last_login 
FROM superadmins WHERE username = 'superadmin';

-- Test authentication manually
SELECT * FROM authenticate_superadmin('superadmin', 'superadmin123');
```

---

## 🔐 Password Management

### Reset Superadmin Password

```sql
-- Update password to 'newpassword123'
UPDATE superadmins 
SET password_hash = encode(digest('newpassword123', 'sha256'), 'hex')
WHERE username = 'superadmin';

-- Verify the update
SELECT username, password_hash FROM superadmins WHERE username = 'superadmin';
```

### Create New Superadmin User

```sql
-- Insert new superadmin
INSERT INTO superadmins (username, password_hash, email, full_name, is_active) VALUES
(
    'newadmin', 
    encode(digest('newpassword123', 'sha256'), 'hex'), 
    'newadmin@curaflow.com', 
    'New Administrator', 
    TRUE
);
```

---

## 🛠️ Environment Setup

### Required Environment Variables

Create `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Getting Supabase Credentials

1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Deployment Issues

### Production Environment

**Common Issues:**
1. Environment variables not set in production
2. RLS policies too restrictive
3. Service role key not configured

**Solution:**
1. Set environment variables in your deployment platform
2. Ensure service role has access to superadmin tables
3. Test with verification script in production

### Vercel Deployment

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

### Docker Deployment

```dockerfile
# Ensure environment variables are passed
ENV NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
```

---

## 📊 Monitoring & Maintenance

### Regular Maintenance Tasks

1. **Clean expired sessions:**
   ```sql
   DELETE FROM superadmin_sessions WHERE expires_at < NOW();
   ```

2. **Check active superadmins:**
   ```sql
   SELECT username, email, last_login, is_active 
   FROM superadmins ORDER BY last_login DESC;
   ```

3. **Monitor failed logins:**
   - Check Supabase logs for authentication failures
   - Set up alerts for repeated failed attempts

### Security Best Practices

1. **Change default password immediately**
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Regular password rotation**
4. **Monitor access logs**
5. **Use HTTPS in production**
6. **Enable 2FA** (when implemented)

---

## 🆘 Getting Help

### If Issues Persist

1. **Check Supabase Status:** https://status.supabase.com
2. **Review Supabase Documentation:** https://supabase.com/docs
3. **Check GitHub Issues:** Report bugs in the repository
4. **Community Support:** Supabase Discord/Forum

### Debug Information to Collect

When reporting issues, include:

1. **Error messages** (exact text)
2. **Verification script output**
3. **Supabase logs** (relevant errors)
4. **Environment** (development/production)
5. **Browser console errors**
6. **Network tab** (failed requests)

### Quick Recovery Commands

```bash
# Complete reset (use with caution)
# This will recreate everything from scratch
psql -h your-supabase-host -U postgres -d postgres -f FIX-SUPERADMIN-AUTH.sql

# Verify everything works
node verify-superadmin-db.js

# Test login
curl -X POST http://localhost:3000/api/superadmin/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}'
```

---

## ✅ Success Checklist

After fixing authentication, verify:

- [ ] `node verify-superadmin-db.js` shows all checks passed
- [ ] Can login at `/superadmin/dashboard` with `superadmin`/`superadmin123`
- [ ] Dashboard loads without errors
- [ ] Can create new clinics
- [ ] Can view system statistics
- [ ] Session persists across page refreshes
- [ ] Logout works properly

**🎉 If all items are checked, your superadmin system is working correctly!**
