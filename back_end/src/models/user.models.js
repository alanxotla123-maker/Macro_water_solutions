const { pool } = require("../config/db");

const crearUsuarios = async (nombre, direccion, correo, password, rol_id = 2) => {
    const sql = `INSERT INTO usuarios (nombre, direccion, correo, password, rol_id) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [nombre, direccion, correo, password, rol_id]);
    return result;
};

const buscarUsuariosPorCorreo = async (correo) => {
    const sql = `SELECT * FROM usuarios WHERE correo = ?`;
    const [rows] = await pool.execute(sql, [correo]);
    return rows[0];
};

const ActualizarUsuario = async (id, nombre, direccion) => {
    await pool.execute(
        `UPDATE usuarios SET nombre = ?, direccion = ? WHERE id = ?`,
        [nombre, direccion, id]
    );
};

module.exports = { crearUsuarios, buscarUsuariosPorCorreo, ActualizarUsuario };