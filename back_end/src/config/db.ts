import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Salinas978',
    database: 'aqua_clean_pro',
    waitForConnections: true,
    connectionLimit: 10

})