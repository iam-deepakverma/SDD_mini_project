# Emedley — Student Course Registration System (MERN Stack)

[![Tests](https://img.shields.io/badge/Vitest-15%2F15%20Passing-brightgreen)](file:///Users/deepakverma/Code/SDD/server/src/tests/registration.test.js)
[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-blue)](#tech-stack)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8)](file:///Users/deepakverma/Code/SDD/client/src/index.css)
[![Node](https://img.shields.io/badge/Node-v20%2B-green)](#quick-start)

> A modern academic course registration and student management portal designed with the **Emedley Education & Analytics** design system. Features real-time prerequisite verification, atomic concurrency-safe seat allocation, credit ceiling enforcement, interactive waiting lists, printable verified registration slips, and comprehensive administrator analytics.

---

## 1. Visual Theme & Design Alignment

This application reproduces the design language of the **Emedley Education & Performance Dashboard**:

- **Color Palette & Design Tokens**:
  - **Forest / Pine Green**: `#2E5A44` (primary brand buttons, typography, active indicators) & `#E8F1EC` (soft mint background badge)
  - **Warm Terracotta / Coral Accent**: `#E27D60` (highlight buttons, active sidebar pill `#FCEEE9` with coral text `#E27D60`, urgency badges)
  - **Warm Amber / Ochre**: `#DDA15E` / `#BC6C25` (gradient accents, warning tags)
  - **Serene Sage Canvas**: `#EAEFEA` background canvas with floating white cards (`rounded-3xl`, `shadow-sm`, border `#E5EAE7`)
- **Key UI Components**:
  - **Top Hero Gradient Banner**: Bronze-to-forest-green gradient (`linear-gradient(135deg, #c78652, #477053, #254F3B)`), live semester badge, and 3D visual status widget.
  - **4 High-Impact Metric Cards**: Circular icon backdrops (peach, forest green, charcoal, mint), bold numbers, category pill tags, and clear labels.
  - **Interactive Analytics**: Department capacity vs enrollment breakdown and credit allocation charts built with **Recharts**.
  - **Official Printable Slip**: Verified enrollment confirmation document with university crest, simulated authentic barcode, student details, course table, and registrar signature block.

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

## 3. Core Business Rules Engine

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
| **9** | Course cancellation adheres to university drop policies | `RegistrationService.cancelRegistration` (Safely decrements enrolled count) |
| **10** | Concurrent attempts for last seat handled safely | Tested with simultaneous asynchronous requests; zero over-enrollment |

---

## 4. Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons, Recharts, React Hot Toast, Axios.
- **Backend**: Node.js, Express.js (ES modules), Mongoose ODM, JWT authentication, Bcrypt.js password hashing, Cookie Parser, Morgan.
- **Database**: MongoDB with Mongoose (with out-of-the-box auto-fallback to embedded `mongodb-memory-server` for zero-setup local execution).
- **Testing**: Vitest & Supertest (15 automated end-to-end tests covering auth, prereqs, concurrency, and waitlists).

---

## 5. Quick Start & Local Setup

### Prerequisites
- Node.js `v18+` or `v20+` (tested on `v24.15.0`)
- npm `v9+` or `v11+`

### Step 1: Install Dependencies
From the repository root:
```bash
# Install root orchestration dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### Step 2: Environment Configuration
The repository includes preconfigured `.env` and `.env.example` files.
By default, `MONGODB_URI` is left blank, which triggers the backend's **zero-setup embedded MongoDB instance** so the portal runs immediately without requiring local Docker or MongoDB services!

If you wish to connect to an external MongoDB instance or MongoDB Atlas:
Edit `server/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student_course_reg
JWT_SECRET=super_secret_jwt_key_emedley_course_portal_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Run the Application
You can run both client and server concurrently with one command from the root:
```bash
npm run dev
```

Or run them individually in separate terminal windows:
```bash
# Terminal 1: Backend Server (Port 5001)
npm run server

# Terminal 2: Frontend Client (Port 5173)
npm run client
```

Open your browser at: **`http://localhost:5173`**

---

## 6. Pre-Seeded Demo Accounts & Evaluator Personas

The portal automatically seeds realistic academic records on startup. You can sign in using credentials or use the **"One-Click Demo Personas"** buttons on the login page or the **"Demo Switcher"** pill in the top header:

| Persona | Name | Email | Password | Role | Academic Status & Purpose |
|---|---|---|---|---|---|
| 🎓 **Student (Eligible)** | Alex Mercer | `alex.student@emedley.edu` | `Password123!` | Student | Junior CS. Has completed `CS101`, `CS201`, `MATH201`. Eligible to register for `CS301` and `CS305`. |
| ⚠️ **Student (Missing Prereq)** | Maya Chen | `maya.student@emedley.edu` | `Password123!` | Student | Sophomore CS. Has completed `CS101`, but **missing `CS201`**. Demonstrates prerequisite blocking on `CS301`. |
| ⚡ **Student (High Credits)** | Jordan Hayes | `jordan.student@emedley.edu` | `Password123!` | Student | Senior CS. High completed credit load. Demonstrates credit ceiling warnings. |
| 🛡️ **Administrator** | Sarah Lin | `admin@emedley.edu` | `Password123!` | Admin | Dean of Academic Registry. Full access to Admin Console, Course CRUD, Student Records, and Policy Settings. |

---

## 7. Automated Test Suite

Run the full end-to-end test suite:
```bash
npm run test
```

### Test Coverage Summary:
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
✓ 5. Course Cancellation Rules > should allow student to cancel registered course and decrement enrolledCount
✓ 6. Concurrency & Race Condition Guard > should safely handle concurrent registrations for the last seat without over-enrollment

Test Files  1 passed (1)
Tests       15 passed (15)
Duration    7.22s
```

---

## 8. REST API Reference

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

## 9. Project Structure

```
course-registration-system/
├── client/
│   ├── src/
│   │   ├── api/             # Axios client with interceptors
│   │   ├── components/
│   │   │   ├── common/      # Badge, StatCard, TopBanner, ConfirmationDialog, ProtectedRoute
│   │   │   ├── courses/     # CourseCard, CourseFilters, CourseDetailModal
│   │   │   ├── layout/      # Sidebar, Header, AppLayout
│   │   │   └── registration/# PrintableRegistrationSlip
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Courses, Students, Registrations, Waitlists, Settings
│   │   │   ├── auth/        # LoginPage, RegisterPage
│   │   │   └── student/     # Dashboard, Catalogue, CartReview, MyRegistrations, Waitlist, Profile
│   │   ├── App.jsx          # React Router route definitions
│   │   ├── index.css        # Tailwind CSS design tokens & print styling
│   │   └── main.jsx
│   ├── index.html           # Google Fonts & portal metadata
│   └── vite.config.js       # Vite config with API proxy
├── server/
│   ├── scripts/
│   │   └── seed.js          # Realistic demo dataset with admin, students & courses
│   ├── src/
│   │   ├── config/          # MongoDB connection with embedded fallback
│   │   ├── controllers/     # Auth, Course, Registration, Waitlist, Student, Admin controllers
│   │   ├── middleware/      # JWT auth, role authorization, rate limiting
│   │   ├── models/          # User, Course, Registration, Waitlist, SystemSetting
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # RegistrationService (Atomic checks, prerequisites, credit limiter)
│   │   ├── tests/           # Vitest end-to-end integration tests
│   │   ├── utils/           # Reference generator, CSV exporter
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point with auto-seeding
│   └── package.json
├── .env.example
├── .gitignore
├── package.json             # Root orchestration scripts
└── README.md
```

---

## 10. License
Academic Mini Project — Created for demonstration of full-stack MERN development, robust database architecture, and UI/UX design.
