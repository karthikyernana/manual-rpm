# Vitalis Healthcare Dashboard - Comprehensive Testing Guide

## Quick Reference

| Feature             | Backend Status | Frontend Status | Priority |
| ------------------- | -------------- | --------------- | -------- |
| Authentication      | ✅ Working     | ✅ Working      | Critical |
| Patient CRUD        | ✅ Working     | ✅ Working      | Critical |
| Vitals Recording    | ✅ Working     | 🔶 Test         | High     |
| Template Creation   | ✅ Fixed       | 🔶 Verify       | High     |
| Patient Discharge   | ✅ Working     | 🔶 Test         | High     |
| Patient Readmission | ✅ Working     | 🔶 Test         | High     |
| Share Patient Modal | ✅ Enhanced    | 🔶 Test UI      | High     |
| Alerts System       | ✅ Working     | 🔶 Test         | High     |
| Reminders System    | ✅ Working     | 🔶 Test         | Medium   |
| Share Patient (QR)  | ✅ Working     | 🔶 Test         | Medium   |
| Export (PDF/CSV)    | ✅ Working     | 🔶 Test         | Medium   |
| Dashboard Stats     | ✅ Working     | 🔶 Test         | Medium   |
| Settings/Audit      | ✅ Working     | 🔶 Test         | Low      |

---

## 1. Authentication Tests

### 1.1 Login ✅

| Test Case           | Steps                                  | Expected Result             | Pass/Fail |
| ------------------- | -------------------------------------- | --------------------------- | --------- |
| Valid login         | Enter `admin@vitalis.com` / `Test@123` | Redirect to dashboard       | [ ]       |
| Invalid password    | Enter wrong password                   | "Invalid credentials" error | [ ]       |
| Empty fields        | Submit empty form                      | Validation errors shown     | [ ]       |
| Session persistence | Refresh page after login               | Stay logged in              | [ ]       |
| Logout              | Click user menu → Logout               | Redirect to login page      | [ ]       |

### 1.2 Token Handling

| Test Case     | Steps                             | Expected Result   | Pass/Fail |
| ------------- | --------------------------------- | ----------------- | --------- |
| Expired token | Wait/modify localStorage token    | Redirect to login | [ ]       |
| Invalid token | Set garbage token in localStorage | Redirect to login | [ ]       |

---

## 2. Patient Management Tests

### 2.1 Create Patient

| Test Case             | Steps                                      | Expected Result              | Pass/Fail |
| --------------------- | ------------------------------------------ | ---------------------------- | --------- |
| Valid patient         | Fill all required fields → Submit          | Patient created, toast shown | [ ]       |
| Duplicate MRN         | Use existing MRN                           | "MRN already exists" error   | [ ]       |
| Empty required fields | Submit with missing name/MRN               | Validation errors            | [ ]       |
| With custom template  | Select "Custom" template → Select template | Patient has custom template  | [ ]       |

### 2.2 View Patients

| Test Case         | Steps                      | Expected Result                      | Pass/Fail |
| ----------------- | -------------------------- | ------------------------------------ | --------- |
| List all patients | Navigate to /patients      | All admitted patients shown          | [ ]       |
| Filter discharged | Select "Discharged" filter | Only discharged patients shown       | [ ]       |
| Filter all        | Select "All" filter        | All patients (admitted + discharged) | [ ]       |
| Search patient    | Type in search box         | Filtered by name/MRN                 | [ ]       |

### 2.3 Patient Detail Page

| Test Case         | Steps                        | Expected Result                     | Pass/Fail |
| ----------------- | ---------------------------- | ----------------------------------- | --------- |
| View patient      | Click patient card           | Detail page loads with all sections | [ ]       |
| Vitals history    | Check Vitals History section | Previous vitals displayed           | [ ]       |
| Admission history | Check Admission History      | Past admissions listed              | [ ]       |

### 2.4 Edit Patient

| Test Case       | Steps                           | Expected Result  | Pass/Fail |
| --------------- | ------------------------------- | ---------------- | --------- |
| Edit details    | Click Edit → Change name → Save | Name updated     | [ ]       |
| Change ward/bed | Edit ward and bed               | Ward/bed updated | [ ]       |

