# Vitalis - Testing Checklist

## 📥 How to Insert Demo Data into MongoDB

### Step 1: Navigate to backend folder

```bash
cd "/Users/karthikyernana/karthikyernana /mernpro/backend"
```

### Step 2: Run the seed script

```bash
node seed-data.js
```

### Step 3: Verify output

You should see:

```
🌱 VITALIS DATABASE SEED SCRIPT
================================
📡 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Clearing existing data...
...
🎉 SEED COMPLETE!
```

---

## 🔐 Demo Login Credentials

| Role       | Email              | Password |
| ---------- | ------------------ | -------- |
| **Admin**  | admin@vitalis.com  | Test@123 |
| **Doctor** | doctor@vitalis.com | Test@123 |
| **Nurse**  | nurse@vitalis.com  | Test@123 |

---

## ✅ Feature Testing Checklist

### 1. Authentication

- [ ] Login with admin@vitalis.com / Test@123
- [ ] Login with doctor@vitalis.com / Test@123
- [ ] Login with nurse@vitalis.com / Test@123
- [ ] Check wrong password shows error
- [ ] Logout works correctly

### 2. Dashboard

- [ ] All 4 stat cards show numbers (not 0)
- [ ] Today's Vitals shows real count
- [ ] Recent Activity shows login event
- [ ] Quick Actions buttons work

### 3. Patients Page

- [ ] List shows 8 demo patients
- [ ] Search by name works (try "John")
- [ ] Search by MRN works (try "MRN001")
- [ ] Filter by ward works
- [ ] Click patient opens detail page
- [ ] "Add Patient" button works

### 4. Patient Detail Page

- [ ] Patient info displays correctly
- [ ] Vitals history shows records
- [ ] Vitals chart displays (if implemented)
- [ ] "Record Vitals" button opens form
- [ ] PDF export downloads file
- [ ] CSV export downloads file

### 5. Vitals Recording

- [ ] Select template (general/cardiac/diabetic)
- [ ] Fill in vitals values
- [ ] Submit creates new record
- [ ] Flagged vitals create alert
- [ ] Toast notification shows success

### 6. Alerts Page

- [ ] Shows active alerts
- [ ] Filter by status works
- [ ] Filter by severity works
- [ ] "Resolve" button works
- [ ] Alert count updates on dashboard

### 7. Reminders Page

- [ ] Shows pending reminders
- [ ] Filter tabs work (Pending/Snoozed/Completed/All)
- [ ] "Create Reminder" opens modal
- [ ] Snooze button works
- [ ] Complete button works
- [ ] Reminder linked to correct patient

### 8. Settings Page

- [ ] All 4 tabs visible (Templates, Users, System, Audit)

### 9. Settings → Vitals Templates

- [ ] Shows existing templates
- [ ] Create new template works
- [ ] Edit template works
- [ ] Delete template works

### 10. Settings → User Management

- [ ] Shows all 5 demo users
- [ ] Filter by role works
- [ ] Create new user works
- [ ] Edit user works
- [ ] Toggle user active/inactive
- [ ] (Admin only - check access control)

### 11. Settings → System Settings

- [ ] Ward list shows 7 wards
- [ ] Add new ward works
- [ ] Edit ward works
- [ ] Delete ward works
- [ ] Vitals interval dropdown works
- [ ] Save All Settings persists data
- [ ] Refresh page - settings remain

### 12. Settings → Audit Logs

- [ ] Shows real logs (not "coming soon")
- [ ] Filter by action type works
- [ ] Filter by date range works
- [ ] Export CSV works
- [ ] Pagination works

### 13. Profile Modal (Click user menu → Account Settings)

- [ ] Shows current user info
- [ ] Update name works
- [ ] Update email works
- [ ] Change password works
- [ ] Profile picture upload (if implemented)

### 14. Theme Toggle

- [ ] Click moon/sun icon in navbar
- [ ] Theme changes (dark/light)
- [ ] Preference persists after refresh

### 15. Responsive Design

- [ ] Resize browser to mobile width
- [ ] Navigation collapses to hamburger menu
- [ ] Tables scroll horizontally
- [ ] Forms are usable on mobile

### 16. QR Code Sharing (Patient Detail)

- [ ] Click "Share" button
- [ ] QR code displays
- [ ] Copy link works
- [ ] Public view URL works

### 17. Export Features

- [ ] Patient PDF has Vitalis branding
- [ ] Patient CSV includes patient name in filename
- [ ] Audit logs CSV export works

---

## 🐛 Things to Watch For

| Issue               | What to Check                                      |
| ------------------- | -------------------------------------------------- |
| Blank page          | Check browser console for errors                   |
| 401 Unauthorized    | Token expired - re-login                           |
| Data not loading    | Check backend terminal for errors                  |
| Settings not saving | Ensure you're logged in as admin                   |
| Audit logs empty    | Perform some actions first (login, create patient) |

---

## 🔄 Reset Demo Data

To reset all demo data and start fresh:

```bash
cd "/Users/karthikyernana/karthikyernana /mernpro/backend"
node seed-data.js
```

The script automatically clears old demo data before inserting new data.

---

## 📊 Demo Data Summary

| Collection | Count  | Description                     |
| ---------- | ------ | ------------------------------- |
| Users      | 5      | 1 admin, 2 doctors, 2 nurses    |
| Patients   | 8      | Various wards, ages, genders    |
| Vitals     | ~50-80 | Random records per patient      |
| Alerts     | ~10    | Various severities and statuses |
| Reminders  | ~15    | Various types and priorities    |
| Templates  | 2      | Custom vitals templates         |
| Audit Logs | 20     | Sample activity logs            |
| Settings   | 1      | 7 wards configured              |

---

## ✨ All Tests Passing?

If all checkboxes above are ticked, your Vitalis installation is fully functional! 🎉
