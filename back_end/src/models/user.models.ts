import { pool } from "../config/db";

export const crearUsuarios = async (
    nombre:string,
    direccion: string,
    correo: string,
    password: string,
    rol_id: number = 1
) => {
    const sql = `
    INSERT INTO usuarios (nombre,direccion,correo,password,rol_id)
    VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
        nombre,
        direccion,  
        correo,
        password,
        rol_id
    ])
    return result;
};

export const buscarUsuariosPorCorreo = async (correo: string) => {
    const sql = `SELECT * FROM usuarios WHERE correo = ?`;
    const [rows]: any = await pool.execute(sql  , [correo]);
    return rows[0];
};
export const ObtenerUsuarioId= async(id: number) => {
    const sql = `SELECT * FROM usuarios WHERE id = ?`;
    const [rows]: any = await pool.execute(sql, [id]);
    return rows[0];
}


export const ActualizarUsuario = async (
    id: number,
    nombre: string,
    direccion: string,
) =>  {
    await pool.query(
        `UPDATE usuarios SET nombre = ?, direccion = ? WHERE id = ?`,
        [nombre,direccion,id]
    );
}