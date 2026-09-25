# 🏥 DoctorFinder — Patient Health Portal

A full-stack **role-based Patient Health Portal** with AI symptom pre-screening, doctor discovery, Razorpay payments, slot booking with QR email confirmation, and an interactive road-route map.

---

## ✨ Key Features

| Feature | Details |
|---------|---------|
| 🔐 **JWT Auth** | Role-based access — Patient, Doctor, Pharmacy, Admin |
| 🤖 **AI Symptom Screener** | Gemini AI assesses symptoms → recommends top 3 doctors |
| 📍 **Doctors Near Me** | Leaflet map with real road routing (OSRM) |
| 📅 **Slot Booking** | Book appointment → QR code sent to email |
| 💳 **Razorpay Payments** | Live payment gateway integration |
| 🏥 **Admin Dashboard** | Analytics, audit logs, approve/reject doctor accounts |
| 💊 **Pharmacy Module** | Multi-doctor chambers with time slots |
| 📋 **Lab Reports & Prescriptions** | Upload & manage patient health records |
| 🌗 **Dark / Light Toggle** | Glassmorphism UI with theme switching |

---

## 🛠 Tech Stack

**Backend** — Spring Boot 3 · Spring Security + JWT · Spring Data JPA · PostgreSQL · Razorpay SDK · Gemini AI
**Frontend** — React 19 · React Router · Axios · Leaflet · Lucide Icons · Vite
**Database** — PostgreSQL (3NF schema, indexed on doctor_id, patient_id, appointment_date)

---

## 🚀 Local Setup

### Prerequisites
- Java 21, Maven
- Node.js 18+, npm
- PostgreSQL 15+

### 1. Database
```sql
CREATE DATABASE patient_portal;
```

### 2. Backend
```bash
cd backend
cp .env.example .env
mvn spring-boot:run
# Runs on http://localhost:8082
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@health.com` | `admin123` |
| Patient | `patient@health.com` | `patient123` |
| Doctor | `dr.sharma@hospital.com` | `doctor123` |
| Pharmacy | `pharmacy@health.com` | `pharmacy123` |

> All credentials are available as **1-click buttons** on the login page.

---

## 📁 Project Structure

```
DoctorFinder/
├── backend/          # Spring Boot REST API
│   ├── src/main/java/com/healthportal/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── security/
│   │   └── config/
│   └── src/main/resources/
│       ├── application.yml
│       └── db/schema.sql
└── frontend/         # React + Vite SPA
    └── src/
        ├── pages/
        ├── components/
        ├── context/
        └── services/
```

---

## 🌍 Deployment

- **Frontend** → [Vercel](https://vercel.com) (set `VITE_API_BASE_URL` to your Render backend URL)
- **Backend** → [Render](https://render.com) (Web Service, set all env vars in dashboard)
- **Database** → [Neon](https://neon.tech) or [Supabase](https://supabase.com) (free PostgreSQL)

---

## 📄 License

MIT © 2025 Soumya
