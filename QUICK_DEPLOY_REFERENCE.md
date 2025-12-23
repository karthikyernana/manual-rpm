# 🚀 Quick Deployment Reference

**Last Updated:** December 23, 2025

---

## 🎯 Essential Commands

```bash
# Create admin account
npm run seed:admin

# Reset database (DANGER: deletes all data)
npm run reset:production

# Start development
npm run dev

# Run tests
npm test
```

---

## 🔑 Default Admin Credentials

**Email:** `admin@manual-rpm.com`  
**Password:** `Admin@123`

⚠️ **Change immediately after first login!**

---

## 📋 Deployment Order

1. **MongoDB Atlas** → Set up database
2. **Render** → Deploy backend API
3. **Seed Admin** → Run `npm run seed:admin` in Render Shell
4. **Vercel** → Deploy frontend
5. **Update CORS** → Set `FRONTEND_URL` in Render
6. **Test & Secure** → Login and change password

---

## 🔗 Production URLs

**Frontend:** `https://manual-rpm-[your-id].vercel.app`  
**Backend:** `https://manual-rpm-backend-[your-id].onrender.com`  
**Health Check:** `https://your-backend.onrender.com/api/v1/health`

---

## 🆘 Emergency Recovery

### Locked out of admin account?
```bash
# In Render Shell:
npm run seed:admin
# Login with default credentials
```

### Need to clear all data?
```bash
# In Render Shell (DANGER):
npm run reset:production
```

### Backend not responding?
1. Check Render logs
2. Verify MongoDB connection
3. Check environment variables
4. Restart service in Render

---

## ✅ Post-Deployment Checklist

- [ ] Login works with admin account
- [ ] Admin password changed
- [ ] Created at least one nurse account
- [ ] Added test patient
- [ ] Recorded vitals
- [ ] Alerts generating correctly
- [ ] Export functions work
- [ ] Share links work
- [ ] All features tested

---

## 🔐 Security Best Practices

1. **Change admin password immediately**
2. **Never commit .env files**
3. **Use strong passwords (20+ chars)**
4. **Store credentials in password manager**
5. **Regularly backup MongoDB**
6. **Monitor error logs**

---

## 📞 Support Resources

- **Full Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Scripts Docs:** [backend/scripts/README.md](backend/scripts/README.md)

---

## 💾 Backup Strategy

1. **MongoDB Atlas** → Automatic backups enabled
2. **Code** → GitHub (main branch)
3. **Credentials** → Password manager
4. **Documentation** → Git repository

---

## 🔄 Update Workflow

```bash
# Local development
git checkout -b feature/new-feature
# Make changes
git commit -m "feat: description"
git push origin feature/new-feature

# Merge via GitHub PR
# → Auto-deploys to Render + Vercel
```

---

**Need help?** Review the comprehensive [DEPLOYMENT.md](DEPLOYMENT.md) guide.
