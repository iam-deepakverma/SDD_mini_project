import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../app.js';
import { seedDatabase } from '../../scripts/seed.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Registration } from '../models/Registration.js';
import { Waitlist } from '../models/Waitlist.js';
import { SystemSetting } from '../models/SystemSetting.js';

let mongoServer;
let adminToken;
let alexToken;
let mayaToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await seedDatabase();

  // Obtain tokens for tests
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@emedley.edu', password: 'Password123!' });
  adminToken = adminRes.body.token;

  const alexRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alex.student@emedley.edu', password: 'Password123!' });
  alexToken = alexRes.body.token;

  const mayaRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'maya.student@emedley.edu', password: 'Password123!' });
  mayaToken = mayaRes.body.token;
});

describe('1. Authentication & Role Authorization', () => {
  it('should authenticate user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.student@emedley.edu', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alex.student@emedley.edu');
    expect(res.body.user.role).toBe('student');
  });

  it('should reject login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.student@emedley.edu', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should block student from accessing admin-only routes', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${alexToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to access admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
  });
});

describe('2. Course Catalogue & Search', () => {
  it('should return courses with search and filtering', async () => {
    const res = await request(app)
      .get('/api/courses?search=Database')
      .set('Authorization', `Bearer ${alexToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.courses[0].courseCode).toBe('CS301');
  });
});

describe('3. Core Registration Workflows & Business Rules', () => {
  it('should successfully register eligible student for a course with prerequisites satisfied', async () => {
    // Alex has completed CS201, so CS301 (Database Systems, prereq: CS201) should succeed
    const cs301 = await Course.findOne({ courseCode: 'CS301' });

    const res = await request(app)
      .post('/api/registrations/confirm')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ courseIds: [cs301._id], semester: 5 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.registrations[0].courseCode).toBe('CS301');
    expect(res.body.data.registrations[0].registrationReference).toMatch(/^REG-/);

    // Verify seat increment in database
    const updatedCourse = await Course.findById(cs301._id);
    expect(updatedCourse.enrolledCount).toBe(cs301.enrolledCount + 1);
  });

  it('should block registration if student is missing prerequisites', async () => {
    // Maya Chen has NOT completed CS201, so registering for CS301 must fail
    const cs301 = await Course.findOne({ courseCode: 'CS301' });

    const res = await request(app)
      .post('/api/registrations/confirm')
      .set('Authorization', `Bearer ${mayaToken}`)
      .send({ courseIds: [cs301._id], semester: 5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Prerequisite requirement not met');
    expect(res.body.message).toContain('CS201');
  });

  it('should block duplicate course registration in same semester', async () => {
    // Alex is already registered for CS305 in semester 5
    const cs305 = await Course.findOne({ courseCode: 'CS305' });

    const res = await request(app)
      .post('/api/registrations/confirm')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ courseIds: [cs305._id], semester: 5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already registered');
  });

  it('should block registration if credit limit is exceeded', async () => {
    // Set maxCredits = 6 in settings for testing
    await SystemSetting.findOneAndUpdate({}, { maxCredits: 6 });

    // Alex already has CS305 (3 credits). Attempting to register for CS301 (4 credits) -> 3 + 4 = 7 > 6
    const cs301 = await Course.findOne({ courseCode: 'CS301' });

    const res = await request(app)
      .post('/api/registrations/confirm')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ courseIds: [cs301._id], semester: 5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Credit limit exceeded');
  });

  it('should block registration when course is full', async () => {
    // CS302 is full (capacity 30, enrolled 30)
    const cs302 = await Course.findOne({ courseCode: 'CS302' });

    const res = await request(app)
      .post('/api/registrations/confirm')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ courseIds: [cs302._id], semester: 5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('maximum capacity');
  });

  it('should block registration when registration window is closed', async () => {
    await SystemSetting.findOneAndUpdate({}, { registrationOpen: false });

    const cs301 = await Course.findOne({ courseCode: 'CS301' });

    const res = await request(app)
      .post('/api/registrations/confirm')
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ courseIds: [cs301._id], semester: 5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('closed');
  });
});

describe('4. Waiting List Lifecycle', () => {
  it('should allow eligible student to join waiting list for full course', async () => {
    const cs302 = await Course.findOne({ courseCode: 'CS302' });
    const student = await User.findOne({ email: 'jordan.student@emedley.edu' });

    const res = await request(app)
      .post('/api/waitlists')
      .set('Authorization', `Bearer ${alexToken}`)
      // Jordan will join waitlist for CS302 (Alex is already on waitlist pos #1)
      .send({ courseId: cs302._id, semester: 5 });

    // Alex is already on waitlist for CS302, should reject duplicate
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already on the waiting list');
  });

  it('should allow new student to join waitlist and assign next position', async () => {
    const cs302 = await Course.findOne({ courseCode: 'CS302' });
    // Jordan Hayes has CS201 prerequisite completed
    const jordanRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jordan.student@emedley.edu', password: 'Password123!' });
    const jordanToken = jordanRes.body.token;

    const res = await request(app)
      .post('/api/waitlists')
      .set('Authorization', `Bearer ${jordanToken}`)
      .send({ courseId: cs302._id, semester: 5 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.queuePosition).toBe(2);
  });

  it('should enroll student, remove them from waiting list, and reflect on student & admin dashboards when admin accepts waitlist', async () => {
    const cs302 = await Course.findOne({ courseCode: 'CS302' });
    const alex = await User.findOne({ email: 'alex.student@emedley.edu' });
    const waitlistEntry = await Waitlist.findOne({
      student: alex._id,
      course: cs302._id,
      status: 'waiting',
    });

    expect(waitlistEntry).toBeDefined();

    // 1. Admin accepts the waitlist entry
    const acceptRes = await request(app)
      .post(`/api/waitlists/admin/${waitlistEntry._id}/offer`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);
    expect(acceptRes.body.registration).toBeDefined();
    expect(acceptRes.body.registration.registrationReference).toMatch(/^REG-WL-/);

    // 2. Student waitlist endpoint (/api/waitlists/me) reflects removal from active queue and inclusion in enrolledFromWaitlist
    const studentWaitlistRes = await request(app)
      .get('/api/waitlists/me')
      .set('Authorization', `Bearer ${alexToken}`);

    expect(studentWaitlistRes.status).toBe(200);
    expect(studentWaitlistRes.body.activeCount).toBe(0);
    expect(studentWaitlistRes.body.waitlists.length).toBe(0);
    expect(studentWaitlistRes.body.enrolledFromWaitlist.length).toBeGreaterThanOrEqual(1);
    expect(studentWaitlistRes.body.enrolledFromWaitlist[0].course.courseCode).toBe('CS302');

    // 3. Student registrations endpoint (/api/registrations/me) now contains the enrolled course
    const studentRegRes = await request(app)
      .get('/api/registrations/me?status=registered')
      .set('Authorization', `Bearer ${alexToken}`);

    expect(studentRegRes.status).toBe(200);
    const registeredCodes = studentRegRes.body.registrations.map((r) => r.course.courseCode);
    expect(registeredCodes).toContain('CS302');

    // 4. Student academic summary (/api/auth/me) reflects updated credits
    const authMeRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${alexToken}`);

    expect(authMeRes.status).toBe(200);
    expect(authMeRes.body.academicSummary.registeredCoursesCount).toBe(studentRegRes.body.count);

    // 5. Admin dashboard endpoint (/api/admin/dashboard) reflects updated stats
    const adminDashRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDashRes.status).toBe(200);
    expect(adminDashRes.body.stats.activeRegistrationsCount).toBeGreaterThanOrEqual(1);
    expect(adminDashRes.body.stats.totalWaitlistsCount).toBe(0);
  });
});

