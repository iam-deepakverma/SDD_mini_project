# Emedley UI Design Specification & Screen Documentation

This document contains the detailed specification, component hierarchy, wireframes, and UX behavior for the **5 core User Interface screens** of the **Emedley — Student Course Registration System (MERN Stack)**.

An interactive, live preview file is included in this repository:
👉 [**Interactive UI Showcase (`docs/ui_screens_showcase.html`)**](./ui_screens_showcase.html)

---

## 🎨 System Visual Language & Design Tokens

* **Primary Brand Green**: `#2E5A44` (Forest Pine) & `#E8F1EC` (Soft Mint Tint)
* **Warm Terracotta Accent**: `#E27D60` (Highlight badges, active indicators, urgent alerts)
* **Canvas Background**: `#EAEFEA` (Serene Sage Canvas with white `rounded-3xl` cards)
* **Hero Banner Gradient**: `linear-gradient(135deg, #c78652 0%, #477053 55%, #254F3B 100%)`
* **Typography**: Plus Jakarta Sans (`300`, `400`, `500`, `600`, `700`, `800`)

---

## Navigation Flow

```
                               ┌──────────────────────────────────────────────┐
                               │       Emedley Main Navigation Header         │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌─────────────────────────┬──────────────────┴──────────────┬─────────────────────────┐
         ▼                         ▼                                 ▼                         ▼
  [ SCREEN 1 ]              [ SCREEN 2 ]                      [ SCREEN 3 ]              [ SCREEN 5 ]
Student Dashboard &        Course Catalogue &               Cart Review & Pre-      Admin Analytics &
Credit Progress Meter     Prerequisite Inspector           Registration Validator    Waitlist Queue Console
(Alex Mercer / Student)   (Search & Availability)           (Atomic Pre-Flight)      (Sarah Lin / Registrar)
                                                                     │
                                                                     ▼ [Registration Confirmed]
                                                              [ SCREEN 4 ]
                                                            Official Printable
                                                            Verification Slip
```

---

## Screen 1: Student Dashboard & Academic Credit Progress Portal

* **Route**: `/dashboard`
* **Implementation Component**: [`client/src/pages/student/StudentDashboard.jsx`](../client/src/pages/student/StudentDashboard.jsx)
* **User Persona**: Alex Mercer (Eligible Junior CS Student)
* **Core Objective**: Provide an instant summary of semester progress, remaining credit ceiling allowances, active course enrollments, and real-time waiting list queue notifications.

### Component Breakdown
1. **Top Hero Gradient Banner**: Bronze-to-forest-green gradient with active session indicator (`Fall 2026 • Active Session`) and quick CTA to browse courses or review the cart.
2. **Four Metric Cards**:
   * *Registered Credits*: Current units enrolled (`14 / 18 max`) with limit percentage (`78% Limit`).
   * *Remaining Allowance*: Units left in the credit pool (`4 credits left`).
   * *Enrolled Courses*: Count of registered classes (`4 classes`).
   * *Waiting List*: Queued courses counter (`1 in Queue`).
3. **Academic Credit Distribution Chart**: Recharts bar chart visually contrasting Completed Degree credits, Enrolled credits, In-Cart credits, and the remaining Allowance margin.
4. **Quick Selection Cart Widget**: Side widget displaying in-progress course selections with verified prerequisite badges.
5. **Confirmed Enrolled Schedule Table**: Course code, title, credits, instructor, room, and timings with self-service cancellation dialog.

### Monospace ASCII Wireframe

