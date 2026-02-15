import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {
  crearUsuarios,
  buscarUsuariosPorCorreo
  
} from '../models/user.models';

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