### 2.5 Delete Patient

| Test Case       | Steps                      | Expected Result               | Pass/Fail |
| --------------- | -------------------------- | ----------------------------- | --------- |
| Delete patient  | Click Delete → Confirm     | Patient marked inactive       | [ ]       |
| Cascade cleanup | Delete patient with alerts | Alerts resolved automatically | [ ]       |

### 2.6 Discharge Patient

| Test Case       | Steps                                 | Expected Result              | Pass/Fail |
| --------------- | ------------------------------------- | ---------------------------- | --------- |
| Discharge       | Click Discharge → Add notes → Confirm | Status = "discharged"        | [ ]       |
| Alerts resolved | Check alerts after discharge          | Pending alerts auto-resolved | [ ]       |

### 2.7 Readmit Patient

| Test Case          | Steps                                | Expected Result                                  | Pass/Fail |
| ------------------ | ------------------------------------ | ------------------------------------------------ | --------- |
| Readmit discharged | View discharged patient → Readmit    | Status = "admitted", new admission history entry | [ ]       |
| New ward/bed       | Select different ward during readmit | Ward updated                                     | [ ]       |

### 2.8 Share Patient Modal (Enhanced UI)

| Test Case            | Steps                                    | Expected Result                    | Pass/Fail |
| -------------------- | ---------------------------------------- | ---------------------------------- | --------- |
| Generate share link  | Click Share → Generate Link              | Toast success, link displayed      | [ ]       |
| Copy link            | Click Copy button                        | Toast "copied", button shows state | [ ]       |
| QR code display      | Check QR code section                    | QR code renders with styling       | [ ]       |
| Open link in new tab | Click "Open Link" button                 | New tab opens with share URL       | [ ]       |
| Modal close          | Click X or Done button                   | Modal closes smoothly              | [ ]       |
| Loading states       | Observe during link generation           | Spinner shows, button disabled     | [ ]       |
| Error handling       | Simulate network error                   | Toast error message displayed      | [ ]       |
| Icons display        | Check all icons (Copy, X, QR, External)  | Icons render properly              | [ ]       |

---

## 3. Vitals Recording Tests

### 3.1 Record with Built-in Templates

| Test Case         | Steps                             | Expected Result                        | Pass/Fail |
| ----------------- | --------------------------------- | -------------------------------------- | --------- |
| General template  | Record vital → All fields visible | 6 fields: temp, HR, BP, SpO2, RR       | [ ]       |
| Cardiac template  | Patient with cardiac template     | 8 fields including edema, chest pain   | [ ]       |
| Diabetic template | Patient with diabetic template    | 8 fields including glucose, foot check | [ ]       |

### 3.2 Record with Custom Template

| Test Case              | Steps                        | Expected Result                    | Pass/Fail |
| ---------------------- | ---------------------------- | ---------------------------------- | --------- |
| Custom template fields | Patient with custom template | Custom fields shown                | [ ]       |
| Submit custom vitals   | Enter values → Submit        | Vitals saved with correct template | [ ]       |

### 3.3 Abnormal Values

| Test Case          | Steps                 | Expected Result               | Pass/Fail |
| ------------------ | --------------------- | ----------------------------- | --------- |
| Out of range value | Enter BP 200/120      | Vitals flagged, alert created | [ ]       |
| Alert severity     | Enter critical values | Alert marked as "critical"    | [ ]       |

---

## 4. Template Management Tests (JUST FIXED)

### 4.1 Create Template ✅

| Test Case       | Steps                                         | Expected Result               | Pass/Fail |
| --------------- | --------------------------------------------- | ----------------------------- | --------- |
| Create template | Settings → Templates → New → Fill form → Save | Template created successfully | [ ]       |
| Multiple fields | Add 3+ fields to template                     | All fields saved              | [ ]       |
| Duplicate name  | Create template with existing name            | "Name already exists" error   | [ ]       |

### 4.2 Edit Template

| Test Case     | Steps                              | Expected Result  | Pass/Fail |
| ------------- | ---------------------------------- | ---------------- | --------- |
| Edit template | Click edit → Change name → Save    | Template updated | [ ]       |
| Add fields    | Add new field to existing template | Field added      | [ ]       |

