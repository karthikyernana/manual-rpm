# ⚡ CRITICAL FIXES REQUIRED - Manual-RPM

**URGENT:** These 3 issues MUST be fixed before any public deployment.

---

## 🔴 ISSUE #1: EXPOSED CREDENTIALS (SEVERITY: CRITICAL)

### **The Problem**
Your `backend/.env` file contains real credentials that could compromise:
- MongoDB database with patient data
- Authentication system (JWT secret)
- Email account

### **Files Affected**
- `backend/.env` - Contains real passwords
- Potentially in Git history if ever committed

### **Fix Steps (15-20 minutes)**

**Step 1: Check Git History**
```bash
cd "/Users/karthikyernana/karthikyernana /mernpro"
git log --all --full-history -- backend/.env
```

**If you see output (file was committed):**
```bash
# 🚨 CREDENTIALS WERE PUSHED TO GITHUB - ACT IMMEDIATELY 🚨

# 1. Change MongoDB password
# Log into MongoDB Atlas → Database Access → manualrpm_user → Edit → Change Password
# Update MONGODB_URI in backend/.env with new password

# 2. Generate new JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and replace JWT_SECRET in backend/.env

# 3. Revoke email app password
# Google Account → Security → App Passwords → Delete old → Create new
# Replace EMAIL_PASS in backend/.env

# 4. Remove from Git
git rm --cached backend/.env
git commit -m "security: remove exposed credentials"
git push origin main
```

**If no output (file was never committed):**
```bash
# Good! But still secure it:
grep "^\.env$" .gitignore || echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env is ignored"
```

**Step 2: Create Template**
```bash
cd backend
cat > .env.example << 'EOF'
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration (Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-key-at-least-32-characters
JWT_EXPIRY=1h

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional - Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="App Name" <your-email@gmail.com>
EOF
```

**Step 3: Update README**
Add to README.md setup section:
```markdown
## Environment Setup
1. Copy `.env.example` to `.env` in both backend and frontend
2. Update all placeholder values with your actual credentials
3. **Never commit `.env` files to version control**

### Backend Environment Variables
- Get MongoDB URI from MongoDB Atlas
- Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Get email app password from Google Account Security settings
```

---

## 🔴 ISSUE #2: PORT CONFIGURATION MISMATCH (SEVERITY: CRITICAL)

### **The Problem**
Your backend and frontend are configured for different ports, which will cause API connection failures:
- Backend `.env`: `PORT=3000`
- Frontend `.env`: `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- Server.js fallback: `const PORT = process.env.PORT || 5000`

### **Fix Steps (5 minutes)**

**Choose ONE option:**

**Option A: Use Port 5000 (Recommended for Render deployment)**
```bash
# Update backend/.env
sed -i '' 's/PORT=3000/PORT=5000/' backend/.env

# Update frontend/.env
sed -i '' 's/localhost:3000/localhost:5000/' frontend/.env
```

**OR Option B: Use Port 3000 (If you prefer)**
```bash
# Verify backend/.env has PORT=3000
# Verify frontend/.env has localhost:3000
# This is your current setup - just ensure consistency
```

**Verify the fix:**
```bash
# Start backend
cd backend && npm run dev
# Should see: "🚀 Server running on port 5000" (or 3000)

# Start frontend (new terminal)
cd frontend && npm run dev
# Should see: "Local: http://localhost:5173"

# Test API connection
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"Manual-RPM API is running"}
```

**Update Documentation:**
```bash
# Add to README.md
cat >> README.md << 'EOF'

## Running the Application

**Backend:** http://localhost:5000
**Frontend:** http://localhost:5173
**API Base:** http://localhost:5000/api/v1

