# Email Notifications Setup Guide

## Overview
Email notifications have been implemented for reminder creation. When a reminder is created, an email will automatically be sent to the user who created it (for manual reminders) or to the patient's primary nurse (for auto-generated vitals reminders).

## Current Email Configuration

Your `.env` file already has email configuration:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=karthikyernana@gmail.com
EMAIL_PASS=fqaa wnyj jbgi osja
```

## Important: Gmail App Password

The `EMAIL_PASS` should be a **Gmail App Password**, not your regular Gmail password. 

### To generate a Gmail App Password:
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left menu
3. Under "How you sign in to Google", enable **2-Step Verification** (if not already enabled)
4. Once 2FA is enabled, go back to Security
5. Scroll down to "2-Step Verification" section
6. Click on **App passwords**
7. Select "Mail" as the app and "Other" as the device
8. Enter "Vitalis Notifications" as the name
9. Click **Generate**
10. Copy the 16-character password (remove spaces)
11. Update `EMAIL_PASS` in your `.env` file with this app password

## Email Features Implemented

### 1. Manual Reminder Creation
When you create a reminder manually through the UI:
- An email is sent to your email address (the logged-in user)
- Email contains reminder details, patient info, and due date/time
- Styled professional healthcare email template

### 2. Auto-Generated Reminders
When the scheduler creates vitals reminders automatically:
- Email is sent to the patient's primary nurse
- Only if the nurse has an email address in their profile

### 3. Email Template
The emails include:
- Professional healthcare branding
- Priority badge (LOW/MEDIUM/HIGH)
- Reminder type (Vitals Due, Medication, etc.)
- Patient name and MRN
- Due date and time formatted nicely
- Direct link to the reminders dashboard
- Responsive design for mobile devices

## Testing Email Notifications

### Test 1: Create a Manual Reminder
1. Go to **Reminders** page
2. Click **Create Reminder** button
3. Fill in the form:
   - Select a patient
   - Enter title (e.g., "Test Reminder")
   - Select type and priority
   - **IMPORTANT**: Enter a specific time in the time field
   - Select due date
4. Click **Create Reminder**
5. Check your email inbox (karthikyernana@gmail.com)

### Expected Result:
- Reminder appears in the UI with the CORRECT time you entered
- You receive an email notification within 1-2 minutes
- Email shows all reminder details

## Time Handling Improvements

### Issue Fixed:
Previously, all reminders showed 5:30 AM regardless of the time you entered.

### Solution Implemented:
1. **Backend**: Now properly combines the `dueDate` and `customTime` fields
   - If you enter a specific time, it's applied to the date
   - Time is stored in 24-hour format (HH:MM)

2. **Frontend**: Display logic updated
   - If `customTime` exists: Shows full date and time
   - If no `customTime`: Shows only the date (no time)

### Example:
- **With time**: "Dec 23, 2025, 02:30 PM"
- **Without time**: "Dec 23, 2025"

## Troubleshooting

### Emails Not Receiving?

1. **Check Gmail App Password**
   - Verify the `EMAIL_PASS` is a valid app password
   - Re-generate if necessary

2. **Check Server Logs**
   - Look for "✉️ Email service initialized" message
   - Look for "✉️ Reminder email sent to..." message
   - Any email errors will be logged

3. **Check Spam Folder**
   - Emails might be filtered as spam initially
   - Mark as "Not Spam" to whitelist

4. **Check User Email**
   - Verify your user account has an email address
   - Log in to the app and check your profile

### Email Service Not Configured Warning?

If you see "⚠️ Email service not configured" in logs:
- Verify all EMAIL_* variables are set in `.env`
- Restart the backend server
- Check for typos in environment variable names

## Email Configuration for Production

For production deployment (Render, Heroku, etc.):

1. Add environment variables in hosting platform:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=https://your-frontend-url.com
   ```

2. The email link will use `FRONTEND_URL` to generate dashboard links

## Alternative Email Providers

### Using SendGrid (Recommended for Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Using Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

### Using Outlook/Office365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-password
```

## Code Changes Made

### Files Modified:
1. `backend/src/services/emailService.js` - NEW FILE
   - Email sending logic
   - HTML email templates
   - Priority color coding

2. `backend/src/routes/reminder.routes.js`
   - Added email notification on reminder creation
   - Fixed time handling (combine dueDate + customTime)

3. `backend/src/services/scheduler.js`
   - Added email notification for auto-generated reminders
   - Sends to patient's primary nurse

4. `frontend/src/pages/RemindersPage.jsx`
   - Fixed time display logic
   - Shows time only when customTime exists

5. `backend/package.json`
   - Added `nodemailer` dependency

## Next Steps

1. **Generate Gmail App Password** (if not already done)
2. **Update .env with app password**
3. **Restart backend server** (if not auto-restarted)
4. **Test by creating a reminder with specific time**
5. **Check your email**

## Support

If emails still don't work after following this guide:
- Check backend server logs for error messages
- Verify Gmail App Password is correct
- Ensure 2FA is enabled on your Gmail account
- Try sending a test email using nodemailer directly

## Summary

✅ **Time Issue Fixed**: Custom times now work correctly  
✅ **Email Notifications Added**: Automatic emails on reminder creation  
✅ **Professional Email Template**: Healthcare-themed design  
✅ **Production Ready**: Easy to configure for deployment  