### 4.3 Delete Template

| Test Case       | Steps                  | Expected Result  | Pass/Fail |
| --------------- | ---------------------- | ---------------- | --------- |
| Delete template | Click delete → Confirm | Template removed | [ ]       |

---

## 5. Alerts System Tests

### 5.1 Alert Generation

| Test Case           | Steps                  | Expected Result                     | Pass/Fail |
| ------------------- | ---------------------- | ----------------------------------- | --------- |
| Auto-generate alert | Record abnormal vitals | New alert appears                   | [ ]       |
| Alert severity      | Check severity levels  | Correct severity based on deviation | [ ]       |

### 5.2 Alert Management

| Test Case          | Steps                 | Expected Result         | Pass/Fail |
| ------------------ | --------------------- | ----------------------- | --------- |
| Acknowledge alert  | Click Acknowledge     | Status → "acknowledged" | [ ]       |
| Resolve alert      | Click Resolve         | Status → "resolved"     | [ ]       |
| Filter by status   | Use status dropdown   | Filtered correctly      | [ ]       |
| Filter by severity | Use severity dropdown | Filtered correctly      | [ ]       |

---

## 6. Reminders System Tests

### 6.1 Create Reminder

| Test Case       | Steps                  | Expected Result                      | Pass/Fail |
| --------------- | ---------------------- | ------------------------------------ | --------- |
| Create reminder | Fill form → Submit     | Reminder created with scheduled time | [ ]       |
| Required fields | Submit without patient | Validation error                     | [ ]       |

### 6.2 Reminder Actions

| Test Case         | Steps          | Expected Result      | Pass/Fail |
| ----------------- | -------------- | -------------------- | --------- |
| Complete reminder | Click Complete | Status → "completed" | [ ]       |
| Snooze reminder   | Click Snooze   | Time extended        | [ ]       |
| Cancel reminder   | Click Cancel   | Status → "cancelled" | [ ]       |

---

## 7. Share Patient (QR Code) Tests

### 7.1 Generate Share Link

| Test Case     | Steps                  | Expected Result            | Pass/Fail |
| ------------- | ---------------------- | -------------------------- | --------- |
| Generate link | Click Share → Generate | QR code and link displayed | [ ]       |
| Copy link     | Click copy button      | Link copied to clipboard   | [ ]       |

### 7.2 Access Shared Patient

| Test Case    | Steps                          | Expected Result                 | Pass/Fail |
| ------------ | ------------------------------ | ------------------------------- | --------- |
| Valid link   | Open share link in new browser | Patient data visible (no login) | [ ]       |
| Expired link | Try link after 7 days          | "Link expired" error            | [ ]       |
| Revoked link | Revoke link → Try access       | "Link revoked" error            | [ ]       |

---

## 8. Export Tests

### 8.1 PDF Export

| Test Case    | Steps             | Expected Result                | Pass/Fail |
| ------------ | ----------------- | ------------------------------ | --------- |
| Export PDF   | Click PDF button  | PDF downloads with vitals data | [ ]       |
| PDF branding | Check PDF content | Vitalis logo and patient info  | [ ]       |

### 8.2 CSV Export

| Test Case          | Steps                    | Expected Result         | Pass/Fail |
| ------------------ | ------------------------ | ----------------------- | --------- |
| Export vitals CSV  | Click CSV button         | CSV file downloads      | [ ]       |
| Export history CSV | Export admission history | History CSV downloads   | [ ]       |
| CSV format         | Open in Excel            | Data properly formatted | [ ]       |

---

## 9. Dashboard Tests

### 9.1 Stats Display

| Test Case       | Steps                      | Expected Result        | Pass/Fail |
| --------------- | -------------------------- | ---------------------- | --------- |
| Patient count   | Check active patients stat | Matches actual count   | [ ]       |
| Alerts count    | Check new alerts stat      | Matches pending alerts | [ ]       |
| Reminders count | Check pending reminders    | Matches actual count   | [ ]       |

### 9.2 Activity Feed