```text
+--------------------------------------------------------------------------------------------------------+
| [EM] EMEDLEY TECH    Dashboard   Courses   Cart (1)   My Registrations   Waitlist   [Alex Mercer (CS) v] |
+--------------------------------------------------------------------------------------------------------+
|                                                                                                        |
|  +--------------------------------------------------------------------------------------------------+  |
|  | [ Fall 2026 - Active Session ]                                                                   |  |
|  | Welcome back, Alex Mercer!                                                                       |  |
|  | You have enrolled in 14 credits. You have 4 remaining credits available for selection.          |  |
|  |                                                                                                  |  |
|  | [ Browse Course Catalogue ]   [ Review Cart (1 Course) -> ]                                      |  |
|  +--------------------------------------------------------------------------------------------------+  |
|                                                                                                        |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
|  | (Cap)  78% Limit   |  | (Book) Pool        |  | (Check) Active     |  | (Clock) Queued     |        |
|  | 14 Credits         |  | 4 Credits          |  | 4 Classes          |  | 1 Course           |        |
|  | / 18 max ceiling   |  | remaining pool     |  | enrolled this term |  | waiting list       |        |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
|                                                                                                        |
|  +----------------------------------------------------+  +-------------------------------------------+ |
|  | Academic Credit Distribution       [Max 18 Credits]|  | Quick Cart Summary             (1 Item)   | |
|  | 20 |              ---                              |  |                                           | |
|  | 16 |             |   |                             |  | CS305 - Advanced Database Systems         | |
|  | 12 |             |   |                             |  | 4 Credits | Dr. Edgar F. Codd             | |
|  |  8 |      ---    |   |                             |  | Mon / Wed 14:00 - 15:30 (Room 302)        | |
|  |  4 |     |   |   |   |    ---     ---              |  | Status: All Prerequisites Satisfied       | |
|  |  0 +-----+---+---+---+---+---+---+---+-----------  |  |                                           | |
|  |       Completed Enrolled In-Cart Allowance         |  | [ Proceed to Checkout & Confirm -> ]      | |
|  +----------------------------------------------------+  +-------------------------------------------+ |
|                                                                                                        |
|  +--------------------------------------------------------------------------------------------------+  |
|  | Active Enrolled Courses (Fall 2026)                                         [ (Print) Print All ]|  |
|  |--------------------------------------------------------------------------------------------------|  |
|  | CODE   | TITLE                       | CREDITS | INSTRUCTOR       | SCHEDULE       | ACTION      |  |
|  |--------+-----------------------------+---------+------------------+----------------+-------------|  |
|  | CS301  | Operating Systems           | 4 Cr    | Dr. Linus T.     | Tue/Thu 10:00  | [Cancel]    |  |
|  | CS204  | Data Structures & Algo      | 4 Cr    | Dr. Ada Lovelace | Mon/Wed 11:30  | [Cancel]    |  |
|  | MATH201| Discrete Mathematics        | 3 Cr    | Dr. Euler        | Mon/Wed 09:00  | [Cancel]    |  |
|  | CS210  | Computer Networks           | 3 Cr    | Dr. Cerf         | Fri 14:00      | [Cancel]    |  |
|  +--------------------------------------------------------------------------------------------------+  |
+--------------------------------------------------------------------------------------------------------+
```

---

## Screen 2: Course Catalogue & Prerequisite Audit Inspector

* **Route**: `/courses`
* **Implementation Component**: [`client/src/pages/student/CourseCataloguePage.jsx`](../client/src/pages/student/CourseCataloguePage.jsx) & [`CourseCard.jsx`](../client/src/components/courses/CourseCard.jsx)
* **User Persona**: Student exploring academic course options
* **Core Objective**: Real-time course discovery with automatic transcript audit to verify prerequisites and display live seat availability.

### Component Breakdown
1. **Debounced Search Bar**: Keystrokes are debounced by 300ms to reduce backend overhead while filtering by title, code, or professor.
2. **Department & Availability Filter Bar**: Quick filter chips for *Computer Science*, *Mathematics*, and *Electrical Engineering*, paired with an *Open Seats* toggle.
3. **Smart Course Cards**:
   * *Prerequisites Met State (`CS305`)*: Green badge `✓ Prerequisites Met` with available seat progress bar (`24/30 filled - 6 seats open`) and `+ Add to Cart` CTA.
   * *Full Course State (`CS402`)*: Red badge `30/30 FULL` with automatic waitlist enrollment CTA `Join Waiting List (Queue #2)`.
   * *Missing Prerequisite State (`CS415`)*: Coral warning badge `⚠️ Missing Prerequisite: CS302 Automata` with a disabled `🚫 Ineligible` button.

