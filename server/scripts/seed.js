import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Registration } from '../src/models/Registration.js';
import { Waitlist } from '../src/models/Waitlist.js';
import { SystemSetting } from '../src/models/SystemSetting.js';
import { generateRegistrationReference } from '../src/utils/referenceGenerator.js';

export const seedDatabase = async () => {
  try {
    console.log('🌱 [Seed] Starting database seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Registration.deleteMany({}),
      Waitlist.deleteMany({}),
      SystemSetting.deleteMany({}),
    ]);

    console.log('🧹 [Seed] Existing records cleared.');

    // 1. Create System Settings
    const settings = await SystemSetting.create({
      semesterName: 'Fall Semester 2026',
      academicYear: '2026-2027',
      currentSemester: 5,
      registrationStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // opened 7 days ago
      registrationEnd: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),  // closes in 21 days
      maxCredits: 18,
      registrationOpen: true,
      waitingListEnabled: true,
      allowCancellation: true,
      cancellationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    console.log('⚙️ [Seed] System settings created.');

    // 2. Create Foundational Courses (Prerequisites)
    const cs101 = await Course.create({
      courseCode: 'CS101',
      title: 'Introduction to Computer Science & Python',
      description: 'Foundations of computational problem solving, algorithmic thinking, control flow, functions, and data structures using Python.',
      credits: 4,
      facultyName: 'Dr. Alan Turing',
      facultyEmail: 'turing@emedley.edu',
      department: 'Computer Science',
      semester: 1,
      prerequisites: [],
      capacity: 60,
      enrolledCount: 55,
      schedule: { days: ['Mon', 'Wed'], time: '09:00 AM - 10:30 AM', room: 'Turing Hall A-101' },
      category: 'Core',
      isActive: true,
    });

    const math201 = await Course.create({
      courseCode: 'MATH201',
      title: 'Discrete Mathematics & Logic',
      description: 'Propositional calculus, predicate logic, set theory, graph theory, combinatorics, and algebraic structures for computing.',
      credits: 3,
      facultyName: 'Dr. John Nash',
      facultyEmail: 'nash@emedley.edu',
      department: 'Mathematics',
      semester: 2,
      prerequisites: [],
      capacity: 50,
      enrolledCount: 42,
      schedule: { days: ['Tue', 'Thu'], time: '11:00 AM - 12:30 PM', room: 'Euler Auditorium' },
      category: 'Core',
      isActive: true,
    });

    const cs201 = await Course.create({
      courseCode: 'CS201',
      title: 'Data Structures & Algorithms',
      description: 'Linear & tree structures, balanced search trees, heaps, graph traversal, greedy techniques, dynamic programming, and complexity analysis.',
      credits: 4,
      facultyName: 'Dr. Barbara Liskov',
      facultyEmail: 'liskov@emedley.edu',
      department: 'Computer Science',
      semester: 2,
      prerequisites: [cs101._id],
      capacity: 50,
      enrolledCount: 48,
      schedule: { days: ['Mon', 'Wed', 'Fri'], time: '10:00 AM - 11:00 AM', room: 'Liskov Lab 202' },
      category: 'Core',
      isActive: true,
    });

    // 3. Create Semester 5 Target Courses
    const cs301 = await Course.create({
      courseCode: 'CS301',
      title: 'Database Management Systems',
      description: 'Relational model, relational algebra, SQL, normal forms, transaction ACID properties, concurrency control, and indexing strategies.',
      credits: 4,
      facultyName: 'Dr. Edgar Codd',
      facultyEmail: 'codd@emedley.edu',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [cs201._id],
      capacity: 40,
      enrolledCount: 28,
      schedule: { days: ['Mon', 'Wed'], time: '11:30 AM - 01:00 PM', room: 'Block C-301' },
      category: 'Core',
      isActive: true,
    });

    const cs302 = await Course.create({
      courseCode: 'CS302',
      title: 'Operating Systems & Concurrency',
      description: 'Process management, threads, interprocess communication, CPU scheduling, synchronization primitives, deadlocks, memory virtualization, and file systems.',
      credits: 4,
      facultyName: 'Dr. Andrew Tanenbaum',
      facultyEmail: 'tanenbaum@emedley.edu',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [cs201._id],
      capacity: 30,
      enrolledCount: 30, // FULL COURSE! Demonstrates waiting list!
      schedule: { days: ['Tue', 'Thu'], time: '02:00 PM - 03:30 PM', room: 'Unix Lab 104' },
      category: 'Core',
      isActive: true,
    });

    const cs305 = await Course.create({
      courseCode: 'CS305',
      title: 'Software Engineering & System Architecture',
      description: 'Agile methodologies, UML modeling, clean architecture patterns, microservices, automated testing, CI/CD pipelines, and software quality metrics.',
      credits: 3,
      facultyName: 'Dr. Margaret Hamilton',
      facultyEmail: 'hamilton@emedley.edu',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [cs201._id],
      capacity: 45,
      enrolledCount: 24,
      schedule: { days: ['Wed', 'Fri'], time: '01:30 PM - 03:00 PM', room: 'Apollo Lecture Hall' },
      category: 'Core',
      isActive: true,
    });

    const cs310 = await Course.create({
      courseCode: 'CS310',
      title: 'Computer Networks & Internet Protocols',
      description: 'OSI/TCP-IP models, packet switching, routing algorithms, transport layer protocols, congestion control, socket programming, and network security.',
      credits: 3,
      facultyName: 'Dr. Vint Cerf',
      facultyEmail: 'cerf@emedley.edu',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [cs201._id],
      capacity: 40,
      enrolledCount: 22,
      schedule: { days: ['Tue', 'Thu'], time: '09:30 AM - 11:00 AM', room: 'Block B-105' },
      category: 'Core',
      isActive: true,
    });

    const cs420 = await Course.create({
      courseCode: 'CS420',
      title: 'Artificial Intelligence & Machine Learning',
      description: 'Supervised & unsupervised learning, neural networks, backpropagation, decision trees, reinforcement learning, and ethical considerations in AI.',
      credits: 4,
      facultyName: 'Dr. Geoffrey Hinton',
      facultyEmail: 'hinton@emedley.edu',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [cs201._id, math201._id],
      capacity: 35,
      enrolledCount: 29,
      schedule: { days: ['Mon', 'Fri'], time: '03:30 PM - 05:00 PM', room: 'Neural Lab 402' },
      category: 'Elective',
      isActive: true,
    });

    const cs450 = await Course.create({
      courseCode: 'CS450',
      title: 'Cloud Architecture & Distributed DevOps',
      description: 'Containers, Kubernetes orchestration, serverless microservices, cloud storage patterns, distributed caching, and Terraform infrastructure as code.',
      credits: 3,
      facultyName: 'Dr. Werner Vogels',
      facultyEmail: 'vogels@emedley.edu',
      department: 'Computer Science',
      semester: 5,
      prerequisites: [cs305._id],
      capacity: 35,
      enrolledCount: 15,
      schedule: { days: ['Tue', 'Thu'], time: '03:45 PM - 05:15 PM', room: 'Cloud Studio' },
      category: 'Elective',
      isActive: true,
    });

    console.log('📚 [Seed] 9 courses created with realistic prerequisite chains.');

    // 4. Create Admin Account
    const admin = await User.create({
      name: 'Sarah Lin',
      email: 'admin@emedley.edu',
      password: 'Password123!',
      role: 'admin',
      department: 'Academic Registry & Examinations',
      program: 'Faculty Dean & Registrar',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    console.log('👤 [Seed] Admin account created: admin@emedley.edu / Password123!');

    // 5. Create Student 1 (Alex Mercer - Eligible for CS301, CS305, etc.)
    const alex = await User.create({
      name: 'Alex Mercer',
      email: 'alex.student@emedley.edu',
      password: 'Password123!',
      studentId: 'STU-2026-001',
      role: 'student',
      department: 'Computer Science & Engineering',
      program: 'B.Tech in Computer Science',
      currentSemester: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      completedCourses: [
        {
          course: cs101._id,
          courseCode: 'CS101',
          title: 'Introduction to Computer Science & Python',
          grade: 'A',
          credits: 4,
          completedSemester: 1,
        },
        {
          course: math201._id,
          courseCode: 'MATH201',
          title: 'Discrete Mathematics & Logic',
          grade: 'A',
          credits: 3,
          completedSemester: 2,
        },
        {
          course: cs201._id,
          courseCode: 'CS201',
          title: 'Data Structures & Algorithms',
          grade: 'A',
          credits: 4,
          completedSemester: 2,
        },
      ],
    });

    // Student 2 (Maya Chen - Sophomore missing CS201 prerequisite)
    const maya = await User.create({
      name: 'Maya Chen',
      email: 'maya.student@emedley.edu',
      password: 'Password123!',
      studentId: 'STU-2026-002',
      role: 'student',
      department: 'Computer Science & Engineering',
      program: 'B.Tech in Computer Science',
      currentSemester: 3,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      completedCourses: [
        {
          course: cs101._id,
          courseCode: 'CS101',
          title: 'Introduction to Computer Science & Python',
          grade: 'B+',
          credits: 4,
          completedSemester: 1,
        },
      ],
    });

    // Student 3 (Jordan Hayes - Senior near max credit limit)
    const jordan = await User.create({
      name: 'Jordan Hayes',
      email: 'jordan.student@emedley.edu',
      password: 'Password123!',
      studentId: 'STU-2026-003',
      role: 'student',
      department: 'Computer Science & Engineering',
      program: 'B.Tech in Computer Science',
      currentSemester: 7,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      completedCourses: [
        {
          course: cs101._id,
          courseCode: 'CS101',
          title: 'Introduction to Computer Science & Python',
          grade: 'A',
          credits: 4,
          completedSemester: 1,
        },
        {
          course: cs201._id,
          courseCode: 'CS201',
          title: 'Data Structures & Algorithms',
          grade: 'A',
          credits: 4,
          completedSemester: 2,
        },
        {
          course: math201._id,
          courseCode: 'MATH201',
          title: 'Discrete Mathematics & Logic',
          grade: 'B+',
          credits: 3,
          completedSemester: 2,
        },
        {
          course: cs305._id,
          courseCode: 'CS305',
          title: 'Software Engineering & System Architecture',
          grade: 'A',
          credits: 3,
          completedSemester: 4,
        },
      ],
    });

    console.log('🎓 [Seed] 3 Demo Students created (Alex Mercer, Maya Chen, Jordan Hayes).');

    // 6. Create Initial Active Registrations for Alex (CS305 - 3 credits)
    const ref1 = generateRegistrationReference('REG');
    await Registration.create({
      registrationReference: ref1,
      student: alex._id,
      course: cs305._id,
      semester: 5,
      academicYear: '2026-2027',
      creditsAtRegistration: 3,
      status: 'registered',
      registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Create a waitlist entry for Alex on CS302 (the full course)
    await Waitlist.create({
      student: alex._id,
      course: cs302._id,
      semester: 5,
      queuePosition: 1,
      status: 'waiting',
      joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    console.log('📝 [Seed] Sample registration and waitlist entry seeded for Alex Mercer.');
    console.log('✅ [Seed] Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ [Seed] Error seeding database:', err);
    throw err;
  }
};

// Execute if run directly
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
