import { Router } from 'express';
// Importamos con require porque el controlador usa module.exports
const { register, login } = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;