### Monospace ASCII Wireframe

```text
+--------------------------------------------------------------------------------------------------------+
| Course Catalogue                                                         Home / Courses / Catalogue    |
| Browse, filter, and plan your academic curriculum for Fall Semester 2026.                              |
+--------------------------------------------------------------------------------------------------------+
| [ Q  Search course code, title, or instructor... (300ms debounce) ]                                    |
| [ Dept: Computer Science v ]  [ Credits: All v ]  [ Availability: Open Seats v ]  [ Sort: Code (A-Z) v]|
+--------------------------------------------------------------------------------------------------------+
|                                                                                                        |
|  +-----------------------------------+  +-----------------------------------+                          |
|  | CS305                  Sem 5      |  | CS402                  Sem 7      |                          |
|  | [ 4 Credits ]          [ Core ]   |  | [ 4 Credits ]          [ Elective]|                          |
|  | Advanced Database Systems         |  | Distributed Cloud Systems         |                          |
|  |                                   |  |                                   |                          |
|  | (User) Dr. Edgar F. Codd          |  | (User) Dr. Leslie Lamport         |                          |
|  | (Clock) Mon / Wed - 14:00 - 15:30 |  | (Clock) Mon / Wed - 16:00 - 17:30 |                          |
|  | (Pin) Shannon Lab - Room 302      |  | (Pin) Turing Hall - Room 402      |                          |
|  |                                   |  |                                   |                          |
|  | Capacity: [========..] 24/30 (80%)|  | Capacity: [==========] 30/30 (100%)|                          |
|  | 6 seats remaining                 |  | CLASS FULL - 2 in Waitlist        |                          |
|  |                                   |  |                                   |                          |
|  | [✓ Prerequisites Met (CS201)]     |  | [✓ Prerequisites Met (CS301)]     |                          |
|  |                                   |  |                                   |                          |
|  | [ View Details ]   [+ Add to Cart]|  | [ View Details ]   [Join Waitlist]|                          |
|  +-----------------------------------+  +-----------------------------------+                          |
|                                                                                                        |
|  +-----------------------------------+  +-----------------------------------+                          |
|  | CS415                  Sem 7      |  | MATH201                Sem 3      |                          |
|  | [ 4 Credits ]          [ Advanced]|  | [ 3 Credits ]          [ Core ]   |                          |
|  | Compilers & Language Design       |  | Discrete Mathematics              |                          |
|  |                                   |  |                                   |                          |
|  | (User) Dr. Alfred Aho             |  | (User) Dr. Leonhard Euler         |                          |
|  | (Clock) Tue / Thu - 14:00 - 15:30 |  | (Clock) Mon / Wed - 09:00 - 10:30 |                          |
|  | (Pin) Turing Lab - Room 201       |  | (Pin) Gauss Hall - Room 101       |                          |
|  |                                   |  |                                   |                          |
|  | Capacity: [======....] 15/25 (60%)|  | Capacity: [=======...] 21/30 (70%)|                          |
|  | 10 seats remaining                |  | 9 seats remaining                 |                          |
|  |                                   |  |                                   |                          |
|  | [⚠️ Missing Prereq: CS302]        |  | [✓ No Prerequisites Required]     |                          |
|  |                                   |  |                                   |                          |
|  | [ View Details ]   [ Ineligible ] |  | [ View Details ]   [+ Add to Cart]|                          |
|  +-----------------------------------+  +-----------------------------------+                          |
+--------------------------------------------------------------------------------------------------------+
```

---

## Screen 3: Cart Review & Pre-Registration Validation Screen

* **Route**: `/cart`
* **Implementation Component**: [`client/src/pages/student/CartReviewPage.jsx`](../client/src/pages/student/CartReviewPage.jsx)
* **User Persona**: Student ready to finalize schedule
* **Core Objective**: Perform atomic pre-flight checks (prerequisites, credit cap, and seat availability) prior to committing the registration transaction.

