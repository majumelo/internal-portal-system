import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth-router.js';
import userRouter from './routes/user-router.js';
import categoryRouter from './routes/category-router.js';
import requestRouter from './routes/request-router.js';
import historyRouter from './routes/history-router.js';
import auth from './middlewares/auth.js';
import requirePerfil from './middlewares/role.js';
import { notFound, errorHandler } from './middlewares/error-handler.js';
import pool from './config/db.js';

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const corsOptions = {
  origin: function (origin, callback) {
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

app.use('/api/auth', authRouter);
app.use('/api/user', auth, requirePerfil('ATENDENTE'), userRouter);
app.use('/api/category', auth, categoryRouter);
app.use('/api/request', auth, requestRouter);
app.use('/api/history', auth, historyRouter);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 3333);

try {
  await pool.$connect();
  app.listen(port, () => {
    console.log(`API pronta na porta ${port}; conexão com PostgreSQL confirmada.`);
  });
} catch (error) {
  console.error('Não foi possível conectar ao PostgreSQL:', error.message);
  process.exitCode = 1;
  await pool.$disconnect();
}
