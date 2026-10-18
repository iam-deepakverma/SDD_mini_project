import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async (customUri = null) => {
  try {
    const uri = process.env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('[DB] Connected successfully to MongoDB server.');
      return;
    }

    // Fallback to MongoMemoryServer for standalone zero-configuration local run
    console.log('[DB] No external MONGODB_URI provided. Starting zero-setup embedded Mongo instance...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected successfully to embedded MongoDB instance (${memoryUri}).`);
  } catch (error) {
    console.warn(`[DB] Connection to specified URI failed (${error.message}). Falling back to embedded Mongo instance...`);
    try {
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[DB] Connected successfully to embedded MongoDB instance (${memoryUri}).`);
    } catch (fallbackError) {
      console.error('[DB] Failed to initialize embedded MongoDB:', fallbackError);
      throw fallbackError;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('[DB] MongoDB disconnected.');
  } catch (err) {
    console.error('[DB] Error disconnecting from MongoDB:', err);
  }
};