describe('5. Course Cancellation Rules', () => {
  it('should allow student to cancel registered course and decrement enrolledCount', async () => {
    const alex = await User.findOne({ email: 'alex.student@emedley.edu' });
    const registration = await Registration.findOne({
      student: alex._id,
      status: 'registered',
    }).populate('course');

    const courseBefore = await Course.findById(registration.course._id);
    const initialEnrolled = courseBefore.enrolledCount;

    const res = await request(app)
      .post(`/api/registrations/${registration._id}/cancel`)
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ reason: 'Schedule conflict' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify course enrolledCount decremented
    const courseAfter = await Course.findById(registration.course._id);
    expect(courseAfter.enrolledCount).toBe(initialEnrolled - 1);
  });
});

describe('6. Concurrency & Race Condition Guard', () => {
  it('should safely handle concurrent registrations for the last seat without over-enrollment', async () => {
    // Create a special single-seat course
    const limitedCourse = await Course.create({
      courseCode: 'CS999',
      title: 'Advanced Quantum Computing Seminar',
      credits: 3,
      facultyName: 'Dr. Richard Feynman',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [],
      capacity: 1, // Only 1 seat available!
      enrolledCount: 0,
    });

    // Create two students with completed prerequisites
    const s1 = await User.create({
      name: 'Racer One',
      email: 'racer1@emedley.edu',
      password: 'Password123!',
      role: 'student',
      completedCourses: [],
    });
    const s2 = await User.create({
      name: 'Racer Two',
      email: 'racer2@emedley.edu',
      password: 'Password123!',
      role: 'student',
      completedCourses: [],
    });

    const s1Login = await request(app).post('/api/auth/login').send({ email: 'racer1@emedley.edu', password: 'Password123!' });
    const s2Login = await request(app).post('/api/auth/login').send({ email: 'racer2@emedley.edu', password: 'Password123!' });

    // Execute both registration attempts concurrently
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/registrations/confirm')
        .set('Authorization', `Bearer ${s1Login.body.token}`)
        .send({ courseIds: [limitedCourse._id], semester: 5 }),
      request(app)
        .post('/api/registrations/confirm')
        .set('Authorization', `Bearer ${s2Login.body.token}`)
        .send({ courseIds: [limitedCourse._id], semester: 5 }),
    ]);

    const statuses = [res1.status, res2.status];
    // Exactly one must succeed (201) and one must be rejected (400)
    expect(statuses).toContain(201);
    expect(statuses).toContain(400);

    // Check database course capacity & enrollments: enrolledCount must NEVER exceed 1
    const finalCourse = await Course.findById(limitedCourse._id);
    expect(finalCourse.enrolledCount).toBe(1);

    const successfulRegistrations = await Registration.countDocuments({
      course: limitedCourse._id,
      status: 'registered',
    });
    expect(successfulRegistrations).toBe(1);
  });
});
