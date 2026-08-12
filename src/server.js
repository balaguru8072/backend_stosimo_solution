import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import serviceRoutes from './routes/serviceRoute.js';
import serviceMessageRoutes from './routes/serviceMessageRoute.js';
import projectRoutes from './routes/projectRoute.js';
import jobRoutes from './routes/jobRoute.js';
import jobApplicationRoutes from './routes/jobApplicationRoute.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();
connectDB();

const app = express();

// 1. CORS FIRST - Idhu than first-a irukkanum
app.use(cors({ 
  origin: [
    'http://localhost:3001', 
    'http://localhost:3000',
    'https://stosimo.com',
    'https://admin.stosimo.com',
    'https://server.stosimo.com',
    'https://www.stosimo.com'
  ],
  credentials: true 
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ success: true, message: '🔥 Stosimo solution API Running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/services', serviceRoutes);
app.use('/api/service-messages', serviceMessageRoutes);
app.use('/api/projects', projectRoutes); 
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT}`));