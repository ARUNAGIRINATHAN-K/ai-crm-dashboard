import dotenv from 'dotenv';
// Ensure environment variables are loaded immediately at startup
dotenv.config();

import app from './app';
import { connectDB } from './config/db';

// Listen to uncaught exceptions globally
process.on('uncaughtException', (err: Error) => {
  console.error('CRITICAL: UNCAUGHT EXCEPTION! System shutting down...');
  console.error(err.stack || err.message);
  process.exit(1);
});

// Establish database connection
connectDB();

// Fetch PORT environment variable
const PORT = process.env.PORT || 5000;

// Start server listener
const server = app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT} in [${process.env.NODE_ENV}] mode`);
});

// Listen to unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('CRITICAL: UNHANDLED REJECTION! Shutting down server safely...');
  console.error(err?.stack || err?.message || err);
  server.close(() => {
    process.exit(1);
  });
});
