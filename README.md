# Manual-RPM - Remote Patient Monitoring System

A full-stack MERN application for healthcare providers to manage patient vitals, alerts, and reminders.

## 🚀 Features

- **Authentication** - Secure JWT-based auth with role-based access (Nurse/Doctor/Admin)
- **Patient Management** - CRUD operations with search, filter, and pagination
- **Vitals Tracking** - Dynamic templates (General, Cardiac, Diabetic) with auto-flagging
- **Alert System** - Automatic severity calculation and workflow management
- **Reminders** - Automated scheduling with node-cron (daily at 8 AM)
- **Sharing** - Secure JWT links with QR code generation (7-day expiration)
- **Export** - PDF reports and CSV downloads
- **Visualization** - 7-day trend charts with Recharts

## 📦 Tech Stack

**Frontend:**

- React 18 + Vite
- React Router v6
- TailwindCSS
- Recharts
- Axios
- jsPDF

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- node-cron
- QRCode
- bcryptjs

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone repository**

```bash
git clone <your-repo-url>
cd karthikyernana\ /mernpro
```

2. **Backend Setup**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

3. **Frontend Setup** (new terminal)

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

4. **Access Application**

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Default Test Account

After running the app, register a new account or use:

- Email: `admin@test.com` (if seeded)
- Password: `password123`

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

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Patients

- `GET /api/v1/patients` - List patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/:id` - Get patient
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

### Vitals

- `POST /api/v1/vitals` - Record vitals
- `GET /api/v1/vitals/patient/:id` - Get patient vitals
- `GET /api/v1/vitals/patient/:id/trends` - Get trend data

### Alerts

- `GET /api/v1/alerts` - List alerts
- `PUT /api/v1/alerts/:id/acknowledge` - Acknowledge
- `PUT /api/v1/alerts/:id/resolve` - Resolve

### Reminders

- `GET /api/v1/reminders` - List reminders
- `POST /api/v1/reminders` - Create reminder
- `PUT /api/v1/reminders/:id/snooze` - Snooze
- `PUT /api/v1/reminders/:id/complete` - Complete

### Sharing

- `POST /api/v1/share/create/:patientId` - Generate share link
- `GET /api/v1/share/:token` - Public patient view

### Export

- `GET /api/v1/export/patient/:id/csv` - Download CSV
- `GET /api/v1/export/patient/:id/data` - Get PDF data

## 🧪 Testing

All features have been manually tested. See `day3_testing_checklist.md` for comprehensive test scenarios.

## 📜 License

MIT

## 👥 Author

Karthik Yernana

## 🎯 Version

v0.3.0-rc (Day 3 Complete)
