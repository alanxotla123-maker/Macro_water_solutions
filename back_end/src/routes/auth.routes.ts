import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// Rutas finales: /api/auth/register y /api/auth/login
router.post('/register', register);
router.post('/login', login);

export default router;