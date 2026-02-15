import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  crearUsuarios,
  buscarUsuariosPorCorreo
} from '../models/user.models';


// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, direccion, correo, password } = req.body as {
      nombre: string;
      direccion: string;
      correo: string;
      password: string;
    };

    if (!nombre || !direccion || !correo || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const existe = await buscarUsuariosPorCorreo(correo);
    if (existe) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    await crearUsuarios(nombre, direccion, correo, hash);

    res.status(201).json({ message: 'Usuario creado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { correo, password } = req.body as {
      correo: string;
      password: string;
    };

    if (!correo || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const usuario = await buscarUsuariosPorCorreo(correo);

    if (!usuario) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Crear token
    const token = jwt.sign(
      { id: usuario.id },
      "secreto_super_seguro",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
