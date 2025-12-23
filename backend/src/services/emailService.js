const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

const initializeTransporter = () => {
  if (transporter) return transporter;

  // Check if email configuration is provided
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn('⚠️  Email service not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  console.log('✉️  Email service initialized');
  return transporter;
};

/**
 * Send reminder notification email
 */
const sendReminderEmail = async ({ to, patient, reminder }) => {
  const emailTransporter = initializeTransporter();
  
  if (!emailTransporter) {
    console.log('Email service not configured, skipping email notification');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"Vitalis Health" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `⏰ Reminder: ${reminder.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .reminder-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${getPriorityColor(reminder.priority)}; }
            .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: ${getPriorityBg(reminder.priority)}; color: ${getPriorityColor(reminder.priority)}; }
            .info-row { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 6px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
            .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🩺 Vitalis Patient Monitoring</h1>
            </div>
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">You have a reminder!</h2>
              
              <div class="reminder-card">
                <div style="margin-bottom: 15px;">
                  <span class="priority-badge">${reminder.priority} priority</span>
                  <span style="margin-left: 10px; color: #6b7280; font-size: 14px;">${reminder.type.replace('_', ' ').toUpperCase()}</span>
                </div>
                
                <h3 style="margin: 10px 0; color: #1f2937;">${reminder.title}</h3>
                ${reminder.description ? `<p style="color: #6b7280; margin: 10px 0;">${reminder.description}</p>` : ''}
                
                <div class="info-row">
                  <strong>Patient:</strong> ${patient.name} (MRN: ${patient.mrn})
                </div>
                
                <div class="info-row">
                  <strong>Due:</strong> ${new Date(reminder.dueDate).toLocaleString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Please log in to your Vitalis dashboard to complete this reminder.
              </p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reminders" class="btn">
                View Dashboard
              </a>
            </div>
            <div class="footer">
              <p>This is an automated reminder from Vitalis Patient Monitoring System</p>
              <p>&copy; ${new Date().getFullYear()} Vitalis Health. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✉️  Reminder email sent to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Helper function to get priority color
 */
const getPriorityColor = (priority) => {
  const colors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#3B82F6'
  };
  return colors[priority] || colors.medium;
};

/**
 * Helper function to get priority background color
 */
const getPriorityBg = (priority) => {
  const colors = {
    high: '#FEE2E2',
    medium: '#FEF3C7',
    low: '#DBEAFE'
  };
  return colors[priority] || colors.medium;
};

/**
 * Send test email to verify configuration
 */
const sendTestEmail = async (to) => {
  const emailTransporter = initializeTransporter();
  
  if (!emailTransporter) {
    throw new Error('Email service not configured');
  }

  try {
    await emailTransporter.sendMail({
      from: `"Vitalis Health" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Vitalis Email Service Test',
      html: '<h2>Email service is working correctly!</h2><p>You can now receive reminder notifications.</p>'
    });
    return { success: true, message: 'Test email sent successfully' };
  } catch (error) {
    console.error('Test email error:', error);
    throw error;
  }
};

module.exports = {
  sendReminderEmail,
  sendTestEmail
};
