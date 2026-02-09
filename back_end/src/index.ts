import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
const app = express();

app.use(cors({
  origin: '*',      // 🔥 permitir todo en dev
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(3000, () => {
  console.log('Servidor activo en puerto 3000');
});
