# 🏥 HealthSchedule — AI-Powered Multi-Hospital Scheduling Platform

> A full-stack healthcare infrastructure platform enabling AI-assisted appointment scheduling, real-time teleconsultation, doctor workflow automation, and digital prescription delivery.

---

# 🚀 Overview

HealthSchedule is a scalable healthcare management ecosystem designed to streamline:

- OPD appointment booking
- Multi-hospital administration
- Doctor workflow management
- AI-powered calling automation
- Real-time teleconsultation
- Digital prescription generation
- Automated patient communication

The platform supports:

- Patients
- Doctors
- Hospital Administrators

through a unified real-time healthcare workflow system.

---

# 🧠 Core System Architecture

```txt
Patients
   ↓
AI Scheduling + OPD Booking
   ↓
Hospital Allocation
   ↓
Doctor Assignment Engine
   ↓
Teleconsultation (WebRTC)
   ↓
Digital Prescription System
   ↓
Email + Notification Automation
```

---

# ⚡ Key Features

| Module | Capability |
|---|---|
| Multi-Hospital Platform | Hospital onboarding + management |
| OPD Booking System | Smart appointment scheduling |
| Doctor Dashboard | Prescription + patient workflow |
| Teleconsultation | WebRTC + PeerJS video calls |
| AI Calling Automation | Automated patient communication |
| Digital Prescriptions | PDF/image prescription generation |
| RBAC Security | Admin/Doctor access control |
| CI/CD Infrastructure | Automated deployments |
| Real-Time Notifications | Email + teleconsult links |
| Speech-to-Text | Voice prescription dictation |

---

# 🏗 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Real-Time Communication | WebRTC, PeerJS |
| Authentication | JWT |
| AI Features | Speech Recognition |
| PDF Engine | html2pdf.js |
| Animations | Lottie |
| Deployment | Vercel, Render |
| CI/CD | GitHub Actions |
| Containerization | Docker |

---

# 🧩 Platform Modules

---

# 1️⃣ Patient Appointment System

## 🎯 Purpose

Enables patients to:

- discover hospitals
- select doctors
- choose time slots
- schedule appointments
- receive automated confirmations

---

## ⚡ Intelligent Slot Generation

The system dynamically generates hospital-specific appointment windows:

```js
generateTimeSlots(startTime, endTime)
```

Features:

- configurable slot duration
- hospital-specific schedules
- real-time availability
- duplicate booking prevention

---

## 🔍 Duplicate Detection Engine

Before confirmation:

```txt
Patient Name + Hospital ID
```

is validated to prevent duplicate appointment records.

---

## 📅 Smart Weekly Availability

Patients can only select dates within the hospital’s operational week.

This prevents:
- invalid scheduling
- unavailable booking windows
- backend conflicts

---

## 🎨 Advanced UI/UX

Features:

- animated booking experience
- Lottie-based interactions
- glassmorphism UI
- responsive layout
- multi-step appointment workflow

---

# 2️⃣ Multi-Hospital Administration System

## 🎯 Purpose

Allows hospitals to:

- manage doctors
- assign appointments
- monitor OPD flow
- reschedule patients
- control operational schedules

---

## ⚡ Dynamic Doctor Assignment

Appointments are automatically mapped to available doctors.

Features:

- doctor filtering
- hospital-based allocation
- schedule-aware assignment
- real-time OPD management

---

## 📊 Admin Dashboard

Includes:

- patient statistics
- today’s appointments
- delayed appointment management
- doctor assignment control
- appointment rescheduling

---

## 🔄 Appointment Delay Engine

Supports:

```txt
Delay → Notify → Reschedule
```

allowing hospitals to manage unexpected workflow disruptions.

---

# 3️⃣ Doctor Workflow Engine

## 🎯 Purpose

Provides doctors with a complete patient management workspace.

---

## 🩺 Doctor Dashboard

Features:

- patient queue
- appointment timeline
- prescription management
- teleconsult initiation
- patient search/filtering

---

## 🎤 Voice-to-Prescription AI

Integrated speech recognition enables doctors to dictate:

- diagnosis
- medications
- advice

directly into the prescription system.

Technology used:

```txt
react-speech-recognition
```

---

## 📄 Digital Prescription Engine

