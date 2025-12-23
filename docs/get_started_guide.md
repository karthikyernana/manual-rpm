# GET STARTED TO-DO GUIDE
## Complete Step-by-Step Implementation for Manual-RPM

**Target:** Build complete application in 4 days  
**Start Date:** December 16, 2025  
**Solo Developer Friendly:** Yes  
**Previous Experience:** Beginner to Intermediate  

---

## 🚀 PRE-DEVELOPMENT SETUP (Before Day 1)

### Step 1: Install Required Software

**1.1 Install Node.js (v18 or higher)**
```bash
# Check if installed
node --version
npm --version

# If not installed, download from: https://nodejs.org/
# Choose LTS version
```

**1.2 Install Git**
```bash
# Check if installed
git --version

# If not installed:
# Windows: https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt-get install git
```

**1.3 Install VS Code**
- Download from: https://code.visualstudio.com/
- Install extensions:
  - ESLint
  - Prettier
  - Thunder Client (API testing)
  - GitLens
  - MongoDB for VS Code

**1.4 Install MongoDB Compass (Optional - for database GUI)**
- Download from: https://www.mongodb.com/try/download/compass

---

### Step 2: Create MongoDB Atlas Account

**2.1 Sign Up**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Click "Sign Up Free"
3. Use Google/GitHub or email signup
4. **No credit card required**

**2.2 Create Free Cluster**
1. After signup, click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select cloud provider: **AWS**
4. Select region: **Closest to you** (e.g., Mumbai for India)
5. Cluster name: `manual-rpm-cluster`
6. Click "Create Cluster" (takes 3-5 minutes)

**2.3 Create Database User**
1. In left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `manualrpm_user`
5. Password: **Click "Autogenerate Secure Password"** - COPY THIS!
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

**2.4 Whitelist IP Address**
1. In left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - This adds `0.0.0.0/0`
4. Click "Confirm"

**2.5 Get Connection String**
1. In left sidebar, click "Database"
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy connection string:
   ```
   mongodb+srv://manualrpm_user:<password>@manual-rpm-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with actual password from Step 2.3
7. **SAVE THIS SOMEWHERE SAFE** (you'll need it in Day 1)

---

### Step 3: Setup GitHub Account

**3.1 Create GitHub Account (if you don't have one)**
1. Go to: https://github.com/join
2. Create account with email
3. Verify email

**3.2 Setup CodeRabbit**
1. Go to: https://coderabbit.ai/
2. Click "Sign in with GitHub"
3. Authorize CodeRabbit to access your repos
4. **You already have an account** - just login

**3.3 Setup testSprite**
1. Go to: https://testsprite.com/
2. Sign up with email or GitHub
3. **You already have an account** - just login
4. Note your API key from dashboard

---

### Step 4: Setup Render Account (Backend Hosting)

**4.1 Create Render Account**
1. Go to: https://render.com/
2. Click "Get Started for Free"
3. Sign up with GitHub (easiest for deployments)

**4.2 Connect GitHub**
- Authorize Render to access your repos
- You'll deploy directly from GitHub later

---

### Step 5: Setup Vercel Account (Frontend Hosting)

**5.1 Create Vercel Account**
1. Go to: https://vercel.com/signup
2. Sign up with GitHub
3. Authorize Vercel

---

## 📅 DAY 1: FOUNDATION & INFRASTRUCTURE

### Hour 0-2: Project Initialization

**Step 1.1: Create Project Directory**
```bash
# Open terminal/command prompt
mkdir manual-rpm
cd manual-rpm

# Initialize git
git init

# Create README
echo "# Manual-RPM - Patient Monitoring System" > README.md
```

**Step 1.2: Create GitHub Repository**
1. Go to: https://github.com/new
2. Repository name: `manual-rpm`
3. Description: "Manual Remote Patient Monitoring Dashboard with MongoDB"
4. **Public** or **Private** (your choice)
5. DO NOT initialize with README (we already have one)
6. Click "Create repository"

**Step 1.3: Connect Local to GitHub**
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/manual-rpm.git
git branch -M main
```

**Step 1.4: Create Project Structure**
```bash
# Create directories
mkdir backend frontend docs

# Create .gitignore
cat > .gitignore << EOF
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
coverage/
EOF
```

**Step 1.5: Initialize Backend**
```bash
cd backend
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken express-validator cors helmet morgan dotenv

# Install dev dependencies
npm install --save-dev nodemon

# Create folders
mkdir src
mkdir src/models
mkdir src/routes
mkdir src/middleware
mkdir src/services
mkdir src/utils
mkdir src/config
```

**Step 1.6: Create Backend File Structure**
```bash
cd src

# Create main files
touch server.js
touch config/db.js
touch middleware/auth.js
touch middleware/errorHandler.js
touch utils/logger.js

cd ../..
```

