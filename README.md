# Emedley — Student Course Registration System (MERN Stack)

[![Tests](https://img.shields.io/badge/Vitest-16%2F16%20Passing-brightgreen)](file:///Users/deepakverma/Code/SDD/server/src/tests/registration.test.js)
[![Frontend](https://img.shields.io/badge/Vercel-Live%20Demo-black?logo=vercel)](https://sdd-mini-project-xi.vercel.app)
[![Backend](https://img.shields.io/badge/Render-API%20Online-46e3b7?logo=render)](https://sdd-mini-project.onrender.com)
[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-blue)](#tech-stack)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8)](file:///Users/deepakverma/Code/SDD/client/src/index.css)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-Fully%20Responsive-orange)](#mobile-first-experience)

> A modern, responsive academic course registration and student management portal designed with the **Emedley Education & Analytics** design system. Features real-time prerequisite verification, atomic concurrency-safe seat allocation, credit ceiling enforcement, event-driven synchronized waiting lists, printable verified registration slips, and comprehensive administrator analytics.

---

## 🌐 Live Deployments

- **Frontend (Vercel)**: [https://sdd-mini-project-xi.vercel.app](https://sdd-mini-project-xi.vercel.app)
- **Backend API (Render)**: [https://sdd-mini-project.onrender.com](https://sdd-mini-project.onrender.com)
- **Health Check Probe**: [https://sdd-mini-project.onrender.com/api/health](https://sdd-mini-project.onrender.com/api/health)

---

## 1. Visual Theme & Mobile-First Experience

This application reproduces the design language of the **Emedley Education & Performance Dashboard**:

- **Color Palette & Design Tokens**:
  - **Forest / Pine Green**: `#2E5A44` (primary brand buttons, typography, active indicators) & `#E8F1EC` (soft mint background badge)
  - **Warm Terracotta / Coral Accent**: `#E27D60` (highlight buttons, active sidebar pill `#FCEEE9` with coral text `#E27D60`, urgency badges)
  - **Warm Amber / Ochre**: `#DDA15E` / `#BC6C25` (gradient accents, warning tags)
  - **Serene Sage Canvas**: `#EAEFEA` background canvas with floating white cards (`rounded-3xl`, `shadow-sm`, border `#E5EAE7`)
- **Key UI Components**:
  - **Top Hero Gradient Banner**: Bronze-to-forest-green gradient (`linear-gradient(135deg, #c78652, #477053, #254F3B)`), live semester badge, and 3D visual status widget.
  - **High-Impact Metric Cards**: Circular icon backdrops (peach, forest green, charcoal, mint), bold numbers, category pill tags, and clear labels.
  - **Interactive Analytics**: Department capacity vs enrollment breakdown and credit allocation charts built with **Recharts**.
  - **Official Printable Slip**: Verified enrollment confirmation document with university crest, simulated authentic barcode, student details, course table, and registrar signature block.
- **Mobile Phone Optimization**:
  - **Fixed Mobile Bottom Navigation (`MobileBottomNav`)**: Ergonomic thumb navigation for mobile screens with real-time selection cart badge counter.
  - **Responsive Layout Grids**: Stat cards adapt fluidly into a 2x2 mobile matrix with proportional typography (`text-xl` to `text-3xl`).
  - **Slide-Out Mobile Drawer**: Off-canvas navigation with backdrop blur and touch dismiss.
  - **Safe Area Insets**: Handled with `pb-24 lg:pb-8` to ensure content is never obscured by mobile browser chrome.

---

## 2. User Roles & Capabilities

### A. Student Portal
- **Dashboard**: Enrolled credit meter, remaining credit allowance, term statistics, credit distribution chart, and registered courses table.
- **Course Catalogue**: Search, filter by department/credits/availability, and sort. Live badge indicators for prerequisite satisfaction, seat capacity, and in-cart status.
- **Course Details Modal**: Full syllabus description, professor contact, meeting schedule, room assignment, and prerequisite completion audit.
- **Selection Cart & Pre-Validation**: Real-time pre-registration eligibility validation (verifies prerequisites, detects full classes, and enforces max semester credit limits).
- **Registration Submission**: Atomic seat reservation, unique reference number generation (`REG-2026-XXXXX`), and instant printable confirmation slip.
- **My Registrations**: History of active and dropped courses with printable slips and self-service cancellation (with reason tracking).
- **Waiting List Tracker**: Real-time queue position tracking (`Queue #1`, `Queue #2`), status indicators (`Waiting`, `Seat Offered`), and leave waitlist action.
- **Academic Profile**: Student ID, department, cumulative GPA calculation, degree credit progress bar, and official transcript of completed courses.

### B. Administrator Console
- **Analytics Dashboard**: Global seat utilization rate (`(Enrolled / Capacity) * 100`), total students, active registrations, waiting list count, and Recharts department capacity comparison.
- **Course Management**: Full CRUD for university courses with multi-select prerequisite assignment, capacity reduction guards, and deletion safeguards.
- **Student Directory & Academic Record Manager**: View student directory and dynamically assign or remove completed courses (with grades and credits) to instantly test and satisfy prerequisites in real time.
- **Registration Records & CSV Export**: Searchable university audit log with one-click official **CSV export** (`/api/admin/reports/csv`).
- **Waitlist Queue Oversight**: Priority seat promotion button (`Allocate Seat & Enroll`) that immediately allocates open seats to next-in-line students.
- **Semester Settings**: Configure semester name, academic year, credit ceiling limits (e.g., 18 max credits), open/close registration periods, and policy toggles.

---

## 3. Real-Time Event-Driven Sync & Performance Architecture

- **Event-Driven Cross-Tab Synchronization**:
  - Uses the browser's native `BroadcastChannel('emedley_sync_channel')` paired with local `storage` event pings.
  - When an administrator promotes a waiting student to enrolled, or when a student registers or cancels, all open tabs and dashboards synchronize instantly.
- **Zero-Poll, Flicker-Free UI**:
  - Aggressive timer polling and window-focus listeners have been replaced with event-driven updates.
  - Background synchronizations update state smoothly in-place without flashing skeleton placeholders or disrupting scrolling.
- **Debounced Search**:
  - Catalogue and student directory search bars employ a 300ms debounce to prevent redundant backend network requests during keystrokes.
- **Smart Rate Limiting**:
  - Extended to a 1-hour window with 1,000 requests max, proxy-trust enabled for cloud hosts, and session checks (`/api/auth/me`) exempted from limiting.

---

## 4. Core Business Rules Engine

| Rule # | Business Requirement | Server-Side Enforcement Location |
|---|---|---|
| **1** | Only authenticated students can register | `server/src/middleware/auth.js` (`protect`) |
| **2** | Only administrators can manage curriculum & system rules | `server/src/middleware/auth.js` (`authorize('admin')`) |
| **3** | Duplicate course registration in same semester blocked | `server/src/services/registrationService.js` (Duplicate query & compound index) |
| **4** | Missing prerequisite requirement strictly blocked | `RegistrationService.validatePrerequisites` (Audit against completed courses) |
| **5** | Total registered credits must not exceed credit ceiling | `RegistrationService.validateCreditLimit` (`current + attempted <= maxCredits`) |
| **6** | No over-enrollment permitted beyond class capacity | `Course.findOneAndUpdate` with atomic `$expr: { $lt: ['$enrolledCount', '$capacity'] }` |
| **7** | Registration permitted only during open window | `RegistrationService.checkRegistrationWindow` (Dates & boolean toggle) |
| **8** | Full courses accept waitlist entries only when enabled | `RegistrationService.joinWaitlist` (Queue positioning & duplicate prevention) |
| **9** | Admin waitlist acceptance automatically enrolls student | `RegistrationService.promoteFromWaitlist` (Atomic enrollment + waitlist status update) |
| **10** | Course cancellation adheres to university drop policies | `RegistrationService.cancelRegistration` (Safely decrements enrolled count) |
| **11** | Concurrent attempts for last seat handled safely | Tested with simultaneous asynchronous requests; zero over-enrollment |

---

## 5. Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons, Recharts, React Hot Toast, Axios.
- **Backend**: Node.js, Express.js (ES modules), Mongoose ODM, JWT authentication, Bcrypt.js password hashing, Cookie Parser, Morgan.
- **Database**: MongoDB Atlas cloud cluster with automatic zero-setup fallback to embedded `mongodb-memory-server` for local offline development.
- **Testing**: Vitest & Supertest (16 automated end-to-end integration tests covering auth, prereqs, concurrency, waitlists, and dashboard synchronization).

---

## 6. Quick Start & Local Setup

### Prerequisites
- Node.js `v18+`, `v20+`, or `v24+`
- npm `v9+` or `v11+`

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/iam-deepakverma/SDD_mini_project.git
cd SDD_mini_project

# Install root, client, and server dependencies
npm run install:all
```

### Step 2: Environment Configuration
The repository includes preconfigured `.env` files.
By default, if `MONGODB_URI` is left blank, the backend automatically boots an **embedded in-memory MongoDB server** so you can run the project immediately with zero database installation.

To connect to MongoDB Atlas or a local MongoDB service:
Edit `server/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/emedley?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_emedley_course_portal_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Run the Application
Run both client and server concurrently with one command:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend Server (Port 5001)
npm run server

# Terminal 2: Frontend Client (Port 5173)
npm run client
```

Open your browser at: **`http://localhost:5173`**

---

## 7. Pre-Seeded Demo Accounts & Evaluator Personas

The portal automatically seeds realistic academic records on startup. You can sign in using credentials or use the **"Demo Switcher"** pill in the top header:

| Persona | Name | Email | Password | Role | Academic Status & Purpose |
|---|---|---|---|---|---|
| 🎓 **Student (Eligible)** | Alex Mercer | `alex.student@emedley.edu` | `Password123!` | Student | Junior CS. Has completed `CS101`, `CS201`, `MATH201`. Eligible to register for `CS301` and `CS305`. |
| ⚠️ **Student (Missing Prereq)** | Maya Chen | `maya.student@emedley.edu` | `Password123!` | Student | Sophomore CS. Missing `CS201`. Demonstrates prerequisite blocking on `CS301`. |
| ⚡ **Student (High Credits)** | Jordan Hayes | `jordan.student@emedley.edu` | `Password123!` | Student | Senior CS. Near credit limit. Demonstrates credit ceiling warnings. |
| 👑 **Administrator** | Sarah Lin | `admin@emedley.edu` | `Password123!` | Admin | Dean of Registry. Full access to analytics, courses, waitlist promotion, and student records. |

---

## 8. Automated Test Suite

Run the full end-to-end test suite:
```bash
npm run test
```

### Test Coverage Summary (16/16 Passing):
```text
 ✓ 1. Authentication & Role Authorization > should authenticate user with valid credentials
 ✓ 1. Authentication & Role Authorization > should reject login with invalid password
 ✓ 1. Authentication & Role Authorization > should block student from accessing admin-only routes
 ✓ 1. Authentication & Role Authorization > should allow admin to access admin routes
 ✓ 2. Course Catalogue & Search > should return courses with search and filtering
 ✓ 3. Core Registration Workflows & Business Rules > should successfully register eligible student for a course with prerequisites satisfied
 ✓ 3. Core Registration Workflows & Business Rules > should block registration if student is missing prerequisites
 ✓ 3. Core Registration Workflows & Business Rules > should block duplicate course registration in same semester
 ✓ 3. Core Registration Workflows & Business Rules > should block registration if credit limit is exceeded
 ✓ 3. Core Registration Workflows & Business Rules > should block registration when course is full
 ✓ 3. Core Registration Workflows & Business Rules > should block registration when registration window is closed
 ✓ 4. Waiting List Lifecycle > should allow eligible student to join waiting list for full course
 ✓ 4. Waiting List Lifecycle > should allow new student to join waitlist and assign next position
 ✓ 4. Waiting List Lifecycle > should enroll student, remove them from waiting list, and reflect on student & admin dashboards when admin accepts waitlist
 ✓ 5. Course Cancellation Rules > should allow student to cancel registered course and decrement enrolledCount
 ✓ 6. Concurrency & Race Condition Guard > should safely handle concurrent registrations for the last seat without over-enrollment

Test Files  1 passed (1)
Tests       16 passed (16)
```

---

## 9. REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Authenticate user, issue JWT token & HttpOnly cookie
- `POST /api/auth/logout` — Clear session
- `GET /api/auth/me` — Get current authenticated user profile & academic credit summary

### Courses (`/api/courses`)
- `GET /api/courses` — Search, filter, sort, and paginate active courses
- `GET /api/courses/:id` — Get course details with populated prerequisites
- `POST /api/courses` — [Admin] Create a new course offering
- `PUT /api/courses/:id` — [Admin] Update course details & capacity
- `PATCH /api/courses/:id/status` — [Admin] Toggle course active/inactive status
- `DELETE /api/courses/:id` — [Admin] Delete course (guarded against active registrations)

### Registrations (`/api/registrations`)
- `POST /api/registrations/validate` — Validate candidate course selection (prerequisites, credit ceiling, seat limits)
- `POST /api/registrations/confirm` — Atomic course registration & reference code creation
- `GET /api/registrations/me` — Get student's registrations and history
- `GET /api/registrations/:id` — Get verified registration slip details
- `POST /api/registrations/:id/cancel` — Cancel registration and release seat

### Waiting Lists (`/api/waitlists`)
- `POST /api/waitlists` — Join waitlist for a full course
- `GET /api/waitlists/me` — View current student's waitlist positions
- `DELETE /api/waitlists/:id` — Leave waitlist queue
- `GET /api/waitlists/admin` — [Admin] View waitlist entries across all courses
- `POST /api/waitlists/admin/:id/offer` — [Admin] Promote candidate and allocate seat

### Admin & Settings (`/api/admin`)
- `GET /api/admin/dashboard` — Analytics stats, seat utilization, and department breakdowns
- `GET /api/admin/registrations` — View all student registrations with search & filters
- `GET /api/admin/reports/csv` — Download official CSV enrollment report
- `GET /api/admin/settings` — Get current semester settings and registration window status
- `PUT /api/admin/settings` — [Admin] Update max credits limit, dates, and policy toggles

---

## 10. Project Structure

```
course-registration-system/
├── client/
│   ├── src/
│   │   ├── api/             # Axios client with dev proxy & Render fallback
│   │   ├── components/
│   │   │   ├── common/      # Badge, StatCard, TopBanner, ConfirmationDialog, ProtectedRoute
│   │   │   ├── courses/     # CourseCard, CourseFilters, CourseDetailModal
│   │   │   ├── layout/      # Sidebar, Header, AppLayout, MobileBottomNav
│   │   │   └── registration/# PrintableRegistrationSlip
│   │   ├── context/         # AuthContext (cross-tab sync), CartContext
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Courses, Students, Registrations, Waitlists, Settings
│   │   │   ├── auth/        # LoginPage, RegisterPage
│   │   │   └── student/     # Dashboard, Catalogue, CartReview, MyRegistrations, Waitlist, Profile
│   │   ├── App.jsx          # React Router route definitions
│   │   ├── index.css        # Tailwind CSS design tokens & print styling
│   │   └── main.jsx
│   ├── vercel.json          # SPA routing rewrites for Vercel deployment
│   ├── index.html           # Google Fonts & portal metadata
│   └── vite.config.js       # Vite config with API proxy
├── server/
│   ├── scripts/
│   │   └── seed.js          # Realistic demo dataset with admin, students & courses
│   ├── src/
│   │   ├── config/          # MongoDB Atlas connection with embedded fallback
│   │   ├── controllers/     # Auth, Course, Registration, Waitlist, Student, Admin controllers
│   │   ├── middleware/      # JWT auth, role authorization, rate limiting
│   │   ├── models/          # User, Course, Registration, Waitlist, SystemSetting
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # RegistrationService (Atomic checks, prerequisites, credit limiter)
│   │   ├── tests/           # Vitest end-to-end integration tests (16 tests)
│   │   ├── utils/           # Reference generator, CSV exporter
│   │   ├── app.js           # Express app setup with root probe & health check
│   │   └── server.js        # Server entry point with 0.0.0.0 binding & auto-seeding
│   └── package.json
├── .env.example
├── .gitignore
├── package.json             # Root orchestration scripts
└── README.md
```

---

## 11. Deployment Guide

### Deploying to Render (Backend)
1. In the [Render Dashboard](https://dashboard.render.com), create a new **Web Service** connected to this repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install` *(Important: do not append `npm start` here)*
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/emedley?retryWrites=true&w=majority`
     - `JWT_SECRET`: `your_secure_random_key`
     - `JWT_EXPIRES_IN`: `7d`
     - `CLIENT_URL`: `https://sdd-mini-project-xi.vercel.app`

### Deploying to Vercel (Frontend)
1. In the [Vercel Dashboard](https://vercel.com), import this repository.
2. Configure settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL`: `https://sdd-mini-project.onrender.com/api`
3. Single-Page Application rewrites are automatically handled by [`client/vercel.json`](file:///Users/deepakverma/Code/SDD/client/vercel.json).

---

## 12. License
Academic Mini Project — Created for demonstration of full-stack MERN development, robust database architecture, atomic concurrency handling, and modern UI/UX design.
