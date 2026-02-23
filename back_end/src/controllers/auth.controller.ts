import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { buscarUsuariosPorCorreo, crearUsuarios } from '../models/user.models';

export const register = async (req: Request, res: Response) => {
    try {
        const { nombre, direccion, correo, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await crearUsuarios(nombre, direccion, correo, hash);
        res.status(201).json({ message: 'Usuario creado con éxito' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error en registro', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { correo, password } = req.body;
        const usuario = await buscarUsuariosPorCorreo(correo);

        if (!usuario) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const match = await bcrypt.compare(password, usuario.password);
        if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const token = jwt.sign({ id: usuario.id }, "secreto_super_seguro", { expiresIn: "1h" });

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol_id === 1 ? 'admin' : 'user'
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error en servidor', error: error.message });
    }
};