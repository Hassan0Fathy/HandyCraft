# HandyCraft: Quick Deployment Guide

**Time to Deploy**: ~45 minutes | **Difficulty**: Easy | **Risk**: Low

---

## ⚡ Quick Start (5 Steps)

### Step 1: Prepare Environment Variables (5 min)

Create a `.env` file in `backend/` with these values:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/handycraft?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
API_BASE_URL=https://your-backend-url.onrender.com/api
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET=YourLongRandomSecretKeyHere1234567890
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

**⚠️ Critical Changes:**
- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Change `JWT_SECRET` to random string
- [ ] Update `API_BASE_URL` to your Render domain
- [ ] Update `ALLOWED_ORIGINS` to your Vercel domain
- [ ] Add actual MongoDB URI
- [ ] Add actual Cloudinary credentials

### Step 2: Deploy Backend to Render (20 min)

```bash
# 1. Push code to GitHub
git add backend/
git commit -m "Production deploy - security hardened"
git push

# 2. Go to https://render.com
# 3. Click "New +" → "Web Service"
# 4. Connect GitHub repository
# 5. Configure:
#    - Name: handycraft-backend
#    - Runtime: Node
#    - Build command: npm install
#    - Start command: npm start
#    - Environment: Add all variables from .env

# 6. Click Deploy
# 7. Wait for build (typically 3-5 min)
# 8. Copy the URL (e.g., https://handycraft-backend.onrender.com)
```

### Step 3: Deploy Frontend to Vercel (10 min)

```bash
# Option A: If using GitHub
# 1. Go to https://vercel.com
# 2. Click "Add New" → "Project"
# 3. Select GitHub repository
# 4. Deploy

# Option B: If using Vercel CLI
npm install -g vercel
vercel --prod
```

**Note**: Frontend loads API URL from `/api/config`, so it will automatically use your Render URL.

### Step 4: Test Production (5 min)

```bash
# Test 1: Admin Login
# Go to: https://your-frontend.vercel.app/admin-login.html
# Login with ADMIN_PASSWORD you set

# Test 2: Create Order
# Go to: https://your-frontend.vercel.app/payment.html
# Try creating an order (should validate)

# Test 3: Admin Dashboard
# Should see orders list

# Test 4: Logout
# Click logout, should redirect to login
```

### Step 5: Post-Deployment Checks (5 min)

```bash
# Check 1: Verify rate limiting
for i in {1..60}; do curl https://your-backend/api/config; done
# Should return 429 error after ~50 requests

# Check 2: Verify security headers
curl -i https://your-backend/api/orders 2>/dev/null | grep -i "x-"
# Should show security headers

# Check 3: Test protected endpoint without token
curl https://your-backend/api/orders
# Should return 401 Unauthorized

# Check 4: Test with valid token
TOKEN=$(curl -X POST https://your-backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_ADMIN_PASSWORD"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" https://your-backend/api/orders
# Should return orders list
```

---

## 📋 Pre-Launch Checklist (2 min)

Before clicking "Deploy", verify:

- [ ] `.env` has all values (no defaults)
- [ ] `ADMIN_PASSWORD` is strong (min 12 chars, mix case/numbers/symbols)
- [ ] `JWT_SECRET` is random (min 32 chars)
- [ ] `ALLOWED_ORIGINS` is NOT `*`
- [ ] `NODE_ENV` is `production`
- [ ] MongoDB connection tested
- [ ] Cloudinary credentials verified
- [ ] `.env` file is in `.gitignore` (not committed)

---

## 🔐 Security Checklist (3 min)

- [ ] No credentials in GitHub repo
- [ ] Admin password changed from `admin123`
- [ ] JWT secret is random
- [ ] CORS restricted to your domain
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] Rate limiting active
- [ ] Helmet headers present

---

## 🚨 Troubleshooting

### "Build fails on Render"
```
Solution: npm install might fail
→ Delete package-lock.json
→ Run npm install locally
→ Commit and push
→ Redeploy
```

### "Admin login returns 401"
```
Solution: Password mismatch
→ Check ADMIN_PASSWORD in .env
→ Restart Render service
→ Try login again
```

### "Orders endpoint returns 401"
```
Solution: Token invalid or missing
→ Copy full Bearer token from login response
→ Use in Authorization header
→ Check JWT_SECRET matches
```

