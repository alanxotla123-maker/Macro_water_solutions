import { Router } from 'express';
// Importamos con require porque el controlador usa module.exports
const { register, login , ObtenerPerfil, ActualizarDireccion} = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/perfil/:id', ObtenerPerfil);
router.put('/UpdateD/:id',ActualizarDireccion);
module.exports = router;