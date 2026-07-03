import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorMiddleware';
import { AppError } from './utils/appError';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import leadRoutes from './routes/lead.routes';
import taskRoutes from './routes/task.routes';
import noteRoutes from './routes/note.routes';
import dashboardRoutes from './routes/dashboard.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

// Enable Helmet for HTTP security headers
app.use(helmet());

// Configure Cross-Origin Resource Sharing
app.use(cors({
  origin: '*', // We can restrict this in production when staging is set up
  credentials: true,
}));

// Setup logging based on environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parse incoming request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'System CRM API is operational.',
    timestamp: new Date().toISOString(),
  });
});

// Simulated Error API for global handling validation
app.get('/api/test-error', (_req, _res, next) => {
  next(new AppError('Operational simulation error caught and handled successfully.', 418));
});

// Register Application Routers
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all route to capture unhandled routes
app.all('*', (req, _res, next) => {
  next(new AppError(`Endpoint ${req.originalUrl} not found on this server.`, 404));
});

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

export default app;