Doctors can generate:

- PDF prescriptions
- image prescriptions
- downloadable reports

using:

```txt
html2pdf.js
```

---

## 📧 Automated Prescription Delivery

Prescriptions are automatically sent via email.

Workflow:

```txt
Generate Prescription
       ↓
Convert to PDF/Base64
       ↓
Attach Email
       ↓
Send to Patient
```

---

# 4️⃣ Real-Time Teleconsultation Infrastructure

## 🎯 Purpose

Provides real-time doctor-patient video consultations.

---

# ⚡ WebRTC + PeerJS Architecture

Built using:

- WebRTC
- PeerJS

to enable:

- low-latency communication
- browser-based video calls
- scalable telemedicine workflows

---

## 🔗 Secure Teleconsult Links

The platform:

- generates unique consultation links
- emails patients automatically
- opens secure video sessions

Workflow:

```txt
Doctor Initiates Session
        ↓
Unique Meeting Link Generated
        ↓
Email Sent to Patient
        ↓
Video Consultation Starts
```

---

# 🔐 RBAC Authentication System

Supports role-based access control:

| Role | Permissions |
|---|---|
| Patient | Book appointments |
| Doctor | Manage prescriptions + teleconsult |
| Hospital Admin | Manage operations |

Authentication stack:

```txt
JWT + Protected Routes
```

---

# 🧠 AI Calling Automation

The platform integrates automated patient communication workflows:

- appointment reminders
- teleconsult alerts
- follow-up communication
- scheduling notifications

---

# 📦 API Architecture

The backend is modularized into domain APIs:

```txt
/api/admin
/api/doctor
/api/opd
/api/communication
```

This improves:

- scalability
- maintainability
- service isolation

---

# 🗂 Application Routing Structure

```txt
/
├── Landing Page
├── Hospital Directory
├── OPD Booking
├── Doctor Dashboard
├── Admin Dashboard
├── Teleconsultation
├── Authentication
└── Protected Routes
```

---

# ⚡ Real-Time Workflow

```txt
Patient Books Appointment
            ↓
Hospital Receives Request
            ↓
Doctor Assigned
            ↓
Teleconsult Link Generated
            ↓
Doctor Consultation
            ↓
Digital Prescription Generated
            ↓
Prescription Emailed
```

---

# 📊 Platform Highlights

## 🚀 Performance Features

- low-latency teleconsultation
- optimized slot scheduling
- real-time dashboard updates
- scalable hospital workflows

---

## 🎨 UX Features

- responsive design
- animated interactions
- dashboard analytics
- clean medical UI system

---

# 🔧 DevOps & Infrastructure

## 🐳 Dockerized Deployment

The full-stack system is containerized for:

- reproducible builds
- scalable deployments
- isolated environments

---

## ⚡ CI/CD Pipeline

Automated deployment pipeline using:

```txt
GitHub Actions
```

Deployment targets:

- Vercel
- Render

---

# 🌐 Environment Variables

```env
MONGO_URI=
JWT_SECRET=

BREVO_API_KEY=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_FROM=

FAST2SMS_API_KEY=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

RENDER_EXTERNAL_URL=
```

---

# 📂 Project Structure

```txt
client/
 ├── components/
 ├── api/
 ├── animations/
 ├── pages/
 ├── routes/
 └── dashboards/

server/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── services/
 └── utils/
```

---

# ⚙️ Local Development

```bash
# install dependencies
npm install

# run frontend
npm start

# run backend
npm run server

# docker build
docker-compose up
```

---

# 🌟 Key Innovations

What differentiates HealthSchedule:

- AI-assisted scheduling workflows
- Real-time teleconsult infrastructure
- Voice-powered prescription system
- Automated healthcare communication
- Multi-hospital scalability
- Digital-first OPD operations

---

# 🔮 Future Enhancements

Planned roadmap:

- AI symptom triage
- AI medical summarization
- multilingual voice assistant
- doctor analytics dashboard
- predictive appointment optimization
- EHR integration
- AI-powered patient prioritization

---

# 👨‍💻 Author

## Om Bhanuse

Full-Stack + AI Engineer

### Portfolio
https://ombhanuse.vercel.app

### GitHub
https://github.com

---

# 📜 License

MIT License