### Component Breakdown
1. **Candidate Courses List**: Full course breakdown with credits, timings, and single-click removal button (`Trash icon`).
2. **Pre-Registration Audit Engine**: Live status indicators verifying:
   * *Prerequisites*: Validates all prerequisite courses are completed on transcript with passing grade.
   * *Credit Ceiling*: Verifies `Current (14) + In-Cart (4) <= 18 Max Credits`.
   * *Seat Availability*: Confirms open seats in database.
3. **Credit Impact Visualizer**: Real-time progress bar updating as courses are added or removed.
4. **Atomic Submission Action**: Protected submission CTA executing atomic MongoDB seat decrement.

### Monospace ASCII Wireframe

```text
+--------------------------------------------------------------------------------------------------------+
| Selection Cart & Pre-Registration Review                     [ Clear Entire Cart ]                     |
| Review your candidate courses and verify eligibility before committing your schedule.                  |
+--------------------------------------------------------------------------------------------------------+
|                                                                                                        |
|  COURSES READY FOR REGISTRATION (1 COURSE)               PRE-FLIGHT VALIDATION SUMMARY                 |
|  +----------------------------------------------------+  +-------------------------------------------+ |
|  | CS305 - Advanced Database Management Systems       |  | System Eligibility Audit                  | |
|  | Credits: 4 Cr   |   Dept: Computer Science         |  |-------------------------------------------| |
|  | Faculty: Dr. Edgar F. Codd                         |  | [✓] Prerequisite Audit:                   | |
|  | Schedule: Mon / Wed 14:00 - 15:30 (Room 302)       |  |     CS201 Database Basics (Grade: A)      | |
|  |                                                    |  |                                           | |
|  | Status: [✓ Prerequisites Satisfied]                |  | [✓] Semester Credit Ceiling:              | |
|  | Seats:  [✓ 6 Seats Currently Open]                 |  |     Enrolled: 14 Cr + Cart: 4 Cr = 18 Cr  | |
|  |                                                    |  |     Status: Within 18 Max Credit Limit    | |
|  | Action: [ Trash (Remove from Cart) ]               |  |                                           | |
|  +----------------------------------------------------+  | [✓] Seat Availability Guard:              | |
|                                                          |     Seats available (No queue required)   | |
|                                                          |-------------------------------------------| |
|                                                          | Term Credit Impact Meter:                 | |
|                                                          | [============================] 18/18 Max  | |
|                                                          | Current: 14 Cr | Adding: 4 Cr | Left: 0 Cr| |
|                                                          |-------------------------------------------| |
|                                                          | [ CONFIRM & SUBMIT REGISTRATION (Atomic) ]| |
|                                                          | (Guarded against race conditions)         | |
|                                                          +-------------------------------------------+ |
+--------------------------------------------------------------------------------------------------------+
```

---

## Screen 4: Official Verified Registration Confirmation Slip

* **Implementation Component**: [`client/src/components/registration/PrintableRegistrationSlip.jsx`](../client/src/components/registration/PrintableRegistrationSlip.jsx)
* **User Persona**: Student & Academic Registrar
* **Core Objective**: University-grade proof of enrollment with barcode verification, timestamps, and registrar attestation.

### Component Breakdown
1. **Institutional Header**: Official crest, university title (*Emedley Institute of Technology*), and Registrar office designation.
2. **Verification & Barcode Block**: Unique alphanumeric reference code (`REG-2026-X892A`), issue timestamp, and machine-readable barcode strip.
3. **Student Profile Section**: Student Name (*Alex Mercer*), ID (*STU-2026-0842*), Major, Year, and Advisor.
4. **Registered Schedule Table**: Complete list of approved courses, meeting rooms, timings, and credit weights summing to 18.0 credits.
5. **Attestation & Seal**: Official registrar verification statement, security seal, and authorized signature block.
6. **Print Styling**: Styled with `@media print` rules to strip browser UI and print cleanly onto standard letter/A4 paper.

### Monospace ASCII Wireframe