### "Rate limit blocking everything"
```
Solution: Limit too strict
→ Edit backend/src/app.js
→ Change rate limit values:
   - Line 23: windowMs, max values
   - Line 33: windowMs, max values
→ Redeploy
```

### "Images not uploading"
```
Solution: Cloudinary credentials wrong
→ Verify in Cloudinary dashboard:
   - Cloud name correct
   - API key correct
   - API secret correct
→ Update .env
→ Restart Render
```

---

## 📊 Monitoring Dashboard

### Key Endpoints to Monitor

```bash
# Health check
curl https://your-backend/api/config

# Admin login
curl -X POST https://your-backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'

# Orders (requires token)
curl -H "Authorization: Bearer TOKEN" \
  https://your-backend/api/orders
```

### Logs Location

- **Render**: Dashboard → Logs tab
- **Vercel**: Vercel dashboard → Deployments tab → View logs
- **MongoDB**: MongoDB Atlas → Activity
- **Cloudinary**: cloudinary.com → Media Library

---

## 💰 Estimated Costs

```
Render (Backend):
  - Free tier: Suspended after 15 min inactivity
  - $7/month: Unlimited uptime

Vercel (Frontend):
  - Free: Unlimited bandwidth

MongoDB Atlas:
  - Free: 512MB storage
  - $9/month: 10GB storage

Cloudinary:
  - Free: 25GB bandwidth/month
  - Paid: As you grow

Total: ~$16/month for production-ready setup
```

---

## 🔄 Common Operations

### Update Admin Password
```bash
# 1. Edit backend/.env
ADMIN_PASSWORD=NewPassword123!

# 2. Push to GitHub
git push

# 3. Render auto-deploys
# (Wait 1-2 min for deployment)

# 4. Verify new password works
```

### Check Active Orders
```bash
# 1. Go to admin-login.html
# 2. Login with ADMIN_PASSWORD
# 3. View dashboard
```

### View Server Logs
```bash
# Render:
# Dashboard → Select service → Logs

# Errors visible in:
# - Render logs
# - MongoDB Atlas
# - Cloudinary console
```

### Scale Up (When Needed)
```
Render:
  - Click "Plan" tab
  - Select higher tier
  - Instant scale-up

Database:
  - MongoDB Atlas auto-scales
  - Increase connection limit if needed

Images:
  - Cloudinary auto-scales
  - No action needed
```

---

## 📞 Support

### Emergency Access
- **Render Dashboard**: https://render.com/dashboard
- **MongoDB Ops**: https://cloud.mongodb.com
- **Vercel Logs**: https://vercel.com/dashboard

### Common Fixes
```bash
# Restart Render service
# → Dashboard → Select app → Redeploy

# Clear DNS cache
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # Mac
systemd-resolve --flush-caches  # Linux

# Check connectivity
ping your-backend.onrender.com
ping your-frontend.vercel.app
```

---

## ✅ Success Indicators

After deployment, you should see:

✅ Admin login page loads
✅ Login with admin password succeeds
✅ Dashboard shows orders
✅ Can create test order (see validation)
✅ Can update order status
✅ Logout redirects to login
✅ Security headers present
✅ Rate limiting active
✅ Images upload to Cloudinary
✅ Database stores orders

**If all ✅**, you're ready for real traffic!

---

## 🎓 Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check logs every few hours
   - Monitor error rates
   - Verify rate limiting working

2. **Collect Feedback**
   - Test with team members
   - Document any issues
   - Plan improvements

3. **Plan Enhancements**
   - Bcrypt password hashing
   - Multi-admin support
   - Email notifications
   - Analytics integration

4. **Scale When Ready**
   - Upgrade to paid tier
   - Monitor performance
   - Optimize if needed

---

## 🎉 You're Live!

**Congratulations!** Your production HandyCraft system is now deployed.

**What's Live:**
- ✅ Secure admin dashboard
- ✅ Order validation and processing
- ✅ JWT authentication
- ✅ Rate limiting protection
- ✅ Security headers
- ✅ Image storage
- ✅ Database backup

**Monitor**: Check logs daily for first week
**Backup**: MongoDB Atlas handles automatic backups
**Support**: All documentation available in project files

---

**Deployment Time**: ~45 minutes
**Confidence**: 🟢 HIGH
**Status**: ✅ PRODUCTION READY

**Deploy now and start accepting real orders!**
