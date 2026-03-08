import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    // En Namecheap el host SIEMPRE es localhost
    host: process.env.DB_HOST || 'localhost', 
    
    // Tu usuario de cPanel (verifica si es macrsebe_alan o macrsebe_admin)
    user: process.env.DB_USER || 'macrsebe_alan', 
    
    // La contraseña que pusiste en "MySQL Databases" de cPanel
    password: process.env.DB_PASSWORD || 'Salinas978.', 
    
    // ESTE ES EL CAMBIO CLAVE: El nombre real en tu hosting
    database: process.env.DB_NAME || 'macrsebe_macrowatersolutions', 
    
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10
});