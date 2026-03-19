const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { buscarUsuariosPorCorreo, crearUsuarios, ActualizarUsuario } = require('../models/user.models');

const register = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await crearUsuarios(nombre, "Dirección no ingresada", correo, hash);
        res.status(201).json({ message: 'Usuario creado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error en registro', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const usuario = await buscarUsuariosPorCorreo(correo);
        if (!usuario) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const match = await bcrypt.compare(password, usuario.password);
        if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET || "secreto", { expiresIn: "1h" });

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                direccion: usuario.direccion,
                rol: usuario.rol_id === 1 ? 'admin' : 'user'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en servidor', error: error.message });
    }
};

module.exports = { register, login };