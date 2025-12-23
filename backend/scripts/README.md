# Production Scripts

This directory contains utility scripts for production deployment and maintenance.

## Available Scripts

### 1. `seed-admin.js`
Creates the default admin account for the application.

**Usage:**
```bash
npm run seed:admin
```

**Default Credentials:**
- Email: `admin@manual-rpm.com`
- Password: `Admin@123`

**Environment Variables:**
- `ADMIN_PASSWORD` (optional) - Custom admin password instead of default

**Note:** If admin already exists, the script will skip creation and exit gracefully.

---

### 2. `reset-production.js`
⚠️ **DANGER ZONE** - Clears entire database and recreates admin account.

**Usage:**
```bash
npm run reset:production
```

**What it does:**
1. Drops all MongoDB collections
2. Automatically runs `seed-admin.js` to recreate admin
3. Leaves you with a clean database ready for production

**Safety Features:**
- 5-second countdown before execution (10 seconds in production)
- Warns you about data loss
- Shows which database will be affected

**When to use:**
- Before initial production deployment
- To clear test data
- Fresh start after major schema changes

**⚠️ Warning:** This is irreversible! Back up important data first.

---

## Best Practices

1. **Always test locally first**
   ```bash
   # Test with local database
   npm run reset:production
   npm run dev
   ```

2. **Never run reset in production without backup**
   - Export critical data first
   - Confirm you're okay losing all data

3. **Change admin password after seeding**
   - Login immediately after deployment
   - Change password in Settings
   - Use a strong password (20+ characters)

4. **Use environment variables for custom admin password**
   ```bash
   # In .env or Render environment
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

---

## Troubleshooting

### "Admin already exists"
This is normal! The script detected an existing admin and skipped creation.

### "Error connecting to MongoDB"
Check your `MONGODB_URI` environment variable:
```bash
echo $MONGODB_URI  # Should show your connection string
```

### "Cannot find module '../src/models/User'"
Make sure you're running from the backend directory:
```bash
cd backend
npm run seed:admin
```

### Database won't drop
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify user has read/write permissions
- Ensure connection string includes database name

---

## Production Deployment Workflow

1. **Clear test data:**
   ```bash
   npm run reset:production
   ```

2. **Deploy backend to Render**

3. **Seed admin in production:**
   - Use Render Shell
   - Run: `npm run seed:admin`

4. **Login and secure:**
   - Change admin password immediately
   - Create additional users as needed

---

For complete deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md)
