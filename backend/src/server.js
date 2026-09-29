import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import userRouter from './routes/user-router.js';

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://10.16.10.206:5173',
      'http://10.16.10.206:3000',
      'http://10.16.32.6:5173',
      'http://10.16.32.6:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/api/user', userRouter);
