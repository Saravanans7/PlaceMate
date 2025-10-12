import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';

import { configurePassport } from './lib/passport.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import companyRoutes from './routes/companies.js';
import registrationRoutes from './routes/registrations.js';
import applicationRoutes from './routes/applications.js';
import driveRoutes from './routes/drives.js';
import experienceRoutes from './routes/experiences.js';
import userRoutes from './routes/users.js';
import statsRoutes from './routes/stats.js';
import blacklistRoutes from './routes/blacklist.js';
import { scheduleCronJobs } from './lib/cron.js';
import Registration from './models/Registration.js';
import Drive from './models/Drive.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { createDriveFromRegistration } from './controllers/driveController.js';

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Static uploads (local fallback)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Passport
configurePassport(passport);
app.use(passport.initialize());

// DB connect
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: 'placemate' });
  console.log('MongoDB connected');
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api', applicationRoutes); // contains nested routes
app.use('/api/drives', driveRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
    scheduleCronJobs();
    // On startup, backfill today's drives if missing (non-blocking)
    (async () => {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const regs = await Registration.find({
          driveDate: { $gte: start, $lte: end },
          status: 'open',
        }).populate('company');
        for (const reg of regs) {
          const exists = await Drive.findOne({ registration: reg._id });
          if (!exists) await createDriveFromRegistration(reg);
        }
      } catch (e) {
        console.error('Startup backfill error', e);
      }
    })();
  })
  .catch((err) => {
    console.error('Failed to connect DB', err);
    process.exit(1);
  });
