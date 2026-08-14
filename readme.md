# Unity NGO Volunteer Management System (Version 1)

This repository contains the source code for the **Unity NGO Volunteer Management System (Version 1)**. The project is divided into **4 implementation parts** using **Clerk Authentication** for three core roles: **Volunteer**, **Coordinator**, and **Admin**.

---

## 🚦 Project Completion Status

| Phase | Module | Status | Details |
| :--- | :--- | :--- | :--- |
| **Part 1** | **Backend Setup, Clerk Integration & User Directory** | **100% Completed** | Express server config, MongoDB connection, Clerk token verification middleware, profile sync, and admin directories. |
| **Part 2** | **Campaigns & Opportunity Explorer** | **100% Completed** | Campaign schemas, creation portals, banner uploads, searching/filtering feeds, and registration actions. |
| **Part 3** | **Task Assignment & Log Hours** | **100% Completed** | Task assignment schema, check-in/out logging, and coordinator hour verification sheet. |
| **Part 4** | **Certificates, Analytics & Admin Console** | **100% Completed** | Cryptographic certificate generation engine, public validation lookups, and global system dashboard stats. |

---

## 📁 Project Directory Structure

```text
NGO_Management_System/
├── Backend/                 # Node.js + Express + Mongoose Backend
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Clerk session parsing & role check guards
│   │   ├── models/          # Mongoose database models (User.js)
│   │   └── modules/         # API endpoint routes & controllers (users/)
│   ├── .env.example
│   ├── package.json
│   └── server.js            # Main API entrypoint
└── Frontend/                # Vite + React.js + Vanilla CSS Client
    ├── src/
    │   ├── context/         # UserContext profile session sync hook
    │   ├── layouts/         # Glassmorphism navigation sidebar layouts
    │   ├── pages/           # Landing, Sign-in, Sign-up, Dashboards, Profiles, Directories
    │   ├── App.jsx          # Route manager
    │   ├── index.css        # Premium HSL color scheme stylesheet
    │   └── main.jsx         # App wrapper initializing Clerk
    ├── .env
    └── package.json
```

---

## 🔐 Auth Integration & Setup Instructions

### 1. Environment Variable Setup
Ensure you add the Clerk integration credentials in your environmental variables:

**Backend (`Backend/.env`):**
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ngo_management_system
CLERK_PUBLISHABLE_KEY=pk_test_yourclerkpublishablekey
CLERK_SECRET_KEY=sk_test_yourclerksecretkey
```

**Frontend (`Frontend/.env`):**
```ini
VITE_CLERK_PUBLISHABLE_KEY=pk_test_yourclerkpublishablekey
VITE_API_URL=http://localhost:5000/api
```

### 2. Launching Services
Run the following commands in separate terminals to start development servers:

**Start Backend API:**
```bash
cd Backend
npm run dev
```

**Start Frontend Application:**
```bash
cd Frontend
npm run dev
```