```text
+--------------------------------------------------------------------------------------------------------+
| [✓] Official Registration Confirmation                       [ (Printer) Print Slip ]   [ X Close ]    |
+--------------------------------------------------------------------------------------------------------+
|                                                                                                        |
|                       ==================================================                               |
|                                EMEDLEY INSTITUTE OF TECHNOLOGY                                         |
|                       Office of the University Registrar | Enrollments                                 |
|                                                                                                        |
|                            OFFICIAL COURSE REGISTRATION SLIP                                           |
|                                FALL SEMESTER 2026 - 2027                                               |
|                       ==================================================                               |
|                                                                                                        |
|  +--------------------------------------------------------------------------------------------------+  |
|  | REGISTRATION REFERENCE: REG-2026-X892A                   |||||| | |||| ||| ||||||| ||| |||||||| |  |
|  | Date Issued: October 26, 2026 • 10:45 AM UTC            (Simulated Verification Barcode)         |  |
|  +--------------------------------------------------------------------------------------------------+  |
|                                                                                                        |
|  STUDENT DETAILS:                                                                                      |
|  Name:       Alex Mercer                         Student ID:   STU-2026-0842                           |
|  Department: Computer Science & Engineering      Program:      B.S. Computer Science                   |
|  Current Yr: Junior (3rd Year)                   Academic Adv: Dr. Alan Kay                            |
|                                                                                                        |
|  CONFIRMED ENROLLED SCHEDULE:                                                                          |
|  ----------------------------------------------------------------------------------------------------  |
|  CODE    | TITLE                            | CREDITS | INSTRUCTOR       | TIMINGS        | ROOM       |
|  --------+----------------------------------+---------+------------------+----------------+------------|
|  CS301   | Operating Systems Principles     | 4.0 Cr  | Dr. Linus T.     | Tue/Thu 10:00  | TR-104     |
|  CS305   | Advanced Database Systems        | 4.0 Cr  | Dr. Edgar Codd   | Mon/Wed 14:00  | DB-302     |
|  CS204   | Data Structures & Algorithms     | 4.0 Cr  | Dr. Ada Lovelace | Mon/Wed 11:30  | SH-210     |
|  MATH201 | Discrete Mathematics             | 3.0 Cr  | Dr. L. Euler     | Mon/Wed 09:00  | MH-101     |
|  CS210   | Computer Networks                | 3.0 Cr  | Dr. Vint Cerf    | Fri 14:00      | NET-01     |
|  ----------------------------------------------------------------------------------------------------  |
|  TOTAL REGISTERED SEMESTER CREDITS: 18.0 CREDITS (MAXIMUM LIMIT REACHED)                               |
|                                                                                                        |
|  ATTESTATION & REGISTRAR VALIDATION:                                                                   |
|  This document serves as the official university certificate of enrollment for the indicated semester.  |
|                                                                                                        |
|  [ OFFICIAL UNIVERSITY SEAL ]                      ___________________________________________         |
|  Verified & Recorded Electronically                Office of the University Registrar Signature        |
|  Emedley Academic Registry                         Dated: October 26, 2026                             |
+--------------------------------------------------------------------------------------------------------+
```

---

## Screen 5: Administrator Real-Time Analytics & Waitlist Management Console

* **Route**: `/admin`
* **Implementation Component**: [`client/src/pages/admin/AdminDashboard.jsx`](../client/src/pages/admin/AdminDashboard.jsx) & [`WaitlistManagementPage.jsx`](../client/src/pages/admin/WaitlistManagementPage.jsx)
* **User Persona**: Sarah Lin (University Registrar / Administrator)
* **Core Objective**: Monitor campus-wide seat utilization, identify department bottlenecks, and promote waitlisted students with synchronized cross-tab updates.

### Component Breakdown
1. **Administrative Status Bar**: Live registration window toggle (`OPEN`) and one-click *Export Master CSV* reporting.
2. **KPI Stat Cards**:
   * *Total Students*: `128 Students` active.
   * *Seat Utilization*: Global campus occupancy rate (`84% Occupied`, `420 / 500 Seats`).
   * *Active Registrations*: Total confirmed class bookings (`384 Active Units`).
   * *Queued Waitlists*: Pending student applications (`18 Students Queued`).
