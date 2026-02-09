import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

const app = express();

// CORS (modo desarrollo)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Leer JSON del body
app.use(express.json());

// Ruta raíz (para evitar "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Servidor Aqua Clean activo en localhost');
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Levantar servidor
app.listen(3000, () => {
  console.log('Servidor activo en puerto 3000');
});
