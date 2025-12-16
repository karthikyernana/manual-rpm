# Deployment Guide - Manual-RPM

This guide will walk you through deploying the Manual-RPM application to production.

## 🎯 Deployment Architecture

- **Database**: MongoDB Atlas (Free M0 cluster)
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel (Free tier)

Total Cost: **$0/month** 🎉

---

## 📋 Prerequisites

1. GitHub account (with your code pushed)
2. MongoDB Atlas account
3. Render account
4. Vercel account

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Database

1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Sign in / Create account
3. Create a new cluster (M0 Free tier)
4. Wait for cluster to provision (~5 minutes)

### 1.2 Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `manual-rpm-admin`
4. Password: Generate a secure password (save it!)
5. User Privileges: Read and write to any database
6. Click "Add User"

### 1.3 Allow Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 1.4 Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `manual-rpm`

Example:

```
mongodb+srv://manual-rpm-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/manual-rpm?retryWrites=true&w=majority
```

---

## Step 2: Backend Deployment (Render)

### 2.1 Push Code to GitHub

```bash
cd backend
git add .
git commit -m "prepare for deployment"
git push origin main
```

### 2.2 Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `manual-rpm-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 2.3 Add Environment Variables

In Render dashboard, add these environment variables:

```
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-a-random-32-char-string>
FRONTEND_URL=https://manual-rpm.vercel.app
NODE_ENV=production
```

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (~5 minutes)
3. Copy your backend URL: `https://manual-rpm-backend.onrender.com`

### 2.5 Test Backend

Visit: `https://your-backend-url.onrender.com/api/v1/health`

Should return: `{"status":"ok"}`

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Create Environment File

In `frontend` directory, create `.env.production`:

```
VITE_API_URL=https://your-backend-url.onrender.com/api/v1
```

### 3.2 Push to GitHub

```bash
cd frontend
git add .
git commit -m "add production env"
git push origin main
```

### 3.3 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api/v1`

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build (~2 minutes)
3. Get your live URL: `https://manual-rpm.vercel.app`

---

## Step 4: Update CORS & Environment

### 4.1 Update Backend CORS

In Render dashboard:

1. Update `FRONTEND_URL` environment variable to your Vercel URL
2. Redeploy backend (Render will auto-redeploy)

### 4.2 Test Full Application

1. Visit your Vercel URL
2. Register a new account
3. Test all features:
   - Add patient
   - Record vitals
   - Check alerts
   - Test sharing (QR code)
   - Export PDF/CSV

---

## Step 5: Custom Domain (Optional)

### Frontend (Vercel)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Backend (Render)

1. Go to Service Settings → Custom Domain
2. Add your custom backend domain
3. Update DNS records

---

## 🔧 Troubleshooting

### Backend won't start

- Check Render logs
- Verify MongoDB connection string
- Ensure `NODE_ENV=production`

### Frontend can't connect to backend

- Check `VITE_API_URL` is correct
- Verify CORS is configured
- Check browser console for errors

### Database connection issues

- Verify IP whitelist (0.0.0.0/0)
- Check database user permissions
- Test connection string locally first

---

## 📊 Monitoring

### Render Metrics

- View logs in Render dashboard
- Monitor CPU/Memory usage
- Set up health checks

### Vercel Analytics

- Enable Vercel Analytics (free)
- Track page views and performance

---

## 🔐 Security Checklist

- [ ] MongoDB IP whitelist configured
- [ ] Strong JWT secret (32+ characters)
- [ ] `.env` files in `.gitignore`
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Vercel/Render)

---

## 💡 Tips

1. **Free Tier Limits**:

   - Render: Spins down after 15 min inactivity (cold starts)
   - MongoDB Atlas: 512 MB storage
   - Vercel: Unlimited bandwidth for personal projects

2. **Keep Backend Warm**:

   - Use a cron job service (e.g., cron-job.org) to ping your health endpoint every 10 minutes

3. **Database Backups**:
   - MongoDB Atlas M0 does not include automatic backups
   - Manually export data periodically

---

## 🎉 You're Live!

Your application is now deployed and accessible worldwide!

**Share your links:**

- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com/api/v1`

Need help? Check the logs or open an issue on GitHub.
