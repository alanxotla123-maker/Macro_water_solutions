import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { buscarUsuariosPorCorreo, crearUsuarios, ActualizarUsuario } from '../models/user.models';
import { pool } from '../config/db';

// 1. REGISTRO (Con dirección automática)
export const register = async (req: Request, res: Response) => {
    try {
        // Ignoramos 'direccion' del req.body porque la pondremos automática
        const { nombre, correo, password } = req.body;
        
        // VALOR POR DEFECTO ACORDADO
        const direccionDefault = "Dirección no ingresada";

        const hash = await bcrypt.hash(password, 10);
        
        // Enviamos los datos al modelo
        await crearUsuarios(nombre, direccionDefault, correo, hash);
        
        res.status(201).json({ message: 'Usuario creado con éxito' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error en registro', error: error.message });
    }
};

// 2. LOGIN (Enviando la dirección al frontend)
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
                nombre: usuario.nombre || "Usuario",
                correo: usuario.correo,
                direccion: usuario.direccion, // Aquí llegará "Dirección no ingresada" la primera vez
                rol: usuario.rol_id === 1 ? 'admin' : 'user'
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error en servidor', error: error.message });
    }
};

// 3. OBTENER PERFIL
export const ObtenerPerfil = async (req: any, res: any) => {
    try {
        const userId = req.params.id;
        const [rows]: any = await pool.execute(
            "SELECT id, nombre, correo, direccion, rol_id FROM usuarios WHERE id = ?", 
            [userId]
        );
        
        if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
        
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};export const ActualizarDireccion = async (req: any, res: any) => {
    try {
        // ERROR 1 CORREGIDO: El ID viene de req.params.id directamente
        const id = req.params.id; 
        const { direccion } = req.body;

        if (!direccion) {
            return res.status(400).json({ message: "La dirección es requerida" });
        }

        // ERROR 2 CORREGIDO: Sintaxis SQL correcta: UPDATE tabla SET columna = ? WHERE id = ?
        const [result]: any = await pool.execute(
            "UPDATE usuarios SET direccion = ? WHERE id = ?", 
            [direccion, id]
        );

        // Verificamos si realmente se actualizó alguien
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Dirección guardada con éxito", direccion });

    } catch (error: any) {
        // Esto te dirá el error real en la consola si algo falla
        console.error("Error en SQL:", error.message);
        res.status(500).json({ error: error.message });
    }
}
// 4. ACTUALIZAR PERFIL (Lo que faltaba para meter la dirección después)
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id, nombre, direccion } = req.body;

        if (!id || !nombre || !direccion) {
            return res.status(400).json({ message: "Faltan datos para actualizar" });
        }

        await ActualizarUsuario(id, nombre, direccion);
        
        res.json({ message: "Perfil actualizado correctamente", direccion });
    } catch (error: any) {
        res.status(500).json({ message: "Error al actualizar", error: error.message });
    }
    // Asegúrate de que esto esté al final de tu archivo si usas require en las rutas
module.exports = {
    register,
    login,
    ObtenerPerfil,
    ActualizarDireccion,
    updateProfile
};
};