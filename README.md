# Manual-RPM - Remote Patient Monitoring System

A full-stack MERN healthcare application for monitoring patient vitals with real-time alerts, reminders, and comprehensive audit trails.

## 🚀 Features

### Core Features
- **Authentication & Authorization** - JWT-based auth with role-based access (Admin/Doctor/Nurse/Coordinator)
- **Patient Management** - Full CRUD with discharge/readmission workflows and admission history
- **Vitals Tracking** - Dynamic templates (General/Cardiac/Diabetic) with automatic threshold monitoring
- **Alert System** - Intelligent rule engine with severity-based alerts and workflow management
- **Reminder System** - Automated scheduling with node-cron, email notifications, and quiet hours support
- **Real-time Notifications** - Server-Sent Events (SSE) for instant browser notifications
- **Email Notifications** - Nodemailer integration with professional HTML templates
- **Sharing System** - Secure JWT links with QR codes (7-day expiration)
- **Export & Reporting** - PDF and CSV exports with formatted reports
- **Data Visualization** - 7-day trend charts with Recharts

### Advanced Features
- **Admin Panel** - User management, audit logs, and system monitoring
- **System Settings** - Ward/bed management with dynamic configuration
- **Audit Trail** - Comprehensive logging of all system actions
- **Dashboard Analytics** - Real-time statistics with optimized single API call
- **Rate Limiting** - API protection (500 req/15min general, 20 req/15min auth)
- **Security Hardening** - Helmet, CORS, input sanitization, body size limits

## 📦 Tech Stack

**Frontend:**
- React 19.2.0 + Vite 7.2.4
- React Router v7.10.1
- TailwindCSS 3.4.19
- Framer Motion 12.23.26
- Recharts 3.6.0
- React Hot Toast 2.6.0
- Axios 1.13.2
- jsPDF 3.0.4 + jsPDF-AutoTable 5.0.2
- QRCode 1.5.4
- Lucide React 0.561.0

**Backend:**
- Node.js 18+ + Express 5.2.1
- MongoDB 9.0.1 + Mongoose
- JWT Authentication (jsonwebtoken 9.0.3)
- bcryptjs 3.0.3
- Nodemailer 7.0.12
- node-cron 4.2.1
- express-rate-limit 8.2.1
- express-validator 7.3.1
- Helmet 8.1.0
- QRCode 1.5.4
- Validator 13.15.23

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for email notifications - optional)

### Setup

1. **Clone repository**

```bash
git clone <your-repo-url>
cd "karthikyernana /mernpro"
```

2. **Backend Setup**

```bash
cd backend
npm install

# Create .env file with the following:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=1h
PORT=5000
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

npm run dev
```

3. **Frontend Setup** (new terminal)

```bash
cd frontend
npm install

# Create .env file with:
VITE_API_BASE_URL=http://localhost:5000/api/v1

npm run dev
```

4. **Access Application**

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/api/health

### Email Configuration (Optional)

To enable email notifications:

1. Enable 2FA on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Add credentials to backend `.env` file
4. Test by creating a reminder

### Default Admin Account

**IMPORTANT**: Public registration is disabled. Only admins can create users.

To create the first admin, temporarily enable public registration or use seed data.

## 📁 Project Structure

```
mernpro/
├── backend/
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # Business logic (scheduler)
│   │   ├── utils/          # Helpers (JWT)
│   │   ├── config/         # Database config
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # Auth context
│   │   ├── services/       # API service
│   │   ├── utils/          # Export utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

**Quick Deploy:**

- **Backend**: Deploy to [Render](https://render.com)
- **Frontend**: Deploy to [Vercel](https://vercel.com)
- **Database**: [MongoDB Atlas](https://mongodb.com/atlas)

## 📝 API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register user (Admin only)
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/users` - List all users (Admin)
- `DELETE /api/v1/auth/users/:id` - Delete user (Admin)

### Patients
- `GET /api/v1/patients` - List patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient
- `POST /api/v1/patients/:id/discharge` - Discharge patient
- `POST /api/v1/patients/:id/readmit` - Readmit patient

### Vitals
- `POST /api/v1/vitals` - Record vitals
- `GET /api/v1/vitals/patient/:id` - Get patient vitals history
- `GET /api/v1/vitals/patient/:id/latest` - Get latest vitals
- `GET /api/v1/vitals/patient/:id/trends` - Get trend charts data
- `GET /api/v1/vitals/stats` - Get vitals statistics
- `DELETE /api/v1/vitals/:id` - Delete vitals entry