Start backend: `cd backend && npm run dev`
Start frontend: `cd frontend && npm run dev`
EOF
```

---

## 🔴 ISSUE #3: VITALS VALIDATION ERROR HANDLING (SEVERITY: CRITICAL)

### **The Problem**
The vitals pre-save hook queries the database but doesn't handle errors. If the query fails:
- Vitals save without validation
- Abnormal values not flagged
- Alerts not generated
- **Patient safety risk**

### **File to Edit**
`backend/src/models/Vitals.js` - lines 102-148

### **Current Code (Broken)**
```javascript
vitalsSchema.pre('save', async function() {
  let templateFields = null;
  
  if (this.template === 'custom' && this.customTemplateId) {
    const VitalsTemplate = mongoose.model('VitalsTemplate');
    const customTemplate = await VitalsTemplate.findById(this.customTemplateId);
    // ❌ No error handling - if findById throws, entire function fails silently
    if (customTemplate) {
      templateFields = customTemplate.fields;
    }
  }
  // ... rest of code
```

### **Fixed Code**
Replace the entire pre-save hook with this:

```javascript
vitalsSchema.pre('save', async function() {
  let templateFields = null;
  
  try {
    // Load template fields
    if (this.template === 'custom' && this.customTemplateId) {
      const VitalsTemplate = mongoose.model('VitalsTemplate');
      const customTemplate = await VitalsTemplate.findById(this.customTemplateId);
      
      if (!customTemplate) {
        throw new Error(`Custom template ${this.customTemplateId} not found`);
      }
      
      templateFields = customTemplate.fields;
    } else if (this.template && VITAL_TEMPLATES[this.template]) {
      const template = VITAL_TEMPLATES[this.template];
      if (!template) {
        throw new Error(`Invalid template: ${this.template}`);
      }
      templateFields = template.fields;
    } else {
      throw new Error(`No valid template specified: ${this.template}`);
    }

    if (!templateFields || !Array.isArray(templateFields)) {
      console.warn(`⚠️  No template fields found for vitals ${this._id}`);
      return;
    }

    // Reset flagged state
    this.flagged = false;
    this.flaggedFields = [];

    // Validate each field against normal ranges
    templateFields.forEach(field => {
      const value = this.vitals[field.name];
      
      // Skip if no value or no normal range defined
      if (value === undefined || value === null || !field.normal) return;
      
      // Skip boolean fields
      if (field.unit === 'boolean') return;

      // Check if value is outside normal range
      const normalMin = field.normal.min;
      const normalMax = field.normal.max;
      
      if (normalMin !== undefined && normalMax !== undefined) {
        if (value < normalMin || value > normalMax) {
          this.flagged = true;
          this.flaggedFields.push({
            field: field.name,
            value: value,
            normalRange: field.normal
          });
        }
      }
    });
    
    console.log(`✅ Vitals validation complete: flagged=${this.flagged}, fields=${this.flaggedFields.length}`);
    
  } catch (error) {
    console.error('❌ Error in vitals pre-save hook:', error);
    // Rethrow to prevent saving invalid vitals
    throw new Error(`Vitals validation failed: ${error.message}`);
  }
});
```

### **Test the Fix**
Add this test to `backend/tests/integration/vitals.test.js`:

```javascript
test('should reject vitals with invalid custom template ID', async () => {
  const response = await request(app)
    .post('/api/v1/vitals')
    .set('Authorization', `Bearer ${token}`)
    .send({
      patient: patientId,
      template: 'custom',
      customTemplateId: '000000000000000000000000', // Invalid ObjectId
      vitals: { heartRate: 80 }
    })
    .expect(500);
  
  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('validation failed');
});

test('should flag vitals with abnormal values', async () => {
  const response = await request(app)
    .post('/api/v1/vitals')
    .set('Authorization', `Bearer ${token}`)
    .send({
      patient: patientId,
      template: 'general',
      vitals: {
        heartRate: 150, // Above normal range (60-100)
        temperature: 98.6,
        bloodPressureSystolic: 120
      }
    })
    .expect(201);
  
  expect(response.body.data.vitals.flagged).toBe(true);
  expect(response.body.data.vitals.flaggedFields).toHaveLength(1);
  expect(response.body.data.vitals.flaggedFields[0].field).toBe('heartRate');
});
```

Run test:
```bash
cd backend
npm test -- --testPathPattern=vitals
```

---

## ✅ VERIFICATION CHECKLIST

After implementing all 3 fixes:

- [ ] `.env` files secured (not in git, template created)
- [ ] If credentials were exposed, all passwords rotated
- [ ] Backend starts on correct port (5000 or 3000)
- [ ] Frontend API calls go to correct backend URL
- [ ] Vitals pre-save hook has try-catch
- [ ] Vitals validation test passes
- [ ] README updated with setup instructions
- [ ] Both backend and frontend start without errors
- [ ] Can login and create a patient
- [ ] Can record vitals and see alert generated

**Test End-to-End:**
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: http://localhost:5173
# Login → Create Patient → Record Abnormal Vitals → Verify Alert Created
```

---

## 🆘 IF YOU NEED HELP

**Credentials Were Exposed:**
- Priority: Rotate ALL passwords within 1 hour
- MongoDB Atlas: Database Access → Edit User
- JWT Secret: Generate new with crypto.randomBytes
- Email: Google Security → App Passwords → Revoke old

**Port Issues:**
- Check `lsof -i :5000` - see what's using the port
- Kill process: `kill -9 <PID>`
- Restart backend: `cd backend && npm run dev`
- Check frontend logs for connection errors

**Vitals Validation:**
- Check logs for "Error in vitals pre-save hook"
- Verify template exists before recording vitals
- Test with built-in template first (general, cardiac, diabetic)

---

**Estimated Time to Fix All Issues: 30-45 minutes**

**Next Steps After Fixes:**
1. Review full report in `CODEBASE_REVIEW_REPORT.md`
2. Work on high-priority issues (test coverage, console.logs)
3. Deploy to staging environment
4. Run full QA testing

---

**Generated:** December 23, 2025  
**Priority:** URGENT - Fix before any deployment
