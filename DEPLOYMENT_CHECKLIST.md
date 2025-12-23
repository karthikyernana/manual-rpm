# 🚀 Production Deployment Checklist

Use this checklist to ensure smooth deployment of Manual-RPM.

## ✅ Pre-Deployment (Local Testing)

- [ ] All tests passing: `npm test`
- [ ] Backend starts without errors: `npm run dev`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Database seeding works: `npm run seed:admin`
- [ ] Can login with admin credentials
- [ ] All features tested locally:
  - [ ] Patient CRUD operations
  - [ ] Vitals recording
  - [ ] Alert generation
  - [ ] Reminders creation
  - [ ] Export to PDF/CSV
  - [ ] Patient sharing (QR codes)
  - [ ] Admin user management

---

## ✅ MongoDB Atlas Setup

- [ ] Cluster created (M0 Free tier)
- [ ] Database user created with read/write access
- [ ] Network access: 0.0.0.0/0 (allow from anywhere)
- [ ] Connection string obtained
- [ ] Connection string tested locally
- [ ] Database name set to `manual-rpm`

---

## ✅ Backend Deployment (Render)

- [ ] Code pushed to GitHub
- [ ] Web Service created on Render
- [ ] Repository connected
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables added:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET` (32+ characters)
  - [ ] `JWT_EXPIRY` (1h)
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5001`
  - [ ] `ADMIN_PASSWORD` (optional)
- [ ] Deployment successful
- [ ] Health endpoint works: `/api/v1/health`
- [ ] Admin user seeded via Render Shell
- [ ] Backend URL saved for frontend config

---

## ✅ Frontend Deployment (Vercel)

- [ ] `.env.production` created with `VITE_API_BASE_URL`
- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable added: `VITE_API_BASE_URL`
- [ ] Deployment successful
- [ ] Frontend loads without errors
- [ ] Frontend URL saved

---

## ✅ Post-Deployment Configuration

- [ ] Backend `FRONTEND_URL` updated with actual Vercel URL
- [ ] Backend redeployed (auto-redeploys on env change)
- [ ] CORS working (no CORS errors in browser console)

---

## ✅ Security Hardening

- [ ] Logged in with default admin credentials
- [ ] Admin password changed to strong password (20+ chars)
- [ ] Password saved in password manager
- [ ] `.env` files in `.gitignore`
- [ ] No secrets committed to GitHub
- [ ] MongoDB connection string not exposed
- [ ] JWT secret is random and secure

---

## ✅ Functionality Testing (Production)

Test as **admin**:
- [ ] Login successful
- [ ] Dashboard loads with stats
- [ ] Create nurse account
- [ ] Create doctor account
- [ ] Add test patient
- [ ] Record vitals for patient
- [ ] Verify alerts generated for abnormal vitals
- [ ] Create manual reminder
- [ ] Generate share link (QR code)
- [ ] Export patient data (CSV)
- [ ] Export patient data (PDF)
- [ ] View audit logs
- [ ] Manage wards in settings
- [ ] Change system settings

Test as **nurse**:
- [ ] Logout from admin
- [ ] Login with nurse account
- [ ] Can view patients
- [ ] Can add patients
- [ ] Can record vitals
- [ ] Can view alerts
- [ ] Can create reminders
- [ ] Cannot access admin panel
- [ ] Cannot create users

Test as **doctor**:
- [ ] Login with doctor account
- [ ] Can view all features
- [ ] Cannot access admin-only features

---

## ✅ Performance & Monitoring

- [ ] Backend health check responding: `/api/v1/health`
- [ ] Average API response time < 500ms
- [ ] Frontend loads in < 3 seconds
- [ ] No console errors in browser
- [ ] No errors in Render logs
- [ ] MongoDB connection stable

---

## ✅ Optional: Keep Backend Warm (Recommended)

Render free tier sleeps after 15 minutes of inactivity.

- [ ] Setup cron job at https://cron-job.org
- [ ] Add job: Ping backend health endpoint every 10 minutes
- [ ] URL: `https://your-backend.onrender.com/api/v1/health`
- [ ] Schedule: Every 10 minutes
- [ ] Verified backend stays awake

---

## ✅ Documentation & Handoff

- [ ] Live URLs documented:
  - Frontend: `_________________`
  - Backend: `_________________`
  - Admin Email: `admin@manual-rpm.com`
  - Admin Password: `[in password manager]`
- [ ] Deployment guide shared with team
- [ ] Admin credentials shared securely
- [ ] MongoDB Atlas access shared with team
- [ ] Render dashboard access shared
- [ ] Vercel dashboard access shared

---

## ✅ Backup & Recovery Plan

- [ ] MongoDB Atlas automatic backups enabled (check cluster settings)
- [ ] Know how to restore from backup
- [ ] Know how to reseed admin: `npm run seed:admin` in Render Shell
- [ ] Know how to reset database: `npm run reset:production`
- [ ] Emergency contact list created

---

## 🎉 Launch Complete!

When all checkboxes are checked, you're production-ready!

**Next Steps:**
1. Monitor application for first 24 hours
2. Collect user feedback
3. Plan feature enhancements
4. Regular backups (weekly recommended)

---

## 🆘 Emergency Procedures

### Lost Admin Access
```bash
# In Render Shell:
npm run seed:admin
# Login with default credentials and change password
```

### Application Down
1. Check Render dashboard for errors
2. Check MongoDB Atlas for connection issues
3. Check Vercel deployment status
4. Review error logs

### Database Corrupted
1. Go to MongoDB Atlas
2. Restore from latest backup
3. Reseed admin user
4. Test all features

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URLs:** _______________  

---

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