**Step 1.7: Initialize Frontend**
```bash
cd frontend

# Create Vite React app
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom axios tailwindcss postcss autoprefixer
npm install framer-motion lucide-react react-hook-form
npm install recharts

# Install Shadcn UI (we'll configure this later)

# Initialize Tailwind
npx tailwindcss init -p
```

**Step 1.8: Configure package.json Scripts**

Backend `package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  }
}
```

Frontend `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**🎯 COMMIT #1:**
```bash
# From project root (manual-rpm/)
git add .
git commit -m "feat: initial project setup with MongoDB config"
git push -u origin main
```

---

### Hour 2-4: MongoDB Connection & Environment Setup

**Step 2.1: Create Backend .env File**
```bash
cd backend
cat > .env << EOF
MONGODB_URI=your-mongodb-connection-string-from-step-2.5
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY=1h
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
```

**Step 2.2: Update MongoDB URI**
- Open `backend/.env` in VS Code
- Replace `your-mongodb-connection-string-from-step-2.5` with actual connection string
- Make sure `<password>` is replaced with real password

**Step 2.3: Create Database Connection File**

`backend/src/config/db.js`:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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

**Step 2.4: Create Basic Server**

`backend/src/server.js`:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Manual-RPM API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL}`);
});
```

**Step 2.5: Test MongoDB Connection**
```bash
cd backend
npm run dev

# You should see:
# ✅ MongoDB Connected: manual-rpm-cluster-shard-00-00.xxxxx.mongodb.net
# 📊 Database: manual-rpm
# 🚀 Server running on port 5001
```

**Step 2.6: Test Health Endpoint**
- Open browser: http://localhost:5001/api/health
- Should see: `{"status":"OK","message":"Manual-RPM API is running","timestamp":"..."}`

**🎯 COMMIT #2:**
```bash
# Stop the server (Ctrl+C)
cd ..  # Back to project root
git add .
git commit -m "feat: setup MongoDB connection and Express server"
git push origin main
```

---

### Hour 4-8: User Model & Authentication Backend

**Step 3.1: Create User Model**

`backend/src/models/User.js`:
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // Don't return password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'coordinator'],
    default: 'nurse'
  },
  phone: {
    type: String,
    trim: true
  },
  notificationPrefs: {
    automaticMode: {
      type: Boolean,
      default: true
    },
    manualTime: String,
    quietHoursStart: {
      type: String,
      default: '22:00'
    },
    quietHoursEnd: {
      type: String,
      default: '07:00'
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for performance
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
```

**Step 3.2: Create JWT Utility**

`backend/src/utils/jwt.js`:
```javascript
const jwt = require('jsonwebtoken');

exports.generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '1h' }
  );
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
```

**Step 3.3: Create Auth Middleware**

`backend/src/middleware/auth.js`:
```javascript
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Check if user has required role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    next();
  };
};
```

**Step 3.4: Create Auth Routes**

`backend/src/routes/auth.routes.js`:
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /api/v1/auth/register
// @desc    Register new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['admin', 'doctor', 'nurse', 'coordinator'])
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, name, role, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        role: role || 'nurse',
        phone
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  }
);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user (include password for comparison)
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.active) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    }
  }
);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = router;
```

**Step 3.5: Register Auth Routes in Server**

Update `backend/src/server.js` - add after middleware section:
```javascript
// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);
```

**Step 3.6: Test Authentication**
```bash
cd backend
npm run dev

# Should see server running
```

**Test with Thunder Client in VS Code:**
1. Open Thunder Client extension
2. Create new request: POST http://localhost:5001/api/v1/auth/register
3. Body (JSON):
```json
{
  "email": "nurse@test.com",
  "password": "password123",
  "name": "Test Nurse",
  "role": "nurse"
}
```
4. Send - should get token back
5. Test login: POST http://localhost:5001/api/v1/auth/login
6. Test /me endpoint with token in Authorization header

**🎯 COMMIT #3:**
```bash
git add .
git commit -m "feat: implement JWT authentication system"
git push origin main
```

---

### Hour 8-16: Frontend Authentication Pages

**Step 4.1: Configure Tailwind CSS**

`frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
```

`frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors;
  }
  
  .btn-secondary {
    @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }
}
```

**Step 4.2: Create Frontend .env**
```bash
cd frontend
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_APP_NAME=Manual-RPM
EOF
```

**Step 4.3: Create API Service**

`frontend/src/services/api.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Step 4.4: Create Auth Context**

`frontend/src/context/AuthContext.jsx`:
```javascript
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Continue in next artifact due to length...**

**🎯 END OF DAY 1 - You've completed:**
- ✅ Project setup
- ✅ MongoDB connection
- ✅ Authentication backend
- ✅ Frontend foundation

**Time to commit and push:**
```bash
git add .
git commit -m "feat: setup frontend auth pages with Shadcn UI"
git push origin main
git tag v0.1.0-alpha
git push origin v0.1.0-alpha
```

**📌 Continue with Day 2 in the next section...**
