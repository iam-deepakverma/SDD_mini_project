import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { Course } from './models/Course.js';
import { seedDatabase } from '../scripts/seed.js';

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is fresh / empty
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      console.log('🌱 [Server] Empty database detected. Auto-seeding initial academic records...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 [Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      // console.log(`🔗 [API] Health check available at: http://localhost:${PORT}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n🛑 [Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ [Server] Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();