| Test Case       | Steps               | Expected Result      | Pass/Fail |
| --------------- | ------------------- | -------------------- | --------- |
| Recent activity | Check activity feed | Shows recent vitals  | [ ]       |
| Link to patient | Click activity item | Navigates to patient | [ ]       |

---

## 10. Settings Tests

### 10.1 System Settings (Admin Only)

| Test Case            | Steps                         | Expected Result   | Pass/Fail |
| -------------------- | ----------------------------- | ----------------- | --------- |
| Update interval      | Change vitals interval → Save | Setting persisted | [ ]       |
| Toggle notifications | Toggle email notifications    | Setting persisted | [ ]       |
| Settings persist     | Refresh page                  | Settings retained | [ ]       |

### 10.2 Ward Management

| Test Case   | Steps            | Expected Result    | Pass/Fail |
| ----------- | ---------------- | ------------------ | --------- |
| Add ward    | Enter name → Add | Ward added to list | [ ]       |
| Edit ward   | Change ward name | Ward updated       | [ ]       |
| Delete ward | Remove ward      | Ward deactivated   | [ ]       |

### 10.3 User Management (Admin Only)

| Test Case       | Steps              | Expected Result   | Pass/Fail |
| --------------- | ------------------ | ----------------- | --------- |
| Create user     | Fill form → Create | User added        | [ ]       |
| Edit user       | Change role/name   | User updated      | [ ]       |
| Deactivate user | Deactivate user    | User cannot login | [ ]       |

---

## 11. Audit Logs Tests (Admin Only)

### 11.1 Log Viewing

| Test Case        | Steps                      | Expected Result             | Pass/Fail |
| ---------------- | -------------------------- | --------------------------- | --------- |
| View logs        | Navigate to Audit Logs tab | Logs displayed with actions | [ ]       |
| Filter by action | Use action filter          | Filtered correctly          | [ ]       |
| Filter by date   | Use date range             | Correct date range          | [ ]       |

---

## 12. UI/UX Tests

### 12.1 Responsive Design

| Test Case   | Steps                 | Expected Result           | Pass/Fail |
| ----------- | --------------------- | ------------------------- | --------- |
| Mobile view | Resize to 375px width | Layout adapts, all usable | [ ]       |
| Tablet view | Resize to 768px width | Layout adapts properly    | [ ]       |
| Desktop     | Full width            | Full layout shown         | [ ]       |

### 12.2 Theme

| Test Case  | Steps               | Expected Result       | Pass/Fail |
| ---------- | ------------------- | --------------------- | --------- |
| Dark theme | Default theme       | Dark theme applied    | [ ]       |
| Colors     | Check button colors | Consistent with brand | [ ]       |

### 12.3 Loading States

| Test Case      | Steps                | Expected Result            | Pass/Fail |
| -------------- | -------------------- | -------------------------- | --------- |
| Page loading   | Navigate to any page | Skeleton/loader shown      | [ ]       |
| Button loading | Submit form          | Button shows loading state | [ ]       |

### 12.4 Error Handling

| Test Case     | Steps              | Expected Result        | Pass/Fail |
| ------------- | ------------------ | ---------------------- | --------- |
| Network error | Disconnect network | Error toast shown      | [ ]       |
| Server error  | Cause 500 error    | Friendly error message | [ ]       |

---

## Bug Fixes Applied in This Session

| Bug                       | Root Cause                                          | Fix Applied                                              |
| ------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| Patient delete failing    | Alert.notes is string, cascade used $push for array | Changed to simple string assignment in patient.routes.js |
| Template creation failing | sanitizeObject() converting arrays to objects       | Added Array.isArray() check in sanitize.js               |

---

## Known Issues to Watch

1. **Share modal UI**: Appears fine in screenshot but verify QR generation works
2. **Custom template vitals entry**: Verify correct fields display for custom templates
3. **Notification system**: Email notifications require SMTP configuration

---

## Test Credentials

| Role   | Email              | Password |
| ------ | ------------------ | -------- |
| Admin  | admin@vitalis.com  | Test@123 |
| Nurse  | nurse@vitalis.com  | Test@123 |
| Doctor | doctor@vitalis.com | Test@123 |
