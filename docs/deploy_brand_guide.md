# DEPLOYMENT & BRANDING GUIDE
## Complete Guide for Solo Developer - Manual-RPM Project

**Purpose:** Step-by-step instructions for deploying and branding your application  
**Audience:** Solo developer with beginner experience  
**Platforms:** Render (Backend), Vercel (Frontend), MongoDB Atlas (Database)  

---

## 📚 TABLE OF CONTENTS

1. [Branding Strategy](#branding)
2. [Logo & Visual Identity](#visual-identity)
3. [MongoDB Atlas Deployment](#mongodb-deploy)
4. [Backend Deployment on Render](#backend-deploy)
5. [Frontend Deployment on Vercel](#frontend-deploy)
6. [Environment Variables Management](#env-vars)
7. [Custom Domain Setup](#custom-domain)
8. [Post-Deployment Testing](#post-deploy-testing)
9. [Monitoring & Maintenance](#monitoring)

---

## 🎨 BRANDING STRATEGY {#branding}

### What is Branding?
Branding is creating a unique identity for your product that users remember and trust. For a healthcare app, branding should convey:
- **Trust** - Safe handling of medical data
- **Simplicity** - Easy for busy nurses to use
- **Professionalism** - Clinical-grade quality
- **Warmth** - Human-centered care

### Step 1: Define Your Brand

**Brand Name:** Manual-RPM  
**Full Name:** Manual Remote Patient Monitoring  
**Tagline:** "Simplified Patient Monitoring for Healthcare Teams"

**Brand Personality:**
- Professional but approachable
- Reliable and trustworthy
- Efficient and time-saving
- Caring and patient-centered

**Target Audience:**
- Primary: Nurses (busy, need efficiency)
- Secondary: Doctors (need clear data)
- Tertiary: Patients/Families (want transparency)

### Step 2: Create Brand Story

**Problem Statement:**
"Nurses waste 2+ hours per shift on fragmented paper logs, leading to missed vitals and delayed interventions."

**Solution:**
"Manual-RPM digitizes patient monitoring with smart reminders, automatic alerts, and shareable reports—so nurses can focus on care, not paperwork."

**Value Proposition:**
"From paper chaos to digital clarity in minutes. Built by clinicians, for clinicians."

### Step 3: Brand Voice Guidelines

**Do:**
- Use simple, clear language
- Be concise (nurses are busy)
- Show empathy for users
- Celebrate small wins
- Use medical terms correctly

**Don't:**
- Use jargon without explanation
- Be overly technical
- Make assumptions about user knowledge
- Use humor in critical situations
- Minimize importance of patient safety

**Example Messages:**
```
✅ "Patient vitals recorded successfully"
❌ "Data persisted to database"

✅ "Alert: Heart rate elevated (125 bpm)"
❌ "ERROR: HR threshold exceeded"

✅ "Share this report with family in seconds"
❌ "Generate JWT-secured URL for patient data distribution"
```

---

## 🖼️ LOGO & VISUAL IDENTITY {#visual-identity}

### Step 1: Create Logo (Free Tools)

**Option A: Canva (Easiest)**
1. Go to: https://www.canva.com/
2. Search template: "Medical Logo"
3. Choose a template with:
   - Medical cross or heart icon
   - Clean, modern font
   - Blue color scheme
4. Customize:
   - Replace text with "Manual-RPM"
   - Change colors to #3B82F6 (primary blue)
   - Add tagline below if space permits
5. Download:
   - PNG (transparent background): 512x512px
   - SVG (for scaling): Vector format

**Option B: Figma (More Control)**
1. Create account: https://www.figma.com/
2. New file: "Manual-RPM Logo"
3. Create logo elements:
   - Medical cross (use + shape tool)
   - Heart with ECG line
   - Text: "Manual-RPM" in Inter font
4. Export as PNG and SVG

**Option C: AI-Generated (Fastest)**
1. Go to: https://www.logoai.com/ or https://brandmark.io/
2. Input: "Manual RPM, healthcare monitoring, professional"
3. Choose style: "Modern, Medical, Trustworthy"
4. Generate and download

### Step 2: Logo Usage Guidelines

**Sizes to Create:**
```
favicon.ico          - 16x16, 32x32, 48x48
apple-touch-icon.png - 180x180
logo-small.png       - 64x64   (navbar)
logo-medium.png      - 128x128 (login page)
logo-large.png       - 256x256 (marketing)
logo.svg             - Vector  (all sizes)
```

**Color Variations:**
- Full color: Primary logo on white background
- White: On blue/dark backgrounds
- Monochrome: For print or low-color situations

**Clear Space Rule:**
- Minimum padding around logo = height of logo
- Don't place text or other elements in this space

### Step 3: Implement Logo in App

`frontend/public/` structure:
```
public/
├── favicon.ico
├── apple-touch-icon.png
├── logo.svg
├── logo-small.png
├── logo-medium.png
└── logo-large.png
```

`frontend/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Brand Meta Tags -->
    <meta name="description" content="Manual-RPM: Simplified patient monitoring for healthcare teams" />
    <meta name="theme-color" content="#3B82F6" />
    
    <!-- Open Graph for social sharing -->
    <meta property="og:title" content="Manual-RPM" />
    <meta property="og:description" content="Simplified Patient Monitoring Dashboard" />
    <meta property="og:image" content="/logo-large.png" />
    <meta property="og:type" content="website" />
    
    <title>Manual-RPM - Patient Monitoring Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`frontend/src/components/Navbar.jsx`:
```jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/logo-small.png" 
                alt="Manual-RPM Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-semibold text-gray-900">
                Manual-RPM
              </span>
            </Link>
          </div>
          
          {/* Rest of navbar */}
        </div>
      </div>
    </nav>
  );
}
```

### Step 4: Color Palette Implementation

Create `frontend/src/styles/colors.css`:
```css
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #06b6d4;

  /* Alert Severity */
  --alert-low: #d1fae5;
  --alert-medium: #fef3c7;
  --alert-high: #fee2e2;
  --alert-critical: #dc2626;

  /* Neutral Grays */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

Import in `frontend/src/main.jsx`:
```javascript
import './index.css';
import './styles/colors.css';
```

### Step 5: Typography

Install Inter font (already included if using Tailwind):

`frontend/src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Font Usage Guide:**
```css
/* Headings */
h1 { font-size: 2.25rem; font-weight: 700; line-height: 2.5rem; }
h2 { font-size: 1.875rem; font-weight: 600; line-height: 2.25rem; }
h3 { font-size: 1.5rem; font-weight: 600; line-height: 2rem; }
h4 { font-size: 1.25rem; font-weight: 600; line-height: 1.75rem; }

/* Body Text */
p { font-size: 1rem; line-height: 1.5rem; }
small { font-size: 0.875rem; line-height: 1.25rem; }

/* UI Elements */
button { font-size: 0.875rem; font-weight: 500; }
label { font-size: 0.875rem; font-weight: 500; }
input { font-size: 1rem; }
```

---

## 🗄️ MONGODB ATLAS DEPLOYMENT {#mongodb-deploy}

### Step 1: Verify Cluster is Running

1. Login to: https://cloud.mongodb.com/
2. Go to "Database" tab
3. Verify cluster status: "Running"
4. Note cluster name: e.g., `manual-rpm-cluster`

### Step 2: Create Production Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `manualrpm_prod`
5. Password: Click "Autogenerate Secure Password" - **SAVE THIS!**
6. Database User Privileges: "Read and write to any database"
7. Restrict Access to Specific Clusters: **Select your cluster**
8. Click "Add User"

### Step 3: Update Network Access for Production

**Important:** Remove 0.0.0.0/0 and add specific IPs

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. **Option A: Add Render IPs** (Recommended)
   - Get Render outbound IPs from: https://render.com/docs/static-outbound-ip-addresses
   - Add each IP individually
4. **Option B: Allow All** (Easier but less secure)
   - Click "Allow Access from Anywhere"
   - Add comment: "Production - Temporary"

### Step 4: Get Production Connection String

1. Go to "Database" tab
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy connection string:
```
mongodb+srv://manualrpm_prod:<password>@manual-rpm-cluster.xxxxx.mongodb.net/manual-rpm-prod?retryWrites=true&w=majority
```
5. Replace `<password>` with actual password
6. Note the database name: `manual-rpm-prod`

### Step 5: Configure Connection Pooling

**Important for free tier:**
- M0 Free Tier limits: 100 connections
- Set connection pool size appropriately

Your MongoDB connection in `backend/src/config/db.js`:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,  // Max 10 connections (important for free tier)
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 🚀 BACKEND DEPLOYMENT ON RENDER {#backend-deploy}

### Step 1: Prepare Backend for Production

**1.1: Update package.json**

`backend/package.json`:
```json
{
  "name": "manual-rpm-backend",
  "version": "1.0.0",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  }
}
```

**1.2: Create Production Server Config**

`backend/src/server.js` - Add before app.listen():
```javascript
// Production error handler
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error('Production error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  });
}

// Health check for monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

**1.3: Update CORS for Production**

`backend/src/server.js`:
```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',  // Development
  process.env.FRONTEND_URL,  // Production (will set this in Render)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**1.4: Commit Changes**
```bash
git add .
git commit -m "chore: prepare backend for production deployment"
git push origin main
```

### Step 2: Create Render Account (Already Done)

You mentioned you have a Render account, so skip signup.

### Step 3: Create New Web Service on Render

1. Login to: https://dashboard.render.com/
2. Click "New +" button
3. Select "Web Service"
4. Connect GitHub repository:
   - Click "Connect GitHub"
   - Authorize Render
   - Select repository: `manual-rpm`
5. Configure service:

```
Name: manual-rpm-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

6. Click "Advanced" to configure more:

**Instance Type:**
- Select "Free" (512 MB RAM, shared CPU)
- Note: Free tier sleeps after 15 minutes of inactivity

**Auto-Deploy:**
- Enable "Auto-Deploy" (deploys on every push to main)

### Step 4: Add Environment Variables on Render

In the "Environment Variables" section, add:

```
MONGODB_URI = mongodb+srv://manualrpm_prod:<password>@manual-rpm-cluster.xxxxx.mongodb.net/manual-rpm-prod?retryWrites=true&w=majority

JWT_SECRET = your-super-secret-jwt-key-change-this-in-production

JWT_EXPIRY = 1h

PORT = 10000

NODE_ENV = production

FRONTEND_URL = (Leave blank for now, will update after Vercel deployment)
```

**Important:**
- Click "Generate" for JWT_SECRET or use: `openssl rand -base64 32`
- Don't use the same JWT_SECRET as development!

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will:
   - Clone your repo
   - Run `npm install`
   - Start server with `npm start`
3. Wait 5-10 minutes for first deployment

### Step 6: Verify Deployment

Once deployed, you'll get a URL like:
```
https://manual-rpm-backend.onrender.com
```

Test endpoints:
```bash
# Health check
curl https://manual-rpm-backend.onrender.com/health

# Should return:
{
  "status": "OK",
  "timestamp": "2025-12-16T...",
  "uptime": 123,
  "environment": "production"
}

# Test API
curl https://manual-rpm-backend.onrender.com/api/v1/auth/login
```

**Common Issues:**
- **500 Error**: Check logs in Render dashboard
- **MongoDB Connection Failed**: Verify connection string and IP whitelist
- **CORS Error**: Will fix after frontend deployment

---

## 🌐 FRONTEND DEPLOYMENT ON VERCEL {#frontend-deploy}

### Step 1: Prepare Frontend for Production

**1.1: Update API Base URL for Production**

`frontend/src/services/api.js`:
```javascript
// Use environment variable, fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://manual-rpm-backend.onrender.com/api/v1';
```

**1.2: Create Production Build Script**

`frontend/package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  }
}
```

**1.3: Test Production Build Locally**
```bash
cd frontend
npm run build

# Should create dist/ folder
# Test it:
npm run preview
# Open http://localhost:4173
```

**1.4: Create vercel.json Configuration**

`frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**1.5: Commit Changes**
```bash
git add .
git commit -m "chore: configure frontend for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Login to: https://vercel.com/
2. Click "Add New..." → "Project"
3. Import Git Repository:
   - Find `manual-rpm` repo
   - Click "Import"
4. Configure Project:

```
Project Name: manual-rpm-frontend
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Add Environment Variables:

```
VITE_API_BASE_URL = https://manual-rpm-backend.onrender.com/api/v1

VITE_APP_NAME = Manual-RPM
```

6. Click "Deploy"

### Step 3: Wait for Deployment

- Vercel builds in 1-3 minutes (much faster than Render)
- You'll get a URL like: `https://manual-rpm-frontend.vercel.app`

### Step 4: Update Backend CORS

Now that you have frontend URL, update Render environment variables:

1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL`:
```
FRONTEND_URL = https://manual-rpm-frontend.vercel.app
```
5. Click "Save Changes"
6. Backend will redeploy automatically

### Step 5: Test Complete Application

1. Open: https://manual-rpm-frontend.vercel.app
2. Test user flow:
   - Register new account
   - Login
   - Add patient
   - Submit vitals
   - Check alerts
   - Generate share link

**Common Issues:**
- **API calls failing**: Check CORS configuration
- **404 on refresh**: Check vercel.json rewrites
- **Environment variables not working**: Rebuild after adding them

---

## 🔐 ENVIRONMENT VARIABLES MANAGEMENT {#env-vars}

### Development vs Production

**Development (.env files):**
```
backend/.env:
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/manual-rpm-dev
JWT_SECRET=dev-secret-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

frontend/.env:
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

**Production (Platform dashboards):**
```
Render (Backend):
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/manual-rpm-prod
JWT_SECRET=super-secure-production-key
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://manual-rpm-frontend.vercel.app

Vercel (Frontend):
VITE_API_BASE_URL=https://manual-rpm-backend.onrender.com/api/v1
```

### Security Best Practices

**Never commit:**
- `.env` files
- API keys
- Database passwords
- JWT secrets

**Always:**
- Use different secrets for dev/prod
- Rotate secrets regularly
- Use strong passwords (32+ characters)
- Enable 2FA on deployment platforms

### Accessing Variables in Code

**Backend (Node.js):**
```javascript
const secret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGODB_URI;
```

**Frontend (Vite):**
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
// MUST start with VITE_ to be accessible in browser
```

---

## 🌍 CUSTOM DOMAIN SETUP {#custom-domain}

### Option 1: Using Vercel Domain (Free)

Your app is already accessible at:
```
https://manual-rpm-frontend.vercel.app
```

To customize the Vercel subdomain:
1. Go to Vercel project settings
2. Domains tab
3. Add: `manual-rpm.vercel.app` (if available)

### Option 2: Buy Custom Domain

**Where to Buy:**
- Namecheap: ~$10/year
- GoDaddy: ~$12/year
- Google Domains: ~$12/year
- Cloudflare: ~$9/year

**Recommended domain:**
```
manualrpm.com
manualrpm.app
manualrpm.health
```

### Step-by-Step Custom Domain Setup

**1. Buy Domain (Example: Namecheap)**
1. Go to: https://www.namecheap.com/
2. Search "manualrpm.com"
3. Add to cart and checkout (~$10)

**2. Configure Domain for Frontend (Vercel)**
1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Click "Add Domain"
4. Enter: `manualrpm.com`
5. Vercel will show DNS records to add:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```
6. Go to Namecheap dashboard
7. Select your domain
8. Go to "Advanced DNS"
9. Add the records Vercel provided
10. Wait 5-60 minutes for DNS propagation

**3. Configure Subdomain for Backend (Optional)**

Instead of `manual-rpm-backend.onrender.com`, use `api.manualrpm.com`:

1. In Render dashboard, go to your backend service
2. Click "Settings"
3. Scroll to "Custom Domain"
4. Enter: `api.manualrpm.com`
5. Render will show DNS record:
```
Type: CNAME
Name: api
Value: manual-rpm-backend.onrender.com
```
6. Add this record in Namecheap DNS settings
7. Wait for DNS propagation

**4. Update Frontend Environment Variable**
```
VITE_API_BASE_URL = https://api.manualrpm.com/api/v1
```

**5. Update Backend CORS**
```
FRONTEND_URL = https://manualrpm.com
```

**6. Enable HTTPS (Automatic)**
- Both Vercel and Render provide free SSL certificates
- HTTPS will be enabled automatically
- HTTP requests will redirect to HTTPS

---

## ✅ POST-DEPLOYMENT TESTING {#post-deploy-testing}

### Production Testing Checklist

```
Connectivity:
[ ] Frontend URL loads (https://manual-rpm-frontend.vercel.app)
[ ] Backend health endpoint responds
[ ] No CORS errors in browser console
[ ] SSL certificate valid (🔒 icon in address bar)

Authentication:
[ ] Can register new user
[ ] Can login
[ ] Token persists in localStorage
[ ] Protected routes redirect to login when not authenticated
[ ] Token expiration works (wait 1 hour and test)

Core Features:
[ ] Can create patient
[ ] Can view patient list
[ ] Can submit vitals
[ ] Alerts generated correctly
[ ] Can generate share link
[ ] Share link accessible without login
[ ] Can export PDF
[ ] Can export CSV

Performance:
[ ] API responses < 2 seconds
[ ] Frontend loads < 3 seconds
[ ] No memory leaks (check browser dev tools)
[ ] Images optimized

Mobile:
[ ] Works on iPhone Safari
[ ] Works on Android Chrome
[ ] Touch interactions work
[ ] Forms usable on mobile
[ ] Charts display correctly

Cross-Browser:
[ ] Chrome (desktop)
[ ] Firefox (desktop)
[ ] Safari (desktop)
[ ] Edge (desktop)
```

### Load Testing (Optional)

Use Apache Bench (comes with macOS/Linux):
```bash
# Test backend health endpoint
ab -n 1000 -c 10 https://manual-rpm-backend.onrender.com/health

# Results show:
# - Requests per second
# - Time per request
# - Failed requests
```

For more advanced testing:
- Use: https://loader.io/ (free tier: 10,000 clients/test)
- Test your login endpoint, patient list, etc.

---

## 📊 MONITORING & MAINTENANCE {#monitoring}

### Step 1: Enable Render Monitoring

1. In Render dashboard, go to your service
2. Click "Metrics" tab
3. Monitor:
   - CPU usage (should stay < 80%)
   - Memory usage (should stay < 400MB for free tier)
   - Request count
   - Response times

**Set up Alerts:**
1. Go to "Settings" → "Notifications"
2. Add email for:
   - Deploy failures
   - Service down
   - High error rate

### Step 2: Enable Vercel Monitoring

1. In Vercel project dashboard
2. Click "Analytics" tab (free tier included)
3. Monitor:
   - Page views
   - Unique visitors
   - Performance metrics (Core Web Vitals)
   - Error rate

### Step 3: Setup Error Tracking (Optional but Recommended)

**Use Sentry (Free Tier Available):**

**Backend:**
```bash
cd backend
npm install @sentry/node
```

`backend/src/server.js`:
```javascript
const Sentry = require('@sentry/node');

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });

  // Request handler must be first
  app.use(Sentry.Handlers.requestHandler());
  
  // ... your routes ...
  
  // Error handler must be last
  app.use(Sentry.Handlers.errorHandler());
}
```

**Frontend:**
```bash
cd frontend
npm install @sentry/react
```

`frontend/src/main.jsx`:
```javascript
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
  });
}
```

### Step 4: Regular Maintenance Tasks

**Daily:**
- Check error logs in Render dashboard
- Check Vercel analytics for issues
- Verify health endpoint: `curl https://manual-rpm-backend.onrender.com/health`

**Weekly:**
- Review MongoDB Atlas metrics
- Check disk usage (free tier: 512MB limit)
- Review Sentry error reports
- Update dependencies if security patches available

**Monthly:**
- Review user feedback
- Plan feature updates
- Check for outdated dependencies: `npm outdated`
- Rotate JWT secret if needed

### Step 5: Backup Strategy

**MongoDB Backups (Manual - Free Tier):**
```bash
# Export entire database
mongodump --uri="mongodb+srv://manualrpm_prod:<password>@cluster.mongodb.net/manual-rpm-prod"

# This creates dump/ folder
# Store this somewhere safe (Google Drive, Dropbox)
```

**Automated Backups:**
- MongoDB Atlas M10+ tiers include automatic backups
- For free tier, consider monthly manual exports

### Step 6: Scaling Considerations

**When to Upgrade:**

**Free Tier Limits:**
```
MongoDB Atlas M0:
- Storage: 512MB
- RAM: Shared
- Connections: 100
- Cost: Free

Render Free:
- RAM: 512MB
- CPU: Shared
- Sleep after 15min inactive
- Cost: Free

Vercel Hobby:
- Bandwidth: 100GB/month
- Builds: 6000 minutes/month
- Cost: Free
```

**Upgrade Triggers:**
- MongoDB storage > 400MB (80% full)
- Backend consistently hitting memory limit
- Need backend always-on (no sleep)
- Need more than 100 concurrent DB connections
- Need guaranteed uptime SLA

**Upgrade Costs:**
```
MongoDB Atlas M10: $57/month
Render Starter: $7/month
Vercel Pro: $20/month

Total: ~$84/month for stable production
```

---

## 🎉 DEPLOYMENT SUCCESS CHECKLIST

After completing all deployment steps:

```
✅ Branding:
[ ] Logo created and implemented
[ ] Color palette applied
[ ] Typography consistent
[ ] Brand voice in all copy

✅ MongoDB:
[ ] Production cluster running
[ ] Production user created
[ ] Connection string tested
[ ] Backups scheduled

✅ Backend:
[ ] Deployed on Render
[ ] Environment variables set
[ ] Health endpoint working
[ ] CORS configured
[ ] Error handling tested

✅ Frontend:
[ ] Deployed on Vercel
[ ] Environment variables set
[ ] API connection working
[ ] All pages loading
[ ] Mobile responsive

✅ Domain (if applicable):
[ ] Domain purchased
[ ] DNS configured
[ ] SSL enabled
[ ] Redirects working

✅ Monitoring:
[ ] Error tracking enabled
[ ] Analytics configured
[ ] Alerts set up
[ ] Logs accessible

✅ Documentation:
[ ] README updated with production URLs
[ ] API documentation current
[ ] User guide created
[ ] Deployment guide saved
```

---

## 🚨 TROUBLESHOOTING COMMON ISSUES

### Issue 1: Render Backend Sleeps
**Problem:** Free tier sleeps after 15 minutes of inactivity  
**Solutions:**
1. Upgrade to paid tier ($7/month)
2. Use a ping service: https://uptimerobot.com/ (free)
   - Ping your backend every 14 minutes
3. Accept cold starts (first request takes 30-60 seconds)

### Issue 2: MongoDB Connection Timeout
**Problem:** Backend can't connect to MongoDB  
**Solutions:**
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string has correct password
3. Check MongoDB Atlas cluster is running
4. Increase `serverSelectionTimeoutMS` in connection options

### Issue 3: CORS Errors
**Problem:** Frontend can't call backend API  
**Solutions:**
1. Verify `FRONTEND_URL` environment variable in Render
2. Check CORS configuration allows your frontend domain
3. Ensure using HTTPS (not HTTP) in production
4. Clear browser cache

### Issue 4: Environment Variables Not Working
**Problem:** App behaves differently than locally  
**Solutions:**
1. Verify variables are set in platform dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding new variables
4. Frontend: Ensure variables start with `VITE_`

### Issue 5: Build Fails on Vercel
**Problem:** "npm run build" fails  
**Solutions:**
1. Test build locally first: `npm run build`
2. Check Node version in vercel.json matches
3. Verify all dependencies in package.json
4. Check build logs in Vercel dashboard for errors

---

**Document Version:** 1.0.0  
**Last Updated:** December 16, 2025  
**Author:** Manual-RPM Team  
**Next Review:** After successful deployment

**Need Help?**
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- MongoDB docs: https://www.mongodb.com/docs/atlas/