3. **Department Demand Meter**: Visual breakdown of seat demand across Computer Science (86%), Electrical Engineering (73%), and Mathematics (94% - Critical Demand).
4. **Priority Waitlist Queue Table**: Real-time queue positions (`Queue #1`, `Queue #2`), student metadata, and the **`[ Allocate Seat & Enroll ]`** action button, which enrolls the student and synchronizes across student devices via `BroadcastChannel`.

### Monospace ASCII Wireframe

```text
+--------------------------------------------------------------------------------------------------------+
| [EM] EMEDLEY ADMIN   Overview   Courses   Students   Registrations   Waitlists   Settings   [Admin Lin v]  |
+--------------------------------------------------------------------------------------------------------+
|                                                                                                        |
|  +--------------------------------------------------------------------------------------------------+  |
|  | Administrative Management & Academic Oversight                       [ Export Master CSV ]      |  |
|  | System Status: REGISTRATION WINDOW OPEN | Fall Semester 2026 • 84% Campus Capacity Utilized       |  |
|  +--------------------------------------------------------------------------------------------------+  |
|                                                                                                        |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
|  | (Users) Total      |  | (Book) 84% Occupied|  | (Check) Confirmed  |  | (Clock) In Queue   |        |
|  | 128 Students       |  | 420 / 500 Seats    |  | 384 Registrations  |  | 18 Students        |        |
|  | active accounts    |  | total capacity     |  | processed to date  |  | waiting list pool  |        |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+        |
|                                                                                                        |
|  +--------------------------------------------------------------------------------------------------+  |
|  | Department Capacity vs Active Enrollment Breakdown                                               |  |
|  |  Cap  [==== Enrolled ====] [.... Open ....]                                                      |  |
|  |  CS   [======================================........] 190 / 220 (86%)                          |  |
|  |  EE   [================================..............] 110 / 150 (73%)                          |  |
|  |  MATH [==========================================....]  85 /  90 (94% - CRITICAL DEMAND)        |  |
|  |  DS   [==================............................]  35 /  40 (87%)                           |  |
|  +--------------------------------------------------------------------------------------------------+  |
|                                                                                                        |
|  +--------------------------------------------------------------------------------------------------+  |
|  | Priority Waiting List Queue & Promotion Desk                              Filter: [ All Courses v ]|  |
|  |--------------------------------------------------------------------------------------------------|  |
|  | QUEUE # | STUDENT NAME  | ID       | COURSE CODE | ENROLLED/CAP | APPLIED DATE | ACTION             |  |
|  |---------+---------------+----------+-------------+--------------+--------------+--------------------|  |
|  | Pos #1  | Maya Chen     | STU-0912 | CS402       | 30 / 30 FULL | Oct 25 09:12 | [ Allocate & Enroll|  |
|  | Pos #2  | Jordan Hayes  | STU-0421 | CS402       | 30 / 30 FULL | Oct 25 11:30 | [ Position #2 ]    |  |
|  | Pos #1  | David Kim     | STU-1102 | CS301       | 29 / 30 OPEN | Oct 26 08:15 | [ Allocate & Enroll|  |
|  | Pos #1  | Elena Rostova | STU-0784 | MATH301     | 30 / 30 FULL | Oct 26 10:04 | [ Allocate & Enroll|  |
|  +--------------------------------------------------------------------------------------------------+  |
+--------------------------------------------------------------------------------------------------------+
```

---

## 📋 Summary Table for Documentation

| Screen # | Screen Name | Route / Component | Primary User | Core Invariant Highlighted |
|:---:|:---|:---|:---|:---|
| **1** | **Student Dashboard** | `/dashboard` | Student (`Alex Mercer`) | Credit ceiling enforcement (18 max) & Recharts distribution |
| **2** | **Course Catalogue** | `/courses` | Student | Prerequisite transcript verification & seat capacity meters |
| **3** | **Cart & Validation** | `/cart` | Student | 3-point atomic pre-flight check before seat allocation |
| **4** | **Printable Slip** | `PrintableRegistrationSlip` | Student / Registrar | Official tamper-evident enrollment slip with verification barcode |
| **5** | **Admin Console** | `/admin` | Administrator (`Sarah Lin`) | Campus-wide analytics & synchronized waitlist promotion |
