import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using Mongoose.
 * Listens to connection event hooks to log database state.
 */
export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-crm-dashboard';

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection failure: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  // Handle connection events post-initialization
  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] Disconnected from MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] Runtime error: ${err.message}`);
  });
};