### Templates
- `GET /api/v1/templates` - List all templates
- `POST /api/v1/templates` - Create custom template
- `GET /api/v1/templates/:id` - Get template details
- `PUT /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template

### Alerts
- `GET /api/v1/alerts` - List alerts (with filters)
- `PUT /api/v1/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/v1/alerts/:id/resolve` - Resolve alert
- `DELETE /api/v1/alerts/:id` - Delete alert

### Reminders
- `GET /api/v1/reminders` - List reminders
- `POST /api/v1/reminders` - Create reminder
- `PUT /api/v1/reminders/:id/snooze` - Snooze reminder
- `PUT /api/v1/reminders/:id/complete` - Complete reminder
- `DELETE /api/v1/reminders/:id` - Delete reminder

### Dashboard
- `GET /api/v1/dashboard/stats` - Get all dashboard statistics

### Sharing
- `POST /api/v1/share/generate` - Generate share link
- `GET /api/v1/share/patient/:token` - Public patient view
- `DELETE /api/v1/share/:id` - Revoke share link

### Export
- `GET /api/v1/export/patient/:id/pdf` - Download PDF report
- `GET /api/v1/export/patient/:id/csv` - Download CSV data

### Settings (Admin)
- `GET /api/v1/settings` - Get system settings
- `PUT /api/v1/settings` - Update settings
- `GET /api/v1/settings/wards` - Get wards list
- `POST /api/v1/settings/wards` - Add ward
- `PUT /api/v1/settings/wards/:name` - Update ward
- `DELETE /api/v1/settings/wards/:name` - Delete ward

### Audit (Admin)
- `GET /api/v1/audit` - Get audit logs with filters

### Notifications
- `GET /api/v1/notifications/subscribe` - Subscribe to SSE
- `GET /api/v1/notifications/unread-count` - Get unread notifications count

## 🔒 Security Features

- **Rate Limiting**: 500 requests per 15 minutes (general), 20 requests per 15 minutes (auth)
- **Authentication**: JWT with 1-hour expiry
- **Password Security**: bcrypt hashing with salt rounds of 10
- **Input Validation**: express-validator on all endpoints
- **Input Sanitization**: Custom middleware to prevent XSS
- **Security Headers**: Helmet middleware
- **CORS**: Origin whitelisting
- **Body Size Limits**: 10kb maximum to prevent large payload attacks
- **NoSQL Injection Prevention**: Mongoose schema validation

## 📊 Key Features Explained

### Real-time Notifications
The application uses Server-Sent Events (SSE) for real-time browser notifications. When a reminder is created or an alert is triggered, users receive instant notifications without polling.

### Email Integration
Automated email notifications using Nodemailer with professional HTML templates. Supports Gmail SMTP with App Password authentication.

### Patient Workflows
Complete patient lifecycle management:
- **Admission**: Create patient with ward/bed assignment
- **Monitoring**: Record vitals, view trends, manage alerts
- **Discharge**: Discharge with notes, automatic alert resolution
- **Readmission**: Readmit with new ward/bed, track admission history

### Alert Rule Engine
Intelligent alert generation based on vitals thresholds:
- Automatic severity calculation (Low/Medium/High/Critical)
- Configurable thresholds per template field
- Alert workflow (New → Acknowledged → Resolved)
- Auto-resolution on patient discharge

### Audit Trail
Comprehensive logging of all system actions for compliance:
- User actions tracked (CREATE, UPDATE, DELETE, LOGIN, etc.)
- IP address and user agent logging
- Searchable audit logs with date filtering
- Admin-only access

## 📚 Documentation

- [PRD (Product Requirements Document)](./docs/prd_mongodb.md) - Complete technical specification
- [Get Started Guide](./docs/get_started_guide.md) - Step-by-step implementation
- [Testing Guide](./docs/testing_guide.md) - Comprehensive testing strategy
- [Deployment Guide](./docs/deploy_brand_guide.md) - Production deployment & branding
- [Email Notifications Guide](./docs/EMAIL_NOTIFICATIONS.md) - Email setup instructions
- [Start Here](./docs/start_here.md) - Central navigation hub
- [Comprehensive Testing Checklist](./COMPREHENSIVE_TESTING_GUIDE.md) - Complete testing checklist
- [Testing Checklist](./TESTING_CHECKLIST.md) - Quick testing reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Karthik Yernana**
- GitHub: [@karthikyernana](https://github.com/karthikyernana)
- Email: karthikyernana@gmail.com

## 🙏 Acknowledgments

- Built with MERN stack (MongoDB, Express, React, Node.js)
- Icons by [Lucide React](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

---

**Version**: 3.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 23, 2025

- `GET /api/v1/export/patient/:id/data` - Get PDF data

## 🧪 Testing

All features have been manually tested. See `day3_testing_checklist.md` for comprehensive test scenarios.

## 📜 License

MIT

## 👥 Author

Karthik Yernana

## 🎯 Version

v0.3.0-rc (Day 3 Complete